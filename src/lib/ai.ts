import OpenAI from "openai";

// Initialize OpenAI client using Replit AI Integrations
// This uses Replit's AI Integrations service, which provides OpenAI-compatible API access
// without requiring your own API key. Charges are billed to your Replit credits.
// The newest OpenAI model is "gpt-5" which was released August 7, 2025.
export const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
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

// Deep Research using OpenAI Responses API with web search
// Uses Replit AI Integrations which supports the responses API with web_search_preview tool
export async function performDeepResearch(
  query: string,
  systemPrompt: string,
  config: DeepResearchConfig = {}
): Promise<ResearchResult> {
  const { maxSearches = 5, searchDepth = "standard" } = config;

  try {
    // Use the responses API with web search tool for deep research capability
    // The web_search_preview tool enables real-time web search for up-to-date information
    // Input must be structured as array of {role, content} messages for multi-turn conversations
    const response = await openai.responses.create({
      model: "gpt-4o", // gpt-4o is supported by Replit AI Integrations for responses API
      tools: [{ type: "web_search_preview" }],
      tool_choice: "auto",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
    });

    // Extract the output text from the response
    let outputText = "";
    const sources: ResearchSource[] = [];

    for (const item of response.output) {
      if (item.type === "message" && item.content) {
        for (const contentItem of item.content) {
          if (contentItem.type === "output_text") {
            outputText = contentItem.text;
            // Extract annotations/citations if available
            if (contentItem.annotations) {
              for (const annotation of contentItem.annotations) {
                if (annotation.type === "url_citation") {
                  sources.push({
                    url: annotation.url,
                    title: annotation.title || annotation.url,
                    relevance: 0.8,
                  });
                }
              }
            }
          }
        }
      }
    }

    // Parse the response into structured findings
    const structuredResponse = await parseResearchResponse(outputText);

    return {
      summary: structuredResponse.summary,
      findings: structuredResponse.findings,
      sources: sources.length > 0 ? sources : structuredResponse.sources,
      recommendations: structuredResponse.recommendations,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Deep research error:", error);
    // Fallback to standard completion if responses API fails
    return await performFallbackResearch(query, systemPrompt);
  }
}

// Fallback research using standard chat completions
async function performFallbackResearch(
  query: string,
  systemPrompt: string
): Promise<ResearchResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o", // gpt-4o is supported by Replit AI Integrations
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
    // Use Replit AI Integrations for parsing research into structured format
    const parseResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // gpt-4o-mini is supported by Replit AI Integrations
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

// Chat completion helper - uses Replit AI Integrations
export async function getChatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
) {
  const response = await openai.chat.completions.create({
    model: options?.model || "gpt-4o", // gpt-4o is supported by Replit AI Integrations
    messages,
    temperature: options?.temperature ?? 0.7,
    max_completion_tokens: options?.maxTokens ?? 1000,
  });

  return response.choices[0]?.message?.content || "";
}

// Streaming chat completion helper - uses Replit AI Integrations
export async function streamChatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }
) {
  return openai.chat.completions.create({
    model: options?.model || "gpt-4o", // gpt-4o is supported by Replit AI Integrations
    messages,
    temperature: options?.temperature ?? 0.7,
    max_completion_tokens: options?.maxTokens ?? 1000,
    stream: true,
  });
}

// ==========================================
// SPECIALIZED DEEP RESEARCH FUNCTIONS
// ==========================================

export async function analyzeDigitalFootprint(
  builderName: string,
  websiteUrl: string,
  organizationId: string,
  socialProfiles?: string[]
): Promise<ResearchResult> {
  // Get builder context for personalized analysis
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
): Promise<ResearchResult> {
  // Get builder context for comparison
  const builderContext = await buildBuilderContext(organizationId);
  const prompt = SYSTEM_PROMPTS.competitorDeepResearch(builderName, competitorName, criteria, builderContext);
  const query = `Conduct exhaustive competitive intelligence research on ${competitorName} as a direct competitor to ${builderName}. Include specific pricing, communities, reviews, marketing analysis, and strategic recommendations. Focus areas: ${criteria.join(", ")}`;

  return performDeepResearch(query, prompt, { searchDepth: "deep", maxSearches: 10 });
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
