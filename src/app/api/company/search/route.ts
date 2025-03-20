import { NextResponse } from 'next/server';
import { JigsawStack } from 'jigsawstack';

const jigsawstack = JigsawStack({
  apiKey: process.env.JIGSAWSTACK_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

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

    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error('Error searching company:', error);
    return NextResponse.json(
      { error: 'Failed to search company information' },
      { status: 500 }
    );
  }
}