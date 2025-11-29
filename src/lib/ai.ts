import OpenAI from "openai";

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
};

// Helper function to build context from builder data
export async function buildBuilderContext(organizationId: string): Promise<string> {
  const { prisma } = await import("./db");

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
