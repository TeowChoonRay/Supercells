// src/server/services/webScraper.ts
import { load } from 'cheerio';

interface ScrapedContent {
  title: string;
  text: string;
  url: string;
}

/**
 * Scrapes the main content from a website URL
 */
export async function scrapeWebsite(url: string): Promise<ScrapedContent[]> {
  try {
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Fetch the website content
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);

    // Extract the base URL for resolving relative links
    const parsedUrl = new URL(fullUrl);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

    // Function to clean text
    const cleanText = (text: string) => {
      return text
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Get main page content
    const mainContent: ScrapedContent = {
      title: $('title').text().trim(),
      text: cleanText($('body').text()),
      url: fullUrl,
    };

    // Find important links like About, Products, Services pages
    const importantLinks: ScrapedContent[] = [];
    const relevantPathPatterns = [
      /about/i, /product/i, /service/i, /solution/i, 
      /technology/i, /ai/i, /machine-learning/i, /ml/i, 
      /artificial-intelligence/i, /career/i, /job/i
    ];

    $('a').each((_, element) => {
      const href = $(element).attr('href');
      const linkText = $(element).text().trim();
      
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // Check if the link or link text matches our patterns
      const isRelevant = relevantPathPatterns.some(pattern => 
        pattern.test(href) || (linkText && pattern.test(linkText))
      );

      if (isRelevant) {
        // Resolve relative URLs
        const absoluteUrl = href.startsWith('http') 
          ? href 
          : new URL(href, baseUrl).toString();
        
        // Don't add duplicates
        if (!importantLinks.some(link => link.url === absoluteUrl) && absoluteUrl !== fullUrl) {
          importantLinks.push({
            title: linkText || 'Linked Page',
            text: '', // Will be populated when we follow the link
            url: absoluteUrl,
          });
        }
      }
    });

    // Limit to 3 additional links to avoid too many requests
    const limitedLinks = importantLinks.slice(0, 3);

    // Follow and scrape important links
    const scrapedLinksPromises = limitedLinks.map(async (link) => {
      try {
        const response = await fetch(link.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });

        if (response.ok) {
          const html = await response.text();
          const $link = load(html);
          link.text = cleanText($link('body').text());
        }
      } catch (error) {
        console.error(`Error scraping ${link.url}:`, error);
      }
      return link;
    });

    const scrapedLinks = await Promise.all(scrapedLinksPromises);
    
    // Return the main content and content from important links
    return [mainContent, ...scrapedLinks.filter(link => link.text)];
  } catch (error) {
    console.error(`Error scraping website ${url}:`, error);
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : String(error)}`);
  }
}