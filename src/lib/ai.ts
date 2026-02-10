import "server-only";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set. AI features will not work.");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let agentModules: {
  Agent: typeof import("@openai/agents").Agent;
  Runner: typeof import("@openai/agents").Runner;
  webSearchTool: typeof import("@openai/agents").webSearchTool;
  withTrace: typeof import("@openai/agents").withTrace;
} | null = null;

async function getAgentModules() {
  if (!agentModules) {
    const mod = await import("@openai/agents");
    agentModules = {
      Agent: mod.Agent,
      Runner: mod.Runner,
      webSearchTool: mod.webSearchTool,
      withTrace: mod.withTrace,
    };
  }
  return agentModules;
}

async function runResearchAgent(
  name: string,
  instructions: string,
  query: string,
  options?: { maxTokens?: number; model?: string }
): Promise<string> {
  try {
    const { Agent, Runner, webSearchTool, withTrace } = await getAgentModules();
    const webSearch = webSearchTool({ searchContextSize: "high" });
    const agentRunner = new Runner();

    const agent = new Agent({
      name,
      instructions,
      model: options?.model || "gpt-4o",
      tools: [webSearch],
      modelSettings: {
        ...(options?.maxTokens ? { maxTokens: options.maxTokens } : {}),
      },
    });

    const result = await withTrace(`builder-ai:${name}`, async () => {
      return await agentRunner.run(agent, query);
    });

    return result.finalOutput || "";
  } catch (error) {
    console.warn(`Agent web search failed for "${name}", falling back to chat completion:`, error);
    const response = await openai.chat.completions.create({
      model: options?.model || "gpt-4o",
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: query },
      ],
      temperature: 0.7,
      max_completion_tokens: options?.maxTokens || 4000,
    });
    return response.choices[0]?.message?.content || "";
  }
}

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
  // Enhanced fields for deep research
  dataPoints?: DataPoint[];
  actionItems?: string[];
  metrics?: ResearchMetric[];
  comparison?: ComparisonData;
}

export interface DataPoint {
  label: string;
  value: string;
  source?: string;
  date?: string;
}

export interface ResearchMetric {
  name: string;
  value: string | number;
  benchmark?: string | number;
  trend?: "up" | "down" | "stable";
  interpretation?: string;
}

export interface ComparisonData {
  yourBuilder: string;
  competitor: string;
  advantage: "yours" | "theirs" | "equal";
  gap?: string;
}

export interface ResearchSource {
  url: string;
  title: string;
  snippet?: string;
  relevance: number;
}

// Deep Research using OpenAI Agents SDK with real web search
export async function performDeepResearch(
  query: string,
  systemPrompt: string,
  config: DeepResearchConfig = {}
): Promise<ResearchResult> {
  try {
    const outputText = await runResearchAgent(
      "Deep Research",
      systemPrompt,
      query,
      { maxTokens: 4000 }
    );

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
    return await performFallbackResearch(query, systemPrompt);
  }
}

// Fallback research using standard chat completions
async function performFallbackResearch(
  query: string,
  systemPrompt: string
): Promise<ResearchResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query }
    ],
    temperature: 0.7,
    max_completion_tokens: 4000,
  });

  const outputText = response.choices[0]?.message?.content || "";
  return await parseResearchResponse(outputText);
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
      max_completion_tokens: 2000,
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

  digitalFootprintAnalysis: (builderName: string, websiteUrl: string, socialProfiles?: string[], builderContext?: string) => `You are an expert digital marketing analyst and SEO specialist for the home building industry. Conduct an EXHAUSTIVE analysis of ${builderName}'s complete digital presence.

YOUR ANALYSIS MUST BE EXTREMELY DETAILED with specific metrics, scores, and actionable insights. Do not provide vague assessments - include actual numbers, specific URLs, exact observations, and concrete recommendations.

=== BUILDER INFORMATION ===
- Company Name: ${builderName}
- Website: ${websiteUrl}
${socialProfiles ? `- Known Social Profiles: ${socialProfiles.join(", ")}` : ""}

${builderContext ? `
=== BUILDER'S CURRENT PROFILE ===
${builderContext}
` : ""}

=== DETAILED ANALYSIS REQUIREMENTS ===

SECTION 1: WEBSITE AUDIT (Score /100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Homepage Analysis:
• First impression assessment
• Above-the-fold content effectiveness
• Primary CTA visibility and clarity
• Value proposition clarity
• Trust signals present (awards, reviews, certifications)

User Experience (UX):
• Navigation structure and ease of use
• Search functionality quality
• Mobile experience (test on mobile)
• Page load speed (estimate or note speed)
• Form usability and friction points
• Chat/contact accessibility

Content Quality:
• Homepage messaging clarity and persuasiveness
• Community pages: completeness of information
• Floorplan pages: imagery quality, interactive elements, detail level
• Pricing transparency (do they show prices?)
• Blog/resource section: quantity, quality, recency of posts
• FAQ completeness
• About/team pages authenticity

Conversion Optimization:
• Lead capture forms: number of fields, friction level
• CTAs: clarity, placement, urgency
• Virtual tour availability and quality
• Schedule tour/appointment functionality
• Inventory home visibility
• Online chat presence
• Brochure/pricing request process

Technical SEO Indicators:
• SSL certificate (https)
• Mobile-friendly indicators
• Page structure (headers, schema)
• Image optimization
• Internal linking quality

SPECIFIC RECOMMENDATIONS: List 5-10 website improvements with expected impact

SECTION 2: SOCIAL MEDIA AUDIT (Score /100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For EACH platform, provide:

Facebook:
• Page exists? URL if found
• Follower count
• Posting frequency (posts per week/month)
• Engagement rate (likes/comments per post)
• Content types used (photos, videos, reels, stories)
• Quality assessment of content
• Response rate to comments
• Reviews enabled and rating
• Best performing recent posts (topics)

Instagram:
• Account exists? Handle if found
• Follower count
• Following count and ratio
• Posting frequency
• Engagement rate
• Content style (professional, lifestyle, behind-scenes)
• Hashtag strategy effectiveness
• Stories/Reels usage
• Bio optimization

YouTube:
• Channel exists? URL if found
• Subscriber count
• Video count
• View counts on recent videos
• Content types (tours, testimonials, build process)
• Video quality and production value
• Upload frequency

LinkedIn:
• Company page exists?
• Follower count
• Posting frequency
• Content focus (careers, company news, industry)
• Employee advocacy visible

TikTok:
• Presence assessment
• If present: follower count, content style, engagement

Pinterest:
• Presence assessment
• If present: pin strategy, board organization

CONTENT STRATEGY ASSESSMENT:
• Overall content themes
• Brand voice consistency
• Visual identity consistency
• Community engagement quality
• Missed opportunities

SPECIFIC RECOMMENDATIONS: List 5-10 social media improvements

SECTION 3: ONLINE REPUTATION AUDIT (Score /100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Google Business Profile:
• Profile claimed and optimized?
• Star rating and review count
• Recent review sentiment (last 3-6 months)
• Response rate to reviews
• Photo quantity and quality
• Q&A section usage
• Post activity

QUOTE 3-5 SPECIFIC REVIEWS (positive and negative):
• Include verbatim excerpts
• Note what they praise or criticize
• Identify patterns

Other Review Sources:
• BBB: Rating, complaint count, accreditation
• Zillow: Rating if present
• HomeAdvisor/Houzz: Presence and rating
• Yelp: Rating if present
• GuildQuality/Avid: If applicable

Review Theme Analysis:
• Top 3 praised aspects across reviews
• Top 3 criticized aspects across reviews
• Sentiment trend (improving or declining)

News & Press:
• Recent news mentions
• Press release activity
• Industry recognition/awards

SPECIFIC RECOMMENDATIONS: How to improve reputation

SECTION 4: LOCAL SEO & DIRECTORY ANALYSIS (Score /100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Google Business Profile Optimization:
• Category selection accuracy
• Service area definition
• Attribute completion
• Photo optimization

Directory Presence (check each):
• Realtor.com builder profile
• NewHomeSource listing
• BDX/New Home Guide
• Zillow builder profile
• Local MLS feeds

Citation Consistency:
• NAP (Name, Address, Phone) consistency
• Business hours accuracy
• Website URL consistency

Map Presence:
• Individual community listings
• Model home locations marked
• Accurate directions

SPECIFIC RECOMMENDATIONS: Local SEO improvements

SECTION 5: AI SEARCH VISIBILITY ANALYSIS (Score /100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test queries in AI assistants (ChatGPT, Perplexity, Gemini):
• "${builderName} homes" - Are they mentioned?
• "new homes in [their markets]" - Do they appear?
• "best home builders in [market]" - Are they recommended?

Structured Data:
• Schema markup present on website?
• Organization schema
• LocalBusiness schema
• Product schema for floorplans
• FAQ schema

Content for AI Optimization:
• Clear, factual content that AI can cite
• Updated pricing and availability
• Community-specific landing pages
• FAQ content quality

Knowledge Graph:
• Do they appear in Google Knowledge Panel?
• Information accuracy in Knowledge Panel

SPECIFIC RECOMMENDATIONS: How to improve AI visibility

SECTION 6: COMPETITIVE BENCHMARKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Compare ${builderName}'s digital presence to 2-3 competitors in their market.
• Who's winning in each category?
• What are competitors doing better?
• Quick wins to close the gap

SECTION 7: PRIORITIZED ACTION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Provide a prioritized list of 15-20 specific improvements:

IMMEDIATE (This week):
1. [Action] - [Expected impact]
2. [Action] - [Expected impact]
...

SHORT-TERM (This month):
...

MEDIUM-TERM (This quarter):
...

Include estimated effort and impact for each.`,

  competitorDeepResearch: (builderName: string, competitorName: string, criteria: string[], builderContext?: string) => `You are an elite competitive intelligence analyst specializing in residential home building. You are conducting an exhaustive deep-dive analysis of ${competitorName} as a direct competitor to ${builderName}.

YOUR ANALYSIS MUST BE EXTREMELY DETAILED AND SPECIFIC - not high-level summaries. Include actual numbers, specific examples, direct quotes from reviews, real community names, actual price points, and concrete data wherever possible.

${builderContext ? `
=== YOUR BUILDER'S PROFILE (${builderName}) ===
${builderContext}

Use this information to provide DIRECT COMPARISONS throughout your analysis. How does the competitor stack up against YOUR builder in each area?
` : ""}

=== RESEARCH CRITERIA FOCUS ===
${criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}

=== REQUIRED ANALYSIS DEPTH ===

For EACH section, you MUST provide:
- Specific data points with sources (URLs, review sites, press releases)
- Direct comparisons to ${builderName} where applicable
- Quantified metrics (percentages, dollar amounts, ratings)
- Actionable recommendations specific to ${builderName}

SECTION 1: COMPANY INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Ownership: Parent company, founding year, key executives
• Scale: Estimated annual closings, revenue, employee count
• Geographic footprint: SPECIFIC markets, cities, and submarkets served
• Growth trajectory: Recent expansion or contraction, new market entries
• Financial health: Public filings, news about funding, acquisitions

SECTION 2: PRODUCT PORTFOLIO ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Communities: LIST specific active communities with addresses/areas
• Price positioning: Exact price ranges by community, $/sq ft calculations
• Floorplan breakdown:
  - Entry-level offerings (sq ft, beds, baths, garage, price)
  - Mid-range offerings
  - Premium/luxury offerings
• Standard inclusions: What's included at base price vs ${builderName}
• Upgrade options and typical upgrade spend
• Lot premiums and structural options
• Build times: Quoted move-in timelines by product type
• Inventory homes: Current QMI availability and pricing

SECTION 3: PRICING INTELLIGENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Base price ranges by floorplan size
• Price-per-square-foot analysis vs ${builderName}
• Current incentives and promotions (BE SPECIFIC):
  - Rate buydowns (what rate, how many points)
  - Closing cost contributions (exact amounts)
  - Free upgrades (what's included)
  - Flex cash offers
• Historical pricing trends if available
• How their pricing compares in shared markets

SECTION 4: MARKETING & MESSAGING DEEP DIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Brand positioning: Core messaging, taglines, value propositions
• Website analysis: UX quality, virtual tours, online tools
• Social media audit:
  - Facebook: followers, posting frequency, engagement rate
  - Instagram: followers, content style, hashtag strategy
  - YouTube: video content, views, production quality
  - TikTok: presence and approach
• Advertising: Where they advertise, estimated spend, creative themes
• Content marketing: Blog topics, resource guides, email campaigns
• Realtor marketing: Co-op programs, agent incentives, portal tools
• What ${builderName} can learn from their marketing

SECTION 5: CUSTOMER EXPERIENCE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Google Reviews: Overall rating, number of reviews, recent trends
  - Quote 2-3 SPECIFIC positive reviews (verbatim excerpts)
  - Quote 2-3 SPECIFIC negative reviews (verbatim excerpts)
  - Common praise themes
  - Common complaint themes
• Other review sources: BBB rating, Zillow, GuildQuality, etc.
• Sales process observations from reviews
• Construction quality mentions
• Communication and responsiveness feedback
• Warranty service reputation
• NPS or satisfaction scores if available

SECTION 6: COMPETITIVE ADVANTAGES & VULNERABILITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Their strongest advantages vs ${builderName} (be honest)
• Their key weaknesses ${builderName} can exploit
• Markets where they dominate vs where they struggle
• Product gaps or underserved segments
• Operational challenges mentioned in reviews or news

SECTION 7: STRATEGIC RECOMMENDATIONS FOR ${builderName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Provide 5-10 SPECIFIC, ACTIONABLE recommendations:
• How to position against this competitor
• Pricing strategies to compete
• Marketing messages that differentiate
• Product improvements to consider
• Markets to target or avoid
• Customer experience enhancements

IMPORTANT: Every finding must include supporting evidence. Avoid generic statements. If you cannot find specific data, state that explicitly rather than making vague claims.`,

  contentStrategyResearch: (builderName: string, markets: string[], targetAudience: string, builderContext?: string) => `You are a senior content strategist and SEO expert specializing in residential home building marketing. Create an EXHAUSTIVE, data-driven content strategy for ${builderName}.

YOUR OUTPUT MUST BE HIGHLY SPECIFIC AND ACTIONABLE - not generic advice. Include specific blog titles, keyword targets, content outlines, and measurable goals.

=== BUILDER PROFILE ===
- Company: ${builderName}
- Markets: ${markets.join(", ")}
- Target Audience: ${targetAudience}

${builderContext ? `
=== BUILDER'S COMMUNITIES & PRODUCTS ===
${builderContext}

Use this information to recommend content that directly promotes their specific communities, floorplans, and unique selling points.
` : ""}

=== COMPREHENSIVE CONTENT STRATEGY ===

SECTION 1: MARKET & KEYWORD RESEARCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For EACH market (${markets.join(", ")}), research and provide:

High-Intent Keywords (Buyer Ready):
• List 10-15 specific keywords with estimated search volume
• Example: "new homes in [city] under $400k" - Est. 500 searches/mo
• Include price range keywords relevant to their offerings
• Include community/neighborhood keywords

Informational Keywords (Research Phase):
• List 10-15 question keywords people search
• Example: "is it cheaper to build or buy in [market]" - Est. 1,200/mo
• Focus on home buying education queries

Local Keywords:
• "[Market] new construction communities"
• "best neighborhoods in [market] for families"
• "[Market] school districts ranking"
• "[Market] new home builders"

Long-Tail Opportunities:
• Lower competition phrases with buying intent
• Specific feature-based searches
• Comparison searches

SECTION 2: BLOG CONTENT CALENDAR (20+ Article Ideas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For each article, provide:
• Exact title (optimized for SEO)
• Primary keyword target
• Secondary keywords
• Article outline (5-7 sections)
• Estimated word count
• Content type (guide, listicle, comparison, FAQ)
• Priority (high/medium/low)
• Funnel stage (awareness, consideration, decision)

COMMUNITY SPOTLIGHT ARTICLES (One per community):
${builderContext ? `Based on their communities, create specific article ideas that highlight each community's unique features.` : "Create template articles for community spotlights."}

LOCAL GUIDES:
• "[Market]: Complete Guide to Buying a New Home in 2024"
• "Best School Districts in [Market] for Growing Families"
• "Cost of Living in [Market]: What New Homebuyers Need to Know"
• "[Market] vs [Nearby City]: Where Should You Buy?"

BUYER EDUCATION SERIES:
• "New Construction vs Resale Homes: Complete Comparison"
• "Understanding the New Home Building Process: Timeline & Steps"
• "How to Customize Your New Home: Options & Upgrades Explained"
• "Financing a New Construction Home: Complete Guide"
• "What's Included in a New Home Warranty?"

FEATURE/DESIGN CONTENT:
• "Top Kitchen Features in New Homes 2024"
• "Smart Home Technology: What's Standard vs Upgrade"
• "Energy Efficiency in New Homes: What to Look For"
• "Open Floor Plans vs Traditional: Pros and Cons"

SECTION 3: VIDEO CONTENT STRATEGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YouTube Content Plan (10+ video ideas):
• Community video tours with scripts outline
• Model home walkthrough format
• "Day in the Life" buyer journey content
• Construction progress updates
• Design center tours
• Homeowner testimonials template
• Educational shorts topics

TikTok/Reels Strategy:
• 10+ short-form content ideas
• Trending sounds/formats to leverage
• Behind-the-scenes content types
• Quick tips series concepts

SECTION 4: SOCIAL MEDIA CONTENT PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Monthly Content Mix (posts per platform):
• Facebook: X posts/week - content types
• Instagram: X posts/week - content types
• LinkedIn: X posts/week - content types

Content Pillars for ${builderName}:
1. Community & Lifestyle (X%)
2. Home Features & Design (X%)
3. Buyer Education (X%)
4. Company Culture & Trust (X%)
5. Promotions & Urgency (X%)

Monthly Theme Calendar:
• January: [Theme] - specific post ideas
• February: [Theme] - specific post ideas
(Continue for all 12 months)

SECTION 5: EMAIL MARKETING SEQUENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lead Nurture Sequence (8-10 emails):
• Email 1: Welcome - Subject line, key content
• Email 2: Community Overview - Subject line, key content
...

Re-engagement Sequence (5 emails):
• For leads gone cold

Buyer Journey Sequence (by stage):
• Pre-contract emails
• Under-contract emails
• Post-close emails

SECTION 6: AI SEARCH OPTIMIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FAQ Content Strategy:
• 30+ specific questions to answer on website
• Organized by category
• Written in Q&A format for AI parsing

Structured Data Opportunities:
• FAQ schema implementation plan
• Organization schema details
• LocalBusiness schema for communities
• Product schema for floorplans

Content Formatting for AI:
• How to structure articles
• Data to include (prices, specs, dates)
• Factual claims to incorporate

SECTION 7: COMPETITIVE CONTENT GAPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Identify content competitors are creating that ${builderName} is missing:
• Topic gaps
• Format gaps
• Keyword gaps

SECTION 8: CONTENT PRODUCTION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Weekly Publishing Schedule:
• Monday: [Content type]
• Wednesday: [Content type]
• Friday: [Content type]

Resource Requirements:
• Writing needs
• Video production needs
• Design needs

90-Day Priority Roadmap:
Week 1-2: [Specific content to create]
Week 3-4: [Specific content to create]
(Continue for 12 weeks)

KPIs to Track:
• Blog traffic targets
• Keyword ranking goals
• Lead generation targets
• Social engagement benchmarks`,

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

  // ==========================================
  // DASHBOARD AI ASSISTANT
  // ==========================================

  dashboardAssistant: (builderName: string, context: string, dataSnapshot: string) => `You are the AI assistant for ${builderName}'s Builder AI dashboard. You are a knowledgeable, proactive partner that helps home builders grow their business.

=== YOUR IDENTITY ===
Name: Builder AI Assistant
Role: Strategic AI partner for home builders
Personality: Knowledgeable, proactive, data-driven, encouraging

=== BUILDER'S CURRENT DATA ===
${context}

=== REAL-TIME DATA SNAPSHOT ===
${dataSnapshot}

=== YOUR CAPABILITIES ===

1. **Business Intelligence**
   - Answer questions about leads, sales, communities, inventory
   - Provide performance insights and trends
   - Compare metrics to industry benchmarks
   - Identify opportunities and issues

2. **Marketing & Content**
   - Generate social media posts instantly
   - Write listing descriptions for homes
   - Create email campaign content
   - Suggest content ideas and strategies

3. **Competitive Intelligence**
   - Discuss competitor positioning
   - Provide market insights
   - Suggest competitive responses

4. **Lead Management**
   - Analyze lead quality and sources
   - Recommend follow-up actions
   - Identify hot leads needing attention

5. **Strategic Advice**
   - Pricing recommendations
   - Marketing strategy suggestions
   - Operational improvements
   - Growth opportunities

=== RESPONSE GUIDELINES ===

1. **Be Specific**: Always use actual data from the snapshot when available. Say "You have 12 active leads" not "You have some leads."

2. **Be Proactive**: If you notice something important (hot lead, inventory issue, opportunity), mention it even if not asked.

3. **Be Actionable**: End responses with clear next steps or recommendations when appropriate.

4. **Be Concise**: Keep responses focused and scannable. Use bullet points for lists.

5. **Be Encouraging**: Celebrate wins and progress. Frame challenges as opportunities.

6. **Content Generation**: When asked to write content:
   - Generate complete, ready-to-use content
   - Match professional home builder brand voice
   - Include relevant details from their data
   - Offer variations or ask about tone preference

7. **Quick Actions**: For common requests, provide immediate actionable outputs:
   - "Write a social post" → Generate 2-3 options immediately
   - "How are my leads?" → Show key metrics with insights
   - "What should I focus on?" → Prioritized action list

=== SAMPLE RESPONSES ===

For "How are my leads doing?":
"Your lead pipeline is looking healthy! Here's the snapshot:
• **12 active leads** this month (up from 8 last month)
• **3 hot leads** ready for follow-up
• Top source: Zillow (42% of leads)

🔥 **Priority**: Sarah Johnson requested pricing 2 days ago - she's visited 5 floor plans. I'd reach out today!

Want me to draft a follow-up email for her?"

For "Write a Facebook post":
"Here are 2 options for your Facebook post:

**Option 1 (Urgency):**
🏡 Only 3 Quick Move-In homes left at [Community]! These stunning 4-bedroom homes are ready for you to move in before summer. Starting at $XXX,XXX. Tour this weekend → [link]

**Option 2 (Lifestyle):**
Picture this: Saturday morning coffee on your covered patio, watching the kids play in the backyard. That's life at [Community]. Come see why families are choosing us → [link]

Which style works better for your audience?"

=== IMPORTANT RULES ===
- Never make up data - only use what's in the data snapshot
- If asked about something you don't have data for, offer to help find it
- Always maintain a helpful, professional tone
- Protect sensitive information (don't share specifics if asked to share externally)
- If asked to do something outside your capabilities, suggest alternatives`,
};

// Helper function to build context from builder data
// This function aggregates ALL onboarding data for AI context
export async function buildBuilderContext(organizationId: string): Promise<string> {
  const { prisma } = await import("./db");

  const [
    organization,
    communities,
    floorplans,
    incentives,
    inventoryHomes,
    competitors,
    leads,
    crmIntegrations,
  ] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
    }),
    prisma.community.findMany({
      where: { organizationId },
      include: {
        floorplans: true,
        incentives: { where: { isActive: true } },
        inventory: { where: { status: "available" } },
      },
    }),
    prisma.floorplan.findMany({
      where: { organizationId },
    }),
    prisma.incentive.findMany({
      where: {
        community: { organizationId },
        isActive: true,
      },
    }),
    prisma.inventoryHome.findMany({
      where: { 
        community: { organizationId },
        status: "available" 
      },
      include: {
        community: { select: { name: true } },
        floorplan: { select: { name: true, bedrooms: true, bathrooms: true, squareFeet: true } },
      },
    }),
    prisma.competitor.findMany({
      where: { organizationId },
      include: {
        communities: true,
      },
    }),
    prisma.lead.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.cRMIntegration.findMany({
      where: { organizationId, isActive: true },
    }),
  ]);

  let context = "";

  // ==========================================
  // COMPANY PROFILE
  // ==========================================
  context += "=== COMPANY PROFILE ===\n";
  context += `Builder Name: ${organization?.name || "Unknown"}\n`;
  if (organization?.website) {
    context += `Website: ${organization.website}\n`;
  }
  if (organization?.tagline) {
    context += `Tagline: ${organization.tagline}\n`;
  }
  if (organization?.description) {
    context += `About: ${organization.description}\n`;
  }
  if (organization?.marketsServed) {
    context += `Markets Served: ${organization.marketsServed}\n`;
  }
  if (organization?.buyerPersonas) {
    context += `Target Buyers: ${organization.buyerPersonas}\n`;
  }
  if (organization?.differentiators) {
    context += `What Sets Us Apart: ${organization.differentiators}\n`;
  }
  if (organization?.brandVoice) {
    context += `Brand Voice: ${organization.brandVoice}\n`;
  }

  // ==========================================
  // COMMUNITIES
  // ==========================================
  context += "\n=== COMMUNITIES ===\n";
  if (communities.length === 0) {
    context += "No communities added yet.\n";
  } else {
    for (const community of communities) {
      context += `\n📍 ${community.name} (${community.status})\n`;
      context += `   Location: ${community.address || ""} ${community.city}, ${community.state} ${community.zipCode || ""}\n`;
      if (community.startingPrice) {
        context += `   Starting From: $${community.startingPrice.toLocaleString()}\n`;
      }
      if (community.priceRange) {
        context += `   Price Range: ${community.priceRange}\n`;
      }
      if (community.description) {
        context += `   Description: ${community.description}\n`;
      }
      if (community.amenities) {
        const amenities = typeof community.amenities === 'string'
          ? community.amenities
          : JSON.stringify(community.amenities);
        context += `   Amenities: ${amenities}\n`;
      }
      if (community.hoaFee) {
        context += `   HOA Fees: $${community.hoaFee}/month\n`;
      }
      context += `   Floorplans Available: ${community.floorplans?.length || 0}\n`;
      context += `   Quick Move-In Homes: ${community.inventory?.length || 0}\n`;
      if (community.incentives && community.incentives.length > 0) {
        context += `   Active Incentives: ${community.incentives.map(i => i.title).join(", ")}\n`;
      }
    }
  }

  // ==========================================
  // FLOORPLANS
  // ==========================================
  context += "\n=== FLOORPLANS ===\n";
  if (floorplans.length === 0) {
    context += "No floorplans added yet.\n";
  } else {
    for (const plan of floorplans) {
      context += `\n🏠 ${plan.name} (${plan.status})\n`;
      context += `   Specs: ${plan.bedrooms} bed, ${plan.bathrooms} bath, ${plan.squareFeet.toLocaleString()} sqft\n`;
      context += `   Stories: ${plan.stories} | Garage: ${plan.garageSpaces}-car\n`;
      context += `   Base Price: $${plan.basePrice.toLocaleString()}\n`;
      if (plan.description) {
        context += `   Description: ${plan.description}\n`;
      }
      if (plan.features) {
        const features = typeof plan.features === 'string'
          ? plan.features
          : JSON.stringify(plan.features);
        context += `   Key Features: ${features}\n`;
      }
    }
  }

  // ==========================================
  // QUICK MOVE-IN INVENTORY
  // ==========================================
  context += "\n=== QUICK MOVE-IN INVENTORY ===\n";
  if (inventoryHomes.length === 0) {
    context += "No available inventory homes.\n";
  } else {
    for (const home of inventoryHomes) {
      context += `\n🏡 ${home.address || `Lot ${home.lot}`} at ${home.community?.name}\n`;
      context += `   Floorplan: ${home.floorplan?.name || "Custom"}\n`;
      if (home.floorplan) {
        context += `   Specs: ${home.floorplan.bedrooms} bed, ${home.floorplan.bathrooms} bath, ${home.floorplan.squareFeet?.toLocaleString() || "N/A"} sqft\n`;
      }
      context += `   Price: $${home.price?.toLocaleString() || "Call for pricing"}\n`;
      context += `   Status: ${home.status}\n`;
      if (home.moveInDate) {
        context += `   Move-In Ready: ${new Date(home.moveInDate).toLocaleDateString()}\n`;
      }
      if (home.features) {
        context += `   Included Features: ${home.features}\n`;
      }
      if (home.specialNotes) {
        context += `   Special Notes: ${home.specialNotes}\n`;
      }
    }
  }

  // ==========================================
  // CURRENT INCENTIVES
  // ==========================================
  if (incentives.length > 0) {
    context += "\n=== CURRENT INCENTIVES & PROMOTIONS ===\n";
    for (const incentive of incentives) {
      context += `\n🎁 ${incentive.title}\n`;
      context += `   ${incentive.description}\n`;
      if (incentive.value) {
        context += `   Value: ${incentive.value}\n`;
      }
      if (incentive.endDate) {
        context += `   Expires: ${new Date(incentive.endDate).toLocaleDateString()}\n`;
      }
    }
  }

  // ==========================================
  // COMPETITORS
  // ==========================================
  if (competitors.length > 0) {
    context += "\n=== TRACKED COMPETITORS ===\n";
    for (const competitor of competitors) {
      context += `\n🏢 ${competitor.name}\n`;
      if (competitor.website) {
        context += `   Website: ${competitor.website}\n`;
      }
      if (competitor.description) {
        context += `   Notes: ${competitor.description}\n`;
      }
      if (competitor.communities && competitor.communities.length > 0) {
        context += `   Known Communities: ${competitor.communities.map(c => c.name).join(", ")}\n`;
      }
    }
  }

  // ==========================================
  // LEAD SOURCES & METRICS
  // ==========================================
  if (leads.length > 0) {
    context += "\n=== LEAD INSIGHTS ===\n";

    // Calculate lead source distribution
    const sourceCount: Record<string, number> = {};
    const statusCount: Record<string, number> = {};

    for (const lead of leads) {
      const source = lead.source || "Unknown";
      const status = lead.status || "new";
      sourceCount[source] = (sourceCount[source] || 0) + 1;
      statusCount[status] = (statusCount[status] || 0) + 1;
    }

    context += `Total Leads: ${leads.length}\n`;
    context += `By Status: ${Object.entries(statusCount).map(([s, c]) => `${s}: ${c}`).join(", ")}\n`;
    context += `Top Sources: ${Object.entries(sourceCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, c]) => `${s}: ${c}`).join(", ")}\n`;
  }

  // ==========================================
  // CRM INTEGRATIONS
  // ==========================================
  if (crmIntegrations.length > 0) {
    context += "\n=== CRM INTEGRATIONS ===\n";
    for (const crm of crmIntegrations) {
      context += `Connected: ${crm.provider} (${crm.syncStatus || "active"})\n`;
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
    max_completion_tokens: options?.maxTokens ?? 1000,
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
    max_completion_tokens: options?.maxTokens ?? 1000,
    stream: true,
  });
}

// ==========================================
// SPECIALIZED DEEP RESEARCH FUNCTIONS
// ==========================================

// ==========================================
// SECTION-LEVEL SCORING FOR DEEP RESEARCH
// ==========================================

export interface SectionScore {
  section: string;
  score: number;
  maxScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

export interface DeepFootprintResult extends ResearchResult {
  sectionScores: SectionScore[];
  overallScore: number;
  overallGrade: string;
}

function scoreToGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

// Individual research pass for a focused section using OpenAI Agents SDK
async function performSectionResearch(
  sectionName: string,
  systemPrompt: string,
  query: string
): Promise<{
  findings: ResearchFinding[];
  sources: ResearchSource[];
  recommendations: string[];
  sectionScore: SectionScore;
}> {
  try {
    // Use agent with real web search for this research section
    const outputText = await runResearchAgent(
      `${sectionName} Analyst`,
      systemPrompt,
      query,
      { maxTokens: 4000 }
    );

    const parsePrompt = `Parse this research analysis into structured JSON. The section is "${sectionName}".

Return ONLY valid JSON with this exact structure:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentence summary of this section's findings>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "weaknesses": ["<specific weakness 1>", "<specific weakness 2>"],
  "findings": [
    {
      "category": "${sectionName.toLowerCase()}",
      "title": "<finding title>",
      "description": "<detailed description>",
      "importance": "high|medium|low",
      "details": "<additional context>",
      "dataPoints": [{"label": "<metric name>", "value": "<metric value>", "source": "<where this data came from>"}],
      "actionItems": ["<specific action 1>", "<specific action 2>"],
      "metrics": [{"name": "<metric>", "value": "<value>", "benchmark": "<industry avg>", "trend": "up|down|stable", "interpretation": "<what this means>"}]
    }
  ],
  "recommendations": ["<specific actionable recommendation 1>", "<recommendation 2>"],
  "sources": [{"url": "<URL found in research>", "title": "<page title>", "relevance": 0.8}]
}

IMPORTANT: Include at LEAST 5 detailed findings with data points and metrics. Be very specific with data - include actual numbers, URLs, dates, and concrete observations. Extract all URLs/sources mentioned in the research text.

Research text:
${outputText}`;

    const parseResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: parsePrompt }],
      temperature: 0.3,
      max_completion_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(parseResponse.choices[0]?.message?.content || "{}");
    const score = Math.min(100, Math.max(0, parsed.score || 50));

    return {
      findings: (parsed.findings || []).map((f: ResearchFinding) => ({
        ...f,
        category: f.category || sectionName.toLowerCase(),
      })),
      sources: (parsed.sources || []).map((s: ResearchSource) => ({
        url: s.url || "",
        title: s.title || s.url || "",
        relevance: s.relevance || 0.7,
      })),
      recommendations: parsed.recommendations || [],
      sectionScore: {
        section: sectionName,
        score,
        maxScore: 100,
        grade: scoreToGrade(score),
        summary: parsed.summary || "",
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
      },
    };
  } catch (error) {
    console.error(`Section research error (${sectionName}):`, error);
    return {
      findings: [],
      sources: [],
      recommendations: [],
      sectionScore: {
        section: sectionName,
        score: 0,
        maxScore: 100,
        grade: "F",
        summary: `Analysis for ${sectionName} could not be completed.`,
        strengths: [],
        weaknesses: [],
      },
    };
  }
}

// Multi-pass deep research for digital footprint
export async function analyzeDigitalFootprintDeep(
  builderName: string,
  websiteUrl: string,
  organizationId: string,
  socialProfiles?: string[],
  additionalUrls?: {
    tiktokUrl?: string;
    pinterestUrl?: string;
    yelpUrl?: string;
    bbbUrl?: string;
    houzzUrl?: string;
    competitorUrls?: string[];
  },
  onProgress?: (section: string, step: number, totalSteps: number) => Promise<void>
): Promise<DeepFootprintResult> {
  const builderContext = await buildBuilderContext(organizationId);
  const totalSteps = 7;
  let currentStep = 0;

  const allProfiles = [
    ...(socialProfiles?.filter(Boolean) || []),
    additionalUrls?.tiktokUrl,
    additionalUrls?.pinterestUrl,
    additionalUrls?.yelpUrl,
    additionalUrls?.bbbUrl,
    additionalUrls?.houzzUrl,
  ].filter(Boolean) as string[];

  // --- PASS 1: Website & UX Analysis ---
  if (onProgress) await onProgress("Website & UX Analysis", ++currentStep, totalSteps);
  const websiteResult = await performSectionResearch(
    "Website",
    `You are a senior UX analyst and web strategist for the home building industry. Conduct an in-depth audit of ${builderName}'s website at ${websiteUrl}.

${builderContext ? `BUILDER CONTEXT:\n${builderContext}\n` : ""}

Analyze with EXTREME SPECIFICITY:
1. HOMEPAGE: First impression, above-fold content, hero imagery quality, value proposition clarity, primary CTAs, trust signals (awards, certifications, review counts), load time feel
2. NAVIGATION & UX: Menu structure, search functionality, community finder, floorplan browser, mobile responsiveness, breadcrumbs, footer organization
3. COMMUNITY PAGES: Information completeness (maps, amenities, schools, photos, virtual tours, pricing), page structure, internal linking
4. FLOORPLAN PAGES: Interactive floorplans, elevations shown, specs clarity, pricing shown, comparison tools, customization options
5. CONVERSION ELEMENTS: Lead capture forms (field count, friction level), CTAs per page, contact methods (chat, phone, email, schedule), brochure downloads, virtual tour access
6. CONTENT QUALITY: Blog/resource section (quantity, recency, topics), about/team pages, homeowner testimonials, construction process explanation, FAQ completeness
7. TECHNICAL: SSL, page speed indicators, mobile-friendliness, image optimization, accessibility basics
8. TRUST & CREDIBILITY: Reviews/ratings displayed, awards shown, warranty info, builder history, social proof

Score /100 and provide granular findings with specific page-by-page observations. Reference actual URLs, button text, image descriptions.`,
    `Conduct a thorough website audit of ${builderName} at ${websiteUrl}. Visit the homepage, community pages, floorplan pages, about page, and blog. Evaluate UX, content quality, conversion optimization, and technical indicators. Provide specific observations.`
  );

  // --- PASS 2: Social Media Deep Dive ---
  if (onProgress) await onProgress("Social Media Audit", ++currentStep, totalSteps);
  const socialResult = await performSectionResearch(
    "Social Media",
    `You are a social media strategist specializing in home builder marketing. Audit ${builderName}'s social media presence across ALL platforms.

${allProfiles.length > 0 ? `Known profiles: ${allProfiles.join(", ")}` : `Search for ${builderName}'s social profiles across all major platforms.`}

For EACH platform found, provide ACTUAL data:
1. FACEBOOK: Page URL, follower count, posting frequency, average engagement per post, content types used, review rating, response time to comments
2. INSTAGRAM: Handle, follower count, engagement rate, content style, hashtag strategy, Stories/Reels frequency, bio optimization
3. YOUTUBE: Channel URL, subscriber count, video count, average views, content types, production quality, upload frequency
4. LINKEDIN: Company page, follower count, posting frequency, content focus, employee advocacy
5. TIKTOK: ${additionalUrls?.tiktokUrl || "Search for presence"} - follower count, content style, trending formats used
6. PINTEREST: ${additionalUrls?.pinterestUrl || "Search for presence"} - pin count, board organization, visual quality

CROSS-PLATFORM ANALYSIS:
- Brand consistency across platforms
- Content calendar gaps
- Engagement comparison across platforms
- Content themes that work best
- Missed opportunities

Score /100 based on presence, content quality, engagement, and consistency.`,
    `Search for ${builderName} (${websiteUrl}) on Facebook, Instagram, YouTube, LinkedIn, TikTok, Pinterest. Find their actual profiles and analyze follower counts, posting frequency, engagement rates, and content quality. ${allProfiles.length > 0 ? `Known profiles: ${allProfiles.join(", ")}` : ""}`
  );

  // --- PASS 3: Online Reputation & Reviews ---
  if (onProgress) await onProgress("Reputation & Reviews", ++currentStep, totalSteps);
  const reputationResult = await performSectionResearch(
    "Reputation",
    `You are a reputation management specialist for the home building industry. Conduct a thorough audit of ${builderName}'s online reputation.

Research reviews and ratings on EVERY platform:
1. GOOGLE BUSINESS PROFILE: Star rating, total review count, review velocity, response rate, response quality, photo count
   - QUOTE 3-5 specific positive reviews (verbatim excerpts)
   - QUOTE 3-5 specific negative reviews (verbatim excerpts)
2. BBB: ${additionalUrls?.bbbUrl || `Search for ${builderName}`} - Rating, accreditation, complaint count
3. YELP: ${additionalUrls?.yelpUrl || `Search for ${builderName}`} - Rating, review count
4. HOUZZ: ${additionalUrls?.houzzUrl || `Search for ${builderName}`} - Rating, review count, badges
5. ZILLOW: Builder profile rating and review count
6. HOMEADVISOR/ANGI: Presence and rating
7. GLASSDOOR: Employee reviews

SENTIMENT ANALYSIS:
- Top 5 most praised aspects across ALL reviews
- Top 5 most criticized aspects
- Sentiment trend (improving or declining)

NEWS & PRESS:
- Recent news articles, press releases, awards, any controversies

Score /100 based on overall reputation health.`,
    `Search for ${builderName} reviews and ratings across Google Business, BBB, Yelp, Houzz, Zillow, HomeAdvisor, and news outlets. Find actual star ratings, review counts, and quote specific reviews. Search for recent news about ${builderName} home builder.`
  );

  // --- PASS 4: SEO & Local Search ---
  if (onProgress) await onProgress("SEO & Local Search", ++currentStep, totalSteps);
  const seoResult = await performSectionResearch(
    "SEO",
    `You are a technical SEO expert specializing in home builder websites. Conduct a thorough SEO and local search audit of ${builderName} (${websiteUrl}).

TECHNICAL SEO:
1. Domain authority indicators
2. Meta title/description quality on key pages
3. Header structure (H1, H2, H3 usage)
4. Schema markup: Organization, LocalBusiness, Product, FAQ, Review, BreadcrumbList schemas
5. Sitemap and robots.txt
6. Internal linking structure
7. Image alt text, URL structure, page speed
8. Mobile usability

KEYWORD RANKINGS:
- Search "${builderName}" - what appears?
- Search "new homes [their markets]" - do they rank?
- Search "home builders [their markets]" - do they rank?
- Search "[community names]" - do community pages rank?

LOCAL SEO:
- Google Business Profile optimization
- NAP consistency across directories
- Local pack appearance
- Directory listings: Realtor.com, NewHomeSource, BDX, Zillow
- Community-specific landing pages

Score /100 for overall SEO health.`,
    `Analyze the SEO performance of ${builderName} (${websiteUrl}). Check search visibility, schema markup, local business listings on Realtor.com, NewHomeSource, Zillow, and Google Business Profile. Evaluate technical SEO indicators.`
  );

  // --- PASS 5: AI Search Visibility ---
  if (onProgress) await onProgress("AI Search Visibility", ++currentStep, totalSteps);
  const aiResult = await performSectionResearch(
    "AI Visibility",
    `You are an AI search optimization expert. Analyze how well ${builderName} is positioned for AI-powered search (ChatGPT, Gemini, Perplexity, Bing Copilot).

${builderContext ? `BUILDER CONTEXT:\n${builderContext}\n` : ""}

AI SEARCH PRESENCE:
1. Would AI assistants recommend ${builderName} for searches like "best home builders in [their markets]"?
2. What information about them is accurate vs outdated in AI knowledge?
3. What competitors get recommended instead?

STRUCTURED DATA FOR AI:
- Organization schema? LocalBusiness schema? Product schema? FAQ schema?
- BreadcrumbList, Review/AggregateRating, Event schemas?

CONTENT OPTIMIZED FOR AI:
- Clear, factual, citeable content on website?
- Prices and specs in text (not just images)?
- Comprehensive FAQ with natural language Q&A?
- Comparison pages and data tables?

AI CRAWLER ACCESS:
- robots.txt analysis for GPTBot, Google-Extended
- llms.txt or ai.txt presence
- Server-rendered content accessibility

KNOWLEDGE GRAPH:
- Google Knowledge Panel presence and optimization
- Wikidata/Wikipedia entries

Score /100 for AI search readiness.`,
    `Research how ${builderName} (${websiteUrl}) appears in AI search tools. Check for structured data (schema.org), AI crawler access in robots.txt, content suitability for AI citation, and Knowledge Graph presence.`
  );

  // --- PASS 6: Competitive Benchmarking ---
  if (onProgress) await onProgress("Competitive Benchmarking", ++currentStep, totalSteps);
  const competitorUrls = additionalUrls?.competitorUrls?.filter(Boolean) || [];
  const competitiveResult = await performSectionResearch(
    "Competitive",
    `You are a competitive intelligence analyst in the home building industry. Compare ${builderName}'s digital presence to competitors.

${builderContext ? `BUILDER CONTEXT:\n${builderContext}\n` : ""}
${competitorUrls.length > 0 ? `Compare specifically against: ${competitorUrls.join(", ")}` : "Identify 2-3 major competitors in the same markets."}

COMPARATIVE ANALYSIS:
1. Identify top 2-3 competitors
2. For each, compare: website quality, social media, reviews, SEO, content marketing, AI visibility
3. SPECIFIC GAPS: What are competitors doing that ${builderName} is NOT?
4. COMPETITIVE ADVANTAGES: Where does ${builderName} already lead?

Provide a comparison matrix and specific gap-closing recommendations.`,
    `Compare ${builderName} (${websiteUrl}) digital presence to main competitors. ${competitorUrls.length > 0 ? `Competitors: ${competitorUrls.join(", ")}` : "Identify major competitors."} Compare website quality, social media, reviews, SEO, and AI visibility.`
  );

  // --- PASS 7: Executive Summary ---
  if (onProgress) await onProgress("Generating Executive Report", ++currentStep, totalSteps);

  const allFindings = [
    ...websiteResult.findings,
    ...socialResult.findings,
    ...reputationResult.findings,
    ...seoResult.findings,
    ...aiResult.findings,
    ...competitiveResult.findings,
  ];

  const allSources = [
    ...websiteResult.sources,
    ...socialResult.sources,
    ...reputationResult.sources,
    ...seoResult.sources,
    ...aiResult.sources,
    ...competitiveResult.sources,
  ];

  const allRecommendations = [
    ...websiteResult.recommendations,
    ...socialResult.recommendations,
    ...reputationResult.recommendations,
    ...seoResult.recommendations,
    ...aiResult.recommendations,
    ...competitiveResult.recommendations,
  ];

  const sectionScores = [
    websiteResult.sectionScore,
    socialResult.sectionScore,
    reputationResult.sectionScore,
    seoResult.sectionScore,
    aiResult.sectionScore,
    competitiveResult.sectionScore,
  ];

  const weights: Record<string, number> = {
    Website: 0.25,
    "Social Media": 0.15,
    Reputation: 0.20,
    SEO: 0.20,
    "AI Visibility": 0.10,
    Competitive: 0.10,
  };

  const overallScore = Math.round(
    sectionScores.reduce((acc, s) => acc + s.score * (weights[s.section] || 0.15), 0)
  );

  // Generate executive summary
  let executiveSummary = `${builderName}'s digital presence scored ${overallScore}/100 across website, social media, reputation, SEO, AI visibility, and competitive positioning.`;
  try {
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Based on these section analyses of ${builderName}'s digital presence, write a concise executive summary (4-6 sentences).

Sections: ${sectionScores.map(s => `${s.section} (${s.score}/100): ${s.summary}`).join("\n")}
Overall: ${overallScore}/100

Also create a prioritized action plan. Return JSON:
{
  "executiveSummary": "<4-6 sentence summary>",
  "prioritizedActions": {
    "immediate": ["<action>", ...],
    "shortTerm": ["<action>", ...],
    "mediumTerm": ["<action>", ...]
  }
}`
      }],
      temperature: 0.5,
      max_completion_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const summaryParsed = JSON.parse(summaryResponse.choices[0]?.message?.content || "{}");
    executiveSummary = summaryParsed.executiveSummary || executiveSummary;

    const prioritized = summaryParsed.prioritizedActions;
    if (prioritized) {
      const prioritizedRecs: string[] = [];
      if (prioritized.immediate) prioritized.immediate.forEach((a: string) => prioritizedRecs.push(`[IMMEDIATE] ${a}`));
      if (prioritized.shortTerm) prioritized.shortTerm.forEach((a: string) => prioritizedRecs.push(`[SHORT-TERM] ${a}`));
      if (prioritized.mediumTerm) prioritized.mediumTerm.forEach((a: string) => prioritizedRecs.push(`[MEDIUM-TERM] ${a}`));
      allRecommendations.unshift(...prioritizedRecs);
    }
  } catch (e) {
    console.error("Executive summary generation error:", e);
  }

  // Deduplicate sources
  const uniqueSources = allSources.reduce<ResearchSource[]>((acc, s) => {
    if (!acc.find(existing => existing.url === s.url)) acc.push(s);
    return acc;
  }, []);

  return {
    summary: executiveSummary,
    findings: allFindings,
    sources: uniqueSources,
    recommendations: allRecommendations,
    generatedAt: new Date(),
    sectionScores,
    overallScore,
    overallGrade: scoreToGrade(overallScore),
  };
}

// Legacy single-pass function (kept for backward compatibility)
export async function analyzeDigitalFootprint(
  builderName: string,
  websiteUrl: string,
  organizationId: string,
  socialProfiles?: string[]
): Promise<ResearchResult> {
  const builderContext = await buildBuilderContext(organizationId);
  const prompt = SYSTEM_PROMPTS.digitalFootprintAnalysis(builderName, websiteUrl, socialProfiles, builderContext);
  const query = `Conduct an exhaustive digital presence audit for ${builderName} (${websiteUrl}). Analyze website, social media, reviews, SEO, and AI search visibility with specific metrics and actionable recommendations.`;

  return performDeepResearch(query, prompt, { searchDepth: "deep", maxSearches: 10 });
}

export async function researchCompetitor(
  builderName: string,
  competitorName: string,
  criteria: string[],
  organizationId: string
): Promise<ClaudeDeepResearchResult> {
  // Use Claude API for deep forensic competitor research
  return performClaudeDeepResearch(builderName, competitorName, criteria, organizationId);
}

export async function getContentStrategy(
  builderName: string,
  markets: string[],
  targetAudience: string,
  organizationId: string
): Promise<ResearchResult> {
  // Get builder context for personalized content recommendations
  const builderContext = await buildBuilderContext(organizationId);
  const prompt = SYSTEM_PROMPTS.contentStrategyResearch(builderName, markets, targetAudience, builderContext);
  const query = `Create a comprehensive content strategy for ${builderName} targeting ${targetAudience} in ${markets.join(", ")}. Include specific blog topics, keyword research, social media calendar, and video content ideas.`;

  return performDeepResearch(query, prompt, { searchDepth: "deep", maxSearches: 8 });
}

export async function analyzeMarket(
  builderName: string,
  market: string
): Promise<ResearchResult> {
  const prompt = SYSTEM_PROMPTS.marketResearch(builderName, market);
  const query = `Conduct market research for the ${market} housing market for ${builderName}`;

  return performDeepResearch(query, prompt, { searchDepth: "deep" });
}

// ==========================================
// CLAUDE DEEP RESEARCH (ANTHROPIC API)
// ==========================================

export interface ClaudeDeepResearchResult extends ResearchResult {
  battleCardSummary: BattleCardSummary;
  fullReport: string; // Complete markdown report from Claude
}

export interface BattleCardSummary {
  competitorName: string;
  builderName: string;
  overallThreatLevel: "high" | "medium" | "low";
  keyStrengths: { yours: string[]; theirs: string[] };
  pricingComparison: string;
  marketPositioning: string;
  topOpportunities: string[];
  topThreats: string[];
  quickWins: string[];
  talkingPoints: string[];
}

// Perform deep forensic competitor research using OpenAI Agents SDK with web search
export async function performClaudeDeepResearch(
  builderName: string,
  competitorName: string,
  criteria: string[],
  organizationId: string
): Promise<ClaudeDeepResearchResult> {
  const builderContext = await buildBuilderContext(organizationId);

  const systemPrompt = `You are an elite competitive intelligence analyst conducting a full forensic investigation on a home builder competitor. Your analysis must be EXHAUSTIVE and DETAILED - think of yourself as a private investigator digging into every aspect of this competitor's business.

You have deep expertise in:
- Residential real estate and home building industry
- Competitive intelligence and market analysis
- Digital marketing and brand analysis
- Financial analysis and business strategy
- Customer experience and reputation management

YOUR MISSION: Conduct an extensive deep dive on ${competitorName} as a direct competitor to ${builderName}. Leave no stone unturned. Provide every piece of intelligence you can gather.

${builderContext ? `
=== YOUR CLIENT'S PROFILE (${builderName}) ===
${builderContext}

Use this information to provide DIRECT COMPARISONS throughout your analysis.
` : ""}

=== RESEARCH FOCUS AREAS ===
${criteria.map((c, i) => `${i + 1}. ${c}`).join("\n")}`;

  const userPrompt = `Conduct a FULL FORENSIC DEEP DIVE on ${competitorName}. I need two deliverables:

## DELIVERABLE 1: BATTLE CARD SUMMARY (JSON)
First, output a JSON block wrapped in \`\`\`json ... \`\`\` tags with this exact structure:
{
  "competitorName": "${competitorName}",
  "builderName": "${builderName}",
  "overallThreatLevel": "high|medium|low",
  "keyStrengths": {
    "yours": ["strength1", "strength2", "strength3", "strength4", "strength5"],
    "theirs": ["strength1", "strength2", "strength3", "strength4", "strength5"]
  },
  "pricingComparison": "Brief pricing comparison summary",
  "marketPositioning": "How they position vs you",
  "topOpportunities": ["opp1", "opp2", "opp3"],
  "topThreats": ["threat1", "threat2", "threat3"],
  "quickWins": ["win1", "win2", "win3"],
  "talkingPoints": ["point1", "point2", "point3", "point4", "point5"]
}

## DELIVERABLE 2: FULL COMPETITIVE INTELLIGENCE REPORT
After the JSON block, provide the complete detailed report in markdown format. Be EXHAUSTIVE. Include:

### COMPANY INTELLIGENCE
- Ownership, founding year, key executives, leadership team
- Estimated annual closings, revenue, employee count
- Geographic footprint with SPECIFIC markets, cities, submarkets
- Growth trajectory, recent expansions, acquisitions
- Financial health indicators

### PRODUCT PORTFOLIO DEEP DIVE
- LIST every known active community with locations
- Price ranges by community and product type
- Floorplan analysis: entry-level, mid-range, premium offerings
- Standard inclusions vs ${builderName}
- Upgrade options and typical upgrade spend
- Build times and move-in timelines
- Current inventory/QMI availability

### PRICING FORENSICS
- Specific base price ranges by floorplan size
- Price-per-square-foot analysis vs ${builderName}
- Current incentives and promotions (be SPECIFIC):
  - Rate buydowns, closing cost contributions, free upgrades
- Historical pricing trends
- How pricing compares in shared markets

### MARKETING & DIGITAL PRESENCE
- Brand positioning, messaging, taglines, value propositions
- Website quality assessment
- Social media audit (Facebook, Instagram, YouTube, TikTok, LinkedIn)
  - Followers, posting frequency, engagement quality
- Advertising approach and estimated spend
- Content marketing and SEO strategy
- Realtor marketing programs

### CUSTOMER EXPERIENCE & REPUTATION
- Google Reviews: rating, count, recent trends
- Quote SPECIFIC reviews (positive and negative)
- Common praise themes and complaint patterns
- BBB rating, Zillow reviews, other sources
- Sales process reputation
- Construction quality feedback
- Warranty service reputation

### COMPETITIVE ADVANTAGES & VULNERABILITIES
- Their strongest advantages over ${builderName} (be honest)
- Key weaknesses ${builderName} can exploit
- Market dominance areas vs struggle areas
- Product gaps and underserved segments
- Operational challenges

### STRATEGIC BATTLE PLAN FOR ${builderName}
- 10+ SPECIFIC actionable recommendations
- Positioning strategies against this competitor
- Pricing tactics to compete
- Marketing messages that differentiate
- Product improvements to consider
- Customer experience enhancements
- Markets to target or avoid

Focus areas for this research: ${criteria.join(", ")}

IMPORTANT: Be thorough, specific, and honest. Include real data points where available. If information is uncertain, note that explicitly rather than guessing.`;

  try {
    // Use agent with real web search for competitor research
    const fullText = await runResearchAgent(
      `${competitorName} Competitor Intel`,
      systemPrompt,
      userPrompt,
      { maxTokens: 8000 }
    );

    // Parse the battle card JSON from the response
    let battleCardSummary: BattleCardSummary;
    try {
      const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        battleCardSummary = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON object directly
        const jsonStart = fullText.indexOf("{");
        const jsonEnd = fullText.indexOf("}", fullText.indexOf("talkingPoints")) + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          battleCardSummary = JSON.parse(fullText.substring(jsonStart, jsonEnd));
        } else {
          throw new Error("No JSON found");
        }
      }
    } catch {
      // Fallback battle card if parsing fails
      battleCardSummary = {
        competitorName,
        builderName,
        overallThreatLevel: "medium",
        keyStrengths: {
          yours: ["Refer to full report for details"],
          theirs: ["Refer to full report for details"],
        },
        pricingComparison: "See full report for detailed pricing analysis",
        marketPositioning: "See full report for positioning details",
        topOpportunities: ["Review full report for opportunities"],
        topThreats: ["Review full report for threats"],
        quickWins: ["Review full report for quick wins"],
        talkingPoints: ["Review full report for talking points"],
      };
    }

    // Extract the full report (everything after the JSON block)
    let fullReport = fullText;
    const jsonBlockEnd = fullText.indexOf("```", fullText.indexOf("```json") + 7);
    if (jsonBlockEnd !== -1) {
      fullReport = fullText.substring(jsonBlockEnd + 3).trim();
    }

    // Parse into structured findings for backward compatibility
    const structuredResponse = await parseResearchResponse(fullReport);

    return {
      summary: structuredResponse.summary,
      findings: structuredResponse.findings,
      sources: structuredResponse.sources,
      recommendations: structuredResponse.recommendations,
      generatedAt: new Date(),
      battleCardSummary,
      fullReport,
    };
  } catch (error) {
    console.error("Claude deep research error:", error);
    // Fallback to OpenAI if Claude fails
    const builderContextStr = await buildBuilderContext(organizationId);
    const prompt = SYSTEM_PROMPTS.competitorDeepResearch(builderName, competitorName, criteria, builderContextStr);
    const query = `Conduct exhaustive competitive intelligence research on ${competitorName} as a direct competitor to ${builderName}. Focus areas: ${criteria.join(", ")}`;
    const fallbackResult = await performDeepResearch(query, prompt, { searchDepth: "deep", maxSearches: 10 });

    return {
      ...fallbackResult,
      battleCardSummary: {
        competitorName,
        builderName,
        overallThreatLevel: "medium",
        keyStrengths: {
          yours: ["See full report"],
          theirs: ["See full report"],
        },
        pricingComparison: fallbackResult.summary,
        marketPositioning: "See full report",
        topOpportunities: fallbackResult.recommendations?.slice(0, 3) || [],
        topThreats: ["Review full report"],
        quickWins: fallbackResult.recommendations?.slice(0, 3) || [],
        talkingPoints: fallbackResult.recommendations?.slice(3, 8) || [],
      },
      fullReport: fallbackResult.summary + "\n\n" + fallbackResult.findings.map(f => `### ${f.title}\n${f.description}`).join("\n\n"),
    };
  }
}

// ==========================================
// COMPETITOR WEB MONITORING (OpenAI Web Search)
// ==========================================

export interface MonitorCheckResult {
  summary: string;
  hasUpdates: boolean;
  findings: MonitorFinding[];
  checkedAt: Date;
}

export interface MonitorFinding {
  category: string;
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  sourceUrl?: string;
}

// Check a competitor's website for updates using OpenAI Agents SDK web search
export async function checkCompetitorWebsite(
  competitorName: string,
  websiteUrl: string,
  builderName: string
): Promise<MonitorCheckResult> {
  const systemPrompt = `You are a competitive intelligence monitor for ${builderName}, a home builder. Your job is to search the web for the latest updates, news, and changes related to ${competitorName} (${websiteUrl}).

Focus on finding:
1. NEW community announcements or grand openings
2. Price changes or new incentive offers
3. New floorplan releases or product changes
4. Marketing campaigns or promotional events
5. News articles, press releases, or blog posts
6. Leadership changes or company news
7. New model home openings
8. Construction updates or timeline changes
9. Awards, recognition, or partnerships
10. Website changes or new features

For each finding, categorize it and assess its importance to ${builderName}.

Respond with a JSON object:
{
  "summary": "Brief 2-3 sentence overview of what's new",
  "hasUpdates": true/false,
  "findings": [
    {
      "category": "pricing|product|marketing|news|community|operations",
      "title": "Brief title",
      "description": "Detailed description of the update",
      "importance": "high|medium|low",
      "sourceUrl": "URL if available"
    }
  ]
}

If nothing new is found, set hasUpdates to false and provide a summary indicating no significant changes detected.
Respond only with valid JSON.`;

  const query = `Search for the latest news, updates, and changes for ${competitorName} home builder. Check their website ${websiteUrl} and any recent news articles, press releases, social media posts, or announcements. What's new or changed recently?`;

  try {
    // Use agent with real web search for competitor monitoring
    const outputText = await runResearchAgent(
      `${competitorName} Monitor`,
      systemPrompt,
      query,
      { maxTokens: 2000 }
    );

    // Parse the JSON response
    try {
      const jsonMatch = outputText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : outputText;
      const parsed = JSON.parse(jsonStr);

      return {
        summary: parsed.summary || "No updates found",
        hasUpdates: parsed.hasUpdates || false,
        findings: (parsed.findings || []).map((f: MonitorFinding) => ({
          category: f.category || "general",
          title: f.title || "Update",
          description: f.description || "",
          importance: f.importance || "medium",
          sourceUrl: f.sourceUrl,
        })),
        checkedAt: new Date(),
      };
    } catch {
      return {
        summary: outputText.slice(0, 500),
        hasUpdates: outputText.toLowerCase().includes("new") || outputText.toLowerCase().includes("update"),
        findings: [{
          category: "general",
          title: "Monitor Check Results",
          description: outputText,
          importance: "medium" as const,
        }],
        checkedAt: new Date(),
      };
    }
  } catch (error) {
    console.error("Competitor monitor check error:", error);
    return {
      summary: "Failed to check competitor website. Will retry on next scheduled check.",
      hasUpdates: false,
      findings: [],
      checkedAt: new Date(),
    };
  }
}
