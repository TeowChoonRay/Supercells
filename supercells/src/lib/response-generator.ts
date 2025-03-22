import OpenAI from 'openai';

export type MessageStyle = 'confident' | 'empathetic' | 'collaborative' | 'inspirational' | 'authoritative';
export type MessageType = 'email' | 'linkedin';

const agentPrompts = {
  brain: `You are an elite AI sales strategist targeting high-value enterprises. Your communication style is:
- Bold, data-backed language with clear emphasis on business impact
- Focus on innovation, market leadership, and AI as a competitive edge
- Highlight how your solution can future-proof their business
- Provide case studies, proof of concept, or pilot projects to build trust`,
  target: `You are a B2B sales strategist helping established businesses adopt AI solutions. Your communication style is:
- Emphasize efficiency, cost savings, and seamless integration
- Highlight your solution's ability to reduce errors, boost productivity, and enhance reporting
- Use ROI calculators or impact metrics to persuade decision-makers
- Focus on practical benefits and clear implementation paths`,
  handshake: `You are a market research expert specializing in fast-growing companies. Your communication style is:
- Friendly and engaging
- Position AI as a scalable, flexible, and affordable solution for fast-growing teams
- Emphasize agility and time-to-market to match their rapid growth
- Focus on innovation and competitive advantage`
};

export class ResponseGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  async generateMessage(
    companyName: string,
    industry: string | null,
    employees: string | null,
    style: MessageStyle,
    type: MessageType,
    avatarType: string = 'brain'
  ): Promise<string> {
    const organizationSize = this.determineOrgSize(employees);
    
    const systemPrompt = `${agentPrompts[avatarType as keyof typeof agentPrompts]}

Write an engaging, customized ${type === 'email' ? 'outreach email' : 'LinkedIn message'} for ${companyName} in the ${industry || 'technology'} industry.

${this.getIntroPrompt(organizationSize)}
${this.getStylePrompt(style)}

The message should:
1. Be professional and engaging
2. Demonstrate understanding of their industry
3. Highlight relevant AI solutions
4. Include a clear call-to-action
5. Be concise (${type === 'email' ? 'max 200 words' : 'max 150 characters'})
${type === 'linkedin' ? '6. Follow LinkedIn message length restrictions' : ''}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a ${style} ${type} message for ${companyName}.`
          }
        ],
        temperature: 0.7,
        max_tokens: type === 'email' ? 500 : 200
      });

      return completion.choices[0]?.message?.content ?? "Error generating message.";
    } catch (error) {
      console.error('Error generating message:', error);
      throw new Error('Failed to generate message');
    }
  }

  private determineOrgSize(employees: string | null): "Startup" | "SME" | "Enterprise" {
    if (!employees) return "SME";
    
    const size = parseInt(employees.split('-')[0]);
    if (size < 50) return "Startup";
    if (size < 250) return "SME";
    return "Enterprise";
  }

  private getIntroPrompt(orgSize: "Startup" | "SME" | "Enterprise"): string {
    const prompts = {
      "Startup": "Focus on agility, growth potential, and cost-effective solutions.",
      "SME": "Emphasize scalability, efficiency improvements, and competitive advantages.",
      "Enterprise": "Highlight enterprise-grade security, integration capabilities, and comprehensive support."
    };
    return prompts[orgSize];
  }

  private getStylePrompt(style: MessageStyle): string {
    const prompts = {
      "confident": "Write with authority and conviction, emphasizing proven results and expertise.",
      "empathetic": "Show understanding of their challenges and position solutions as helpful answers.",
      "collaborative": "Focus on partnership opportunities and mutual growth potential.",
      "inspirational": "Paint an exciting vision of future possibilities and transformative outcomes.",
      "authoritative": "Demonstrate deep industry knowledge and thought leadership."
    };
    return prompts[style];
  }
}