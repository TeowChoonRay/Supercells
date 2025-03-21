// src/server/services/openai.ts
import OpenAI from 'openai';
import { env } from '~/env.mjs';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface AIAnalysisResult {
  aiInterestLevel: number; // 0-10 scale
  aiEvidence: string; // Text evidence
  leadScore: number; // 0-10 scale
  isQualified: boolean; // Auto qualification
  industry?: string; // Detected industry
  size?: string; // Estimated company size
  notes: string; // Additional analysis notes
}

/**
 * Analyzes web content using OpenAI to detect AI interest signals
 */
export async function analyzeWebContent(
  companyName: string,
  webContent: { title: string; text: string; url: string }[]
): Promise<AIAnalysisResult> {
  try {
    // Build a context from the scraped content
    const contentSummaries = webContent.map(content => {
      // Truncate text to avoid token limits (roughly 1000 chars per content piece)
      const truncatedText = content.text.length > 1000 
        ? content.text.substring(0, 1000) + '...' 
        : content.text;
      
      return `URL: ${content.url}\nTitle: ${content.title}\nContent: ${truncatedText}\n\n`;
    }).join('');

    // Create the system prompt
    const systemPrompt = `You are an expert lead qualification AI for an AI solutions provider. 
Your task is to analyze the provided web content for company "${companyName}" and determine:

1. AI Interest Level (0-10): How interested this company is in AI/ML technologies
2. Evidence of AI interest: Specific quotes or mentions that indicate AI interest
3. Estimated Lead Score (0-10): Overall potential as a lead based on size, industry, and AI interest
4. Auto-qualification: Whether this lead should be automatically qualified (true/false)
5. Industry detection: Identify the company's industry
6. Company size estimate: Estimate the company size category if possible
7. Analysis notes: Additional observations or insights

Focus on mentions of:
- AI, artificial intelligence, machine learning, ML, data science
- Digital transformation, automation, big data analytics
- Hiring for AI/ML roles
- AI initiatives, projects, or strategic investments
- Technology infrastructure upgrades

Provide your analysis in valid JSON format with these fields:
{
  "aiInterestLevel": number,
  "aiEvidence": string,
  "leadScore": number,
  "isQualified": boolean,
  "industry": string,
  "size": string,
  "notes": string
}`;

    // Create the user message with the web content
    const userMessage = `Here is the web content for company "${companyName}" to analyze:\n\n${contentSummaries}`;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125', // Can upgrade to GPT-4 for better analysis
      temperature: 0.1, // Keep temperature low for consistent analysis
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
    });

    // Parse the response
    const content = response.choices[0]?.message?.content || '';
    
    try {
      const analysis = JSON.parse(content) as AIAnalysisResult;
      
      // Ensure all fields are present with defaults if missing
      return {
        aiInterestLevel: analysis.aiInterestLevel ?? 0,
        aiEvidence: analysis.aiEvidence ?? '',
        leadScore: analysis.leadScore ?? 0,
        isQualified: analysis.isQualified ?? false,
        industry: analysis.industry ?? undefined,
        size: analysis.size ?? undefined,
        notes: analysis.notes ?? '',
      };
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse AI analysis');
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}