import OpenAI from 'openai';
import { supabase } from './supabase';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface CompanyAnalysis {
  website?: string;
  description?: string;
  location?: string;
  employees?: string;
  industry?: string;
  linkedinUrl?: string;
  aiInterestLevel: number;
  aiEvidence: string;
  leadScore: number;
  isQualified: boolean;
  notes: string;
  recentActivity: string[];
  decisionMaker?: string;
  compatibilityMetrics: {
    companyProfileMatch: number;
    relationshipInfluence: number;
    budgetAlignment: number;
    businessNeedsMatch: number;
  };
}

interface LeadSuggestion {
  companyName: string;
  industry: string;
  location: string;
  website?: string;
  linkedinUrl?: string;
  description: string;
  employees?: string;
  aiEvidence: string;
  leadScore: number;
}

interface HighPotentialLead {
  companyName: string;
  industry: string;
  location: string;
  website?: string;
  description: string;
  employees?: string;
  aiEvidence: string;
  leadScore: number;
  emailDraft: string;
}

const agentPrompts = {
  brain: `You are an elite AI sales strategist specializing in penetrating high-value enterprises. Identify companies that are actively investing in AI, machine learning, or data science initiatives. Focus on organizations undergoing digital transformation or seeking automation at scale. Target key executives such as CTOs, CIOs, and Heads of Innovation. Identify strategic pain points where AI can deliver transformative value, such as predictive analytics, customer segmentation, or process automation. Craft assertive, data-driven messages that highlight ROI, innovation leadership, and AI as a competitive advantage.`,
  target: `You are a B2B sales strategist specializing in helping established businesses adopt AI solutions. Identify companies that are actively seeking improved efficiency, process automation, or digital transformation. Focus on identifying pain points such as manual processes, outdated systems, or data inefficiencies. Provide insights into how AI solutions can streamline operations, improve customer engagement, and reduce costs.`,
  handshake: `You are a market research expert specializing in identifying promising start-ups, unicorns, and rapidly expanding companies. Focus on companies that are scaling fast, adopting new technologies, and seeking innovative AI solutions. Identify signals like recent funding rounds, product launches, aggressive hiring patterns, or international expansion. Provide insights into their pain points and potential opportunities for AI integration.`
};

const leadScoringCriteria = `
Lead Score Calculation (0-100):

1. Company Profile (35 points):
   - Industry Fit (15 points): Is this company in a sector that benefits from AI solutions?
   - Company Size (10 points): Larger organizations often have bigger budgets but slower decision-making
   - Funding Stage / Growth (10 points): Startups in growth stages are actively investing in scalable solutions

2. Budget Alignment (15 points):
   - Funding Stage (5 points): Indicates investment potential
   - Previous Tech Spend (5 points): Suggests openness to innovative solutions
   - Pricing Flexibility (5 points): Willingness to pay for high-impact solutions

3. Engagement & Interest (15 points):
   - Inbound Engagement (5 points): Leads that proactively reach out or engage with materials
   - Website Traffic Analysis (5 points): Frequent visits to AI-focused content
   - Email/LinkedIn Interactions (5 points): Positive replies, click-throughs, or inquiries

4. Relationship & Influence (15 points):
   - Decision-Maker Access (8 points): Direct access to C-level executives accelerates closing
   - Referral or Introduction (7 points): Referrals carry higher trust and likelihood to convert

5. AI Readiness & Digital Transformation (20 points):
   - Current Digital Transformation Efforts (10 points): Companies actively improving processes
   - Public Mention of AI Interest (10 points): Press releases, hiring for AI roles, etc.

Score ranges:
90-100: Exceptional opportunity - Perfect fit with immediate potential
80-89: Strong prospect - High alignment with clear path to conversion
70-79: Good potential - Solid fit with some nurturing needed
60-69: Moderate potential - Requires development but worth pursuing
50-59: Some potential - Long-term nurturing required
Below 50: Limited potential - Not recommended for active pursuit
`;

export async function findHighValueLeads(avatarType: string = 'brain'): Promise<LeadSuggestion[]> {
  try {
    const systemPrompt = `${agentPrompts[avatarType as keyof typeof agentPrompts]}

${leadScoringCriteria}

Find 5 high-value companies that match your expertise and focus. For each company, provide:
- Company name (MUST be real companies)
- Industry specifics
- Location (city, country)
- Website URL (if known)
- LinkedIn company URL (if known)
- Brief description
- Employee count range (if known)
- Evidence of AI potential or digital transformation needs
- Lead score (0-100) based on the scoring criteria above

Format your response as a valid JSON array of objects with these exact fields:
[
  {
    "companyName": "string",
    "industry": "string",
    "location": "string",
    "website": "string (optional)",
    "linkedinUrl": "string (optional)",
    "description": "string",
    "employees": "string (optional)",
    "aiEvidence": "string",
    "leadScore": number
  }
]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Find high-value companies that would benefit from AI solutions.' }
      ],
      temperature: 0.7
    });

    const content = completion.choices[0]?.message?.content || '[]';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error finding high-value leads:', error);
    throw new Error('Failed to find high-value leads');
  }
}

export async function findLeads(industry: string, country: string, avatarType: string = 'brain'): Promise<LeadSuggestion[]> {
  try {
    const systemPrompt = `${agentPrompts[avatarType as keyof typeof agentPrompts]}

${leadScoringCriteria}

Research Requirements:
1. Search across the entire internet, business directories, and industry databases
2. Focus on companies showing digital transformation potential
3. Look for recent news, press releases, and company announcements
4. Analyze company tech stacks and innovation initiatives
5. Consider market position and growth trajectory

For each company, provide:
- Company name (MUST be real, currently operating companies)
- Detailed industry classification
- Specific location (city, country)
- Official website URL
- LinkedIn company page URL
- Comprehensive company description
- Employee count range
- Evidence of technology adoption or digital transformation needs
- Lead score (0-100) based on the scoring criteria above

CRITICAL REQUIREMENTS:
- Return EXACTLY 10 companies
- Only include real, verifiable companies that can be found online
- Ensure all company names are accurate and currently in business
- Provide working website URLs when available
- Include specific evidence of technology needs or digital transformation initiatives
- Base lead scores on concrete evidence from company research
- Focus on companies that haven't been widely targeted by AI vendors
- Prioritize companies showing signs of preparing for digital transformation

Format your response as a valid JSON array of objects with these exact fields:
[
  {
    "companyName": "string",
    "industry": "string",
    "location": "string",
    "website": "string (optional)",
    "linkedinUrl": "string (optional)",
    "description": "string",
    "employees": "string (optional)",
    "aiEvidence": "string",
    "leadScore": number
  }
]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Research and find 10 companies in the ${industry} industry in ${country} that would benefit from AI solutions. Focus on companies based on my system prompt.`
        }
      ],
      temperature: 0.7
    });

    const content = completion.choices[0]?.message?.content || '[]';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error finding leads:', error);
    throw new Error('Failed to find leads');
  }
}

export async function findHighPotentialLead(userId: string): Promise<HighPotentialLead | null> {
  try {
    // First, get existing company names to avoid duplicates
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('company_name')
      .eq('user_id', userId);

    const existingCompanies = new Set(existingLeads?.map(lead => lead.company_name.toLowerCase()) || []);

    const systemPrompt = `You are an expert AI sales researcher with access to extensive business intelligence data.
    
Your task is to identify ONE company with extremely high potential (lead score > 90) for AI solutions adoption.
The company should be:
- Actively seeking or implementing digital transformation
- Have clear budget and authority for technology decisions
- Show strong signals of AI interest or immediate needs
- Be at a critical decision point in their technology journey

Also draft a compelling, personalized email that:
- References specific company initiatives or pain points
- Demonstrates deep understanding of their industry
- Presents clear value proposition
- Has a strong but professional call to action

CRITICAL: Do not suggest any of these existing companies: ${Array.from(existingCompanies).join(', ')}

Format your response as a JSON object with these exact fields:
{
  "companyName": "string",
  "industry": "string",
  "location": "string",
  "website": "string",
  "description": "string",
  "employees": "string",
  "aiEvidence": "string",
  "leadScore": number,
  "emailDraft": "string"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Find one high-potential company and draft an engaging email.' }
      ],
      temperature: 0.7
    });

    const content = completion.choices[0]?.message?.content || '';
    const lead = JSON.parse(content) as HighPotentialLead;

    // Double-check that the suggested company is not in our existing leads
    if (existingCompanies.has(lead.companyName.toLowerCase())) {
      throw new Error('Generated lead already exists in database');
    }

    // Add the lead to the database
    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert([{
        user_id: userId,
        company_name: lead.companyName,
        industry: lead.industry,
        location: lead.location,
        website: lead.website,
        description: lead.description,
        employees: lead.employees,
        lead_score: lead.leadScore,
        status: 'New Lead',
        ai_evidence: lead.aiEvidence
      }])
      .select()
      .single();

    if (leadError) throw leadError;

    return {
      ...lead,
      emailDraft: lead.emailDraft
    };
  } catch (error) {
    console.error('Error finding high potential lead:', error);
    return null;
  }
}

export async function scrapeAndAnalyzeCompany(companyName: string, avatarType: string = 'brain'): Promise<CompanyAnalysis> {
  try {
    const systemPrompt = `${agentPrompts[avatarType as keyof typeof agentPrompts]}

${leadScoringCriteria}

Your task is to research the company "${companyName}" and provide detailed information and analysis.

Based on your knowledge, provide:

1. Basic Information:
   - Website URL
   - LinkedIn company page URL
   - Company description
   - Location
   - Employee count range
   - Industry

2. AI Analysis:
   - AI Interest Level (0-100)
   - Evidence of AI interest or technology adoption
   - Overall Lead Score (0-100) based on the scoring criteria above
   - Whether this lead should be automatically qualified
   - Additional analysis notes

3. Recent Activity:
   - List of recent AI-related activities or news
   - Key technology initiatives
   - Notable partnerships or projects

4. Decision Making:
   - Key decision maker information (if available)
   - Decision making structure

5. Compatibility Assessment:
  a. **Company Profile Match (0-100)**
     - Evaluate how closely the target company matches the ideal customer profile.
     - Consider industry alignment, company size, growth stage, and digital transformation readiness.
     - Assign a score from 0 to 100, where 100 indicates a perfect match.
  
  b. **Relationship & Influence (0-100)**
     - Assess the strength of the relationship between the user's organization and the target company.
     - Consider existing partnerships, mutual connections, past collaborations, or familiarity with key decision-makers.
     - Assign a score from 0 to 100, where 100 indicates a strong, well-established relationship.
  
  c. **Budget Alignment (0-100)**
     - Evaluate the company's financial capacity and willingness to invest in AI solutions.
     - Consider funding stage, recent tech investments, and AI spending patterns.
     - Assign a score from 0 to 100, where 100 indicates ideal budget alignment.
  
  d. **Business Needs & AI Efforts (0-100)**
     - Assess the company's ongoing or potential AI adoption efforts.
     - Consider press releases, hiring trends for AI roles, product development focused on AI, or stated AI-related goals.
     - Assign a score from 0 to 100, where 100 indicates a strong AI focus with immediate needs.

Format your response as a valid JSON object with these exact fields:
{
  "website": "string (optional)",
  "linkedinUrl": "string (optional)",
  "description": "string",
  "location": "string",
  "employees": "string",
  "industry": "string",
  "aiInterestLevel": number,
  "aiEvidence": "string",
  "leadScore": number,
  "isQualified": boolean,
  "notes": "string",
  "recentActivity": ["string"],
  "decisionMaker": "string",
  "compatibilityMetrics": {
    "companyProfileMatch": number,
    "relationshipInfluence": number,
    "budgetAlignment": number,
    "businessNeedsMatch": number
  }
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Research and analyze ${companyName}.` }
      ],
      temperature: 0.1
    });

    const content = completion.choices[0]?.message?.content || '';
    const analysis = JSON.parse(content) as CompanyAnalysis;

    return {
      website: analysis.website,
      linkedinUrl: analysis.linkedinUrl,
      description: analysis.description,
      location: analysis.location,
      employees: analysis.employees,
      industry: analysis.industry,
      aiInterestLevel: analysis.aiInterestLevel ?? 0,
      aiEvidence: analysis.aiEvidence ?? '',
      leadScore: analysis.leadScore ?? 0,
      isQualified: analysis.isQualified ?? false,
      notes: analysis.notes ?? '',
      recentActivity: analysis.recentActivity ?? [],
      decisionMaker: analysis.decisionMaker,
      compatibilityMetrics: {
        companyProfileMatch: analysis.compatibilityMetrics?.companyProfileMatch ?? 0,
        relationshipInfluence: analysis.compatibilityMetrics?.relationshipInfluence ?? 0,
        budgetAlignment: analysis.compatibilityMetrics?.budgetAlignment ?? 0,
        businessNeedsMatch: analysis.compatibilityMetrics?.businessNeedsMatch ?? 0
      }
    };
  } catch (error) {
    console.error('Error analyzing company:', error);
    throw new Error('Failed to analyze company');
  }
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function chatWithGPT(messages: Message[], avatarType: string = 'brain'): Promise<string> {
  try {
    const systemMessage = {
      role: 'system',
      content: `${agentPrompts[avatarType as keyof typeof agentPrompts]}

Help users with:
- Lead qualification strategies
- Company research tips
- Sales outreach best practices
- Market analysis
- Industry trends
- AI adoption patterns

Be concise, professional, and actionable in your responses.`
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        systemMessage,
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
  } catch (error) {
    console.error('Error in chat:', error);
    throw new Error('Failed to get response');
  }
}