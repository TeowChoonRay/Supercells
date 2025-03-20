import { JigsawStack } from 'jigsawstack';
import dotenv from 'dotenv';

dotenv.config();

const jigsawstack = JigsawStack({
  apiKey: process.env.JIGSAWSTACK_API_KEY,
});

export async function scrapeCompanyInfo(companyName: string) {
  try {
    const searchResult = await jigsawstack.web.ai_scrape({
      url: `https://www.google.com/search?q=${encodeURIComponent(companyName)}`,
      element_prompts: [
        "Company website URL",
        "Company description",
        "Company location",
        "Number of employees"
      ]
    });

    // Format and extract the relevant data
    const companyInfo = {
      website: searchResult?.data?.find((item: any) =>
        item?.results?.[0]?.text?.includes('http')
      )?.results?.[0]?.text || null,

      description: searchResult?.data?.find((item: any) =>
        item?.results?.[0]?.text?.length > 100
      )?.results?.[0]?.text || null,

      location: searchResult?.data?.find((item: any) =>
        item?.results?.[0]?.text?.includes(',')
      )?.results?.[0]?.text || null,

      employees: searchResult?.data?.find((item: any) =>
        item?.results?.[0]?.text?.includes('employees')
      )?.results?.[0]?.text || null
    };

    return companyInfo;
  } catch (error) {
    console.error('Error scraping company info:', error);
    throw new Error('Failed to scrape company information');
  }
}