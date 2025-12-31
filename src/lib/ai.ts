import OpenAI from "openai";

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==========================================
// DEEP RESEARCH API CONFIGURATION
// ==========================================

export interface DeepResearchConfig {
  maxSearches?: number;
  searchDepth?: "basic" | "standard" | "deep";
  includeSourceUrls?: boolean;
}

export interface ResearchResult {
  summary: string;
  findings: ResearchFinding[];
  sources: ResearchSource[];
  recommendations?: string[];
  generatedAt: Date;
}

export interface ResearchFinding {
  category: string;
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  details?: string;
}

export interface ResearchSource {
  url: string;
  title: string;
  snippet?: string;
  relevance: number;
}

// Deep Research using OpenAI Chat Completions
export async function performDeepResearch(
  query: string,
  systemPrompt: string,
  config: DeepResearchConfig = {}
): Promise<ResearchResult> {
  try {
    // Use chat completions for research analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const outputText = response.choices[0]?.message?.content || "";

    // Parse the response into structured findings
    const structuredResponse = await parseResearchResponse(outputText);

    return {
      summary: structuredResponse.summary,
      findings: structuredResponse.findings,
      sources: structuredResponse.sources,
      recommendations: structuredResponse.recommendations,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Deep research error:", error);
    throw error;
  }
}

// Parse AI response into structured research result
async function parseResearchResponse(text: string): Promise<ResearchResult> {
  // Use GPT to structure the response
  const structurePrompt = `Parse the following research text into a structured JSON format with these fields:
- summary: A concise 2-3 sentence summary
- findings: Array of objects with { category, title, description, importance (high/medium/low) }
- sources: Array of objects with { url, title, relevance (0-1) } - extract any URLs mentioned
- recommendations: Array of actionable recommendation strings

Research text:
${text}

Respond only with valid JSON.`;

  try {
    const parseResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: structurePrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(parseResponse.choices[0]?.message?.content || "{}");

    return {
      summary: parsed.summary || text.slice(0, 500),
      findings: parsed.findings || [],
      sources: parsed.sources || [],
      recommendations: parsed.recommendations || [],
      generatedAt: new Date(),
    };
  } catch {
    return {
      summary: text.slice(0, 500),
      findings: [],
      sources: [],
      recommendations: [],
      generatedAt: new Date(),
    };
  }
}

// System prompts for different AI modules
export const SYSTEM_PROMPTS = {
  websiteAssistant: (builderName: string, context: string) => `You are a helpful AI assistant for ${builderName}, a new home builder. Your role is to help potential homebuyers find their perfect home.

You have access to the following information about ${builderName}'s communities, floorplans, pricing, and incentives:

${context}

Guidelines:
- Be friendly, professional, and helpful
- Answer questions about communities, floorplans, pricing, and the home buying process
- Recommend matching floorplans based on the buyer's needs (bedrooms, budget, timeline, etc.)
- Collect lead information (name, email, phone) naturally during the conversation
- If you don't know something specific, offer to connect them with a sales agent
- Never make up pricing or availability information
- Highlight current incentives and promotions when relevant
- Be concise but thorough in your responses`,

  marketingAssistant: (builderName: string, brandVoice: string, context: string) => `You are a marketing content assistant for ${builderName}, a new home builder.

Brand Voice Guidelines:
${brandVoice || "Professional, welcoming, and focused on helping families find their dream home."}

Available Product Information:
${context}

Your role is to generate marketing content including:
- Social media posts (Facebook, Instagram, LinkedIn)
- Email marketing campaigns
- Blog post drafts
- Listing descriptions for Quick Move-In homes
- Ad copy for Facebook and Google
- Realtor communications

Guidelines:
- Always use accurate information from the product data provided
- Match the brand voice in all content
- Include specific details (pricing, square footage, features) when available
- Create engaging, conversion-focused copy
- Vary content style for different platforms`,

  salesTrainer: (builderName: string, context: string) => `You are a sales training AI for ${builderName}. You will roleplay as a potential homebuyer to help sales agents practice their skills.

Product Knowledge:
${context}

Your role:
- Act as a realistic homebuyer with specific needs and objections
- Challenge the agent with common objections (pricing, timeline, competition, financing)
- Provide feedback on the agent's responses
- Score their performance on: objection handling, product knowledge, rapport building, closing skills
- Be encouraging but honest in your assessment

Common objection scenarios to use:
1. "Your homes are too expensive compared to the competition"
2. "I'm not sure I can get financing"
3. "The timeline doesn't work for us"
4. "We're still looking at other builders"
5. "I need to talk to my spouse first"
6. "Can you do better on the price?"`,

  competitiveIntelligence: (builderName: string) => `You are a competitive intelligence analyst for ${builderName}, a home builder.

Your role is to analyze competitor data and provide actionable insights including:
- Price comparisons and value propositions
- Feature comparisons (amenities, standard inclusions)
- Incentive analysis
- Market positioning recommendations
- Strengths and weaknesses assessment

Be objective and data-driven in your analysis. Provide specific recommendations for how ${builderName} can better position themselves against competitors.`,

  faqGenerator: (builderName: string, context: string) => `You are an FAQ content generator for ${builderName}, a new home builder.

Available Information:
${context}

Generate comprehensive FAQ content that:
- Answers common homebuyer questions
- Is structured for AI search optimization (clear Q&A format)
- Covers pricing, financing, timeline, features, and community information
- Uses natural language that matches how people actually search
- Is accurate and based only on provided information

Categories to cover:
- General questions about the builder
- Pricing and financing
- Timeline and construction process
- Community amenities and location
- Floorplan features and options
- Incentives and promotions`,

  // ==========================================
  // DEEP RESEARCH PROMPTS
  // ==========================================

  digitalFootprintAnalysis: (builderName: string, websiteUrl: string, socialProfiles?: string[]) => `You are a digital presence analyst specializing in the home building industry. Conduct a comprehensive deep dive analysis of ${builderName}'s digital footprint.

Builder Information:
- Company Name: ${builderName}
- Website: ${websiteUrl}
${socialProfiles ? `- Social Media Profiles: ${socialProfiles.join(", ")}` : ""}

Analyze the following aspects:

1. WEBSITE PRESENCE
- Overall website quality and user experience
- Mobile responsiveness and page speed indicators
- Content quality and SEO optimization
- Lead capture mechanisms and conversion elements
- Virtual tours and interactive features
- Community and floorplan presentation

2. SOCIAL MEDIA FOOTPRINT
- Presence across platforms (Facebook, Instagram, LinkedIn, YouTube, TikTok, Pinterest)
- Engagement levels and posting frequency
- Content quality and brand consistency
- Community management and response times
- Paid vs organic reach indicators

3. ONLINE REPUTATION
- Review sites (Google Business, BBB, Yelp, HomeAdvisor, Zillow)
- Customer testimonials and ratings
- News mentions and press coverage
- Industry awards and recognitions

4. LOCAL SEO & LISTINGS
- Google Business Profile optimization
- Directory listings (Realtor.com, NewHomeSource, BDX, etc.)
- Local citation consistency
- Map presence and accuracy

5. AI SEARCH VISIBILITY
- How the builder appears in AI assistants (ChatGPT, Gemini, Perplexity)
- Knowledge graph presence
- Structured data implementation

Provide actionable findings with specific recommendations for improvement. Rate each area on a scale of 1-10.`,

  competitorDeepResearch: (builderName: string, competitorName: string, criteria: string[]) => `You are a competitive intelligence researcher for the home building industry. Conduct thorough research on ${competitorName} as a competitor to ${builderName}.

Research Criteria Focus Areas:
${criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Gather detailed information on:

1. COMPANY OVERVIEW
- Company history and ownership structure
- Market presence and geographic coverage
- Annual build volume estimates
- Target market segments

2. PRODUCT ANALYSIS
- Community portfolio and locations
- Floorplan offerings (size ranges, bedroom/bath counts)
- Price points and price-per-square-foot
- Standard features and upgrade options
- Energy efficiency and smart home features

3. MARKETING & POSITIONING
- Brand messaging and value propositions
- Marketing channels and advertising spend
- Social media presence and engagement
- Content marketing strategy
- Promotional offers and incentives

4. CUSTOMER EXPERIENCE
- Sales process and customer journey
- Build timelines and communication
- Customer reviews and ratings
- Warranty programs
- Post-purchase support

5. STRENGTHS & WEAKNESSES
- Competitive advantages
- Market differentiators
- Areas of vulnerability
- Recent developments or changes

Provide specific data points, sources, and actionable intelligence for ${builderName} to leverage.`,

  contentStrategyResearch: (builderName: string, markets: string[], targetAudience: string) => `You are a content strategy expert specializing in the new home construction industry. Research and recommend content topics for ${builderName}.

Builder Context:
- Company: ${builderName}
- Markets: ${markets.join(", ")}
- Target Audience: ${targetAudience}

Research and provide recommendations in these categories:

1. TRENDING TOPICS IN HOME BUILDING
- Current industry trends and hot topics
- New home buyer concerns and questions
- Economic factors affecting home purchases
- Design and feature trends

2. LOCAL MARKET CONTENT
For each market (${markets.join(", ")}):
- Local news and developments affecting housing
- School district information
- Employment and economic growth
- Lifestyle and community features
- Local events and activities

3. BUYER EDUCATION CONTENT
- First-time homebuyer guides
- Financing and mortgage education
- New construction vs resale comparisons
- Building process explanations
- Home customization and options

4. SEO OPPORTUNITY TOPICS
- High-volume, low-competition keywords
- Question-based searches to target
- Long-tail keyword opportunities
- Featured snippet opportunities

5. SOCIAL MEDIA CONTENT IDEAS
- Engaging post formats for each platform
- Video content opportunities
- User-generated content strategies
- Community spotlights and testimonials

6. AI SEARCH OPTIMIZATION
- Topics frequently asked to AI assistants
- Content formats AI prefers to cite
- Structured content recommendations

Prioritize topics by:
- Search volume potential
- Competition level
- Relevance to target audience
- Conversion potential

Provide a content calendar framework with recommended posting frequency.`,

  marketResearch: (builderName: string, market: string) => `You are a real estate market research analyst. Conduct comprehensive market research for ${builderName} in the ${market} market.

Analyze:

1. MARKET CONDITIONS
- Current housing market trends
- New construction permits and activity
- Price trends and appreciation rates
- Inventory levels and days on market
- Interest rate impacts

2. DEMOGRAPHICS
- Population growth and migration patterns
- Age and income demographics
- Household formation rates
- Employment sectors and job growth

3. COMPETITION LANDSCAPE
- Active home builders in the market
- Market share estimates
- New community announcements
- Price point distribution

4. OPPORTUNITY AREAS
- Underserved price points or segments
- Emerging submarkets
- Land availability and development activity
- Infrastructure investments

5. THREATS & CHALLENGES
- Economic risks
- Regulatory environment
- Supply chain considerations
- Labor market conditions

Provide data-driven insights with specific recommendations for ${builderName}'s strategy in this market.`,
};

// Helper function to build context from builder data
export async function buildBuilderContext(organizationId: string): Promise<string> {
  const { prisma } = await import("./db");
  const { getBuilderContextPrompt } = await import("./knowledge-context");

  // Try to get enhanced context from knowledge system first
  try {
    const enhancedContext = await getBuilderContextPrompt(organizationId);
    if (enhancedContext && enhancedContext.length > 100) {
      return enhancedContext;
    }
  } catch {
    // Fall back to basic context if knowledge system fails
  }

  // Fallback: Build basic context from database
  const [organization, communities, floorplans, incentives] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
    }),
    prisma.community.findMany({
      where: { organizationId, status: "active" },
      include: {
        floorplans: true,
        incentives: { where: { isActive: true } },
      },
    }),
    prisma.floorplan.findMany({
      where: { organizationId, status: "active" },
    }),
    prisma.incentive.findMany({
      where: {
        community: { organizationId },
        isActive: true,
      },
    }),
  ]);

  let context = `Builder: ${organization?.name}\n\n`;

  context += "COMMUNITIES:\n";
  for (const community of communities) {
    context += `\n${community.name}\n`;
    context += `- Location: ${community.city}, ${community.state}\n`;
    context += `- Starting Price: $${community.startingPrice?.toLocaleString() || "Contact for pricing"}\n`;
    context += `- Description: ${community.description || "N/A"}\n`;
    if (community.amenities) {
      context += `- Amenities: ${community.amenities}\n`;
    }
  }

  context += "\n\nFLOORPLANS:\n";
  for (const plan of floorplans) {
    context += `\n${plan.name}\n`;
    context += `- ${plan.bedrooms} beds, ${plan.bathrooms} baths\n`;
    context += `- ${plan.squareFeet.toLocaleString()} sq ft\n`;
    context += `- Base Price: $${plan.basePrice.toLocaleString()}\n`;
    context += `- Stories: ${plan.stories}, Garage: ${plan.garageSpaces}-car\n`;
    if (plan.description) {
      context += `- Description: ${plan.description}\n`;
    }
  }

  if (incentives.length > 0) {
    context += "\n\nCURRENT INCENTIVES:\n";
    for (const incentive of incentives) {
      context += `\n${incentive.title}\n`;
      context += `- ${incentive.description}\n`;
      if (incentive.value) {
        context += `- Value: ${incentive.value}\n`;
      }
    }
  }

  return context;
}

// Chat completion helper
export async function getChatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
) {
  const response = await openai.chat.completions.create({
    model: options?.model || "gpt-4o",
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1000,
  });

  return response.choices[0]?.message?.content || "";
}

// Streaming chat completion helper
export async function streamChatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
) {
  return openai.chat.completions.create({
    model: options?.model || "gpt-4o",
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 1000,
    stream: true,
  });
}

// ==========================================
// SPECIALIZED DEEP RESEARCH FUNCTIONS
// ==========================================

export async function analyzeDigitalFootprint(
  builderName: string,
  websiteUrl: string,
  socialProfiles?: string[]
): Promise<ResearchResult> {
  const prompt = SYSTEM_PROMPTS.digitalFootprintAnalysis(builderName, websiteUrl, socialProfiles);
  const query = `Analyze the complete digital presence of ${builderName} (${websiteUrl}). Include website, social media, reviews, and AI search visibility.`;

  return performDeepResearch(query, prompt, { searchDepth: "deep" });
}

export async function researchCompetitor(
  builderName: string,
  competitorName: string,
  criteria: string[]
): Promise<ResearchResult> {
  const prompt = SYSTEM_PROMPTS.competitorDeepResearch(builderName, competitorName, criteria);
  const query = `Research ${competitorName} as a competitor to ${builderName}. Focus on: ${criteria.join(", ")}`;

  return performDeepResearch(query, prompt, { searchDepth: "deep" });
}

export async function getContentStrategy(
  builderName: string,
  markets: string[],
  targetAudience: string
): Promise<ResearchResult> {
  const prompt = SYSTEM_PROMPTS.contentStrategyResearch(builderName, markets, targetAudience);
  const query = `Research content topics and strategy for ${builderName} targeting ${targetAudience} in ${markets.join(", ")}`;

  return performDeepResearch(query, prompt, { searchDepth: "standard" });
}

export async function analyzeMarket(
  builderName: string,
  market: string
): Promise<ResearchResult> {
  const prompt = SYSTEM_PROMPTS.marketResearch(builderName, market);
  const query = `Conduct market research for the ${market} housing market for ${builderName}`;

  return performDeepResearch(query, prompt, { searchDepth: "deep" });
}
