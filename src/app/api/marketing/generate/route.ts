import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { openai, SYSTEM_PROMPTS, buildBuilderContext } from "@/lib/ai";
import { prisma } from "@/lib/db";

const contentPrompts: Record<string, string> = {
  social_post: "Create an engaging social media post",
  email: "Write a compelling email",
  blog: "Write a blog post",
  listing: "Create a property listing description",
  ad_copy: "Write advertising copy",
  realtor_email: "Write a professional email for real estate agents",
};

const platformPrompts: Record<string, string> = {
  facebook: "for Facebook (can be longer, include emoji, use conversational tone)",
  instagram: "for Instagram (shorter, visual-focused, include relevant hashtags)",
  linkedin: "for LinkedIn (professional tone, focus on value and expertise)",
  nurture: "for a lead nurture sequence (warm, helpful, builds trust)",
  announcement: "for announcing news or promotions (exciting, clear CTA)",
  follow_up: "for following up with interested buyers (personal, helpful)",
  re_engagement: "for re-engaging cold leads (value-focused, low pressure)",
  seo_article: "optimized for SEO (comprehensive, keyword-rich, structured)",
  community_spotlight: "highlighting a community (lifestyle-focused, descriptive)",
  market_update: "about the local real estate market (informative, expert)",
  qmi: "for a quick move-in home (urgency, features, availability)",
  inventory: "for available inventory (details, features, pricing)",
  mls: "for MLS listing (professional, detailed, follows guidelines)",
  google: "for Google Ads (concise, keyword-focused, clear CTA)",
  co_op_announcement: "announcing co-op commission or incentives",
  inventory_update: "updating agents on available inventory",
  event_invite: "inviting agents to a broker event",
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      organizationId,
      contentType,
      platform,
      communityId,
      floorplanId,
      additionalContext,
    } = body;

    if (session.user.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get organization and build context
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let context = await buildBuilderContext(organizationId);

    // Add specific community/floorplan context if selected
    if (communityId) {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: { incentives: { where: { isActive: true } } },
      });
      if (community) {
        context += `\n\nFOCUS COMMUNITY: ${community.name}\n`;
        context += `Location: ${community.city}, ${community.state}\n`;
        context += `Description: ${community.description || "N/A"}\n`;
        context += `Starting Price: $${community.startingPrice?.toLocaleString() || "Contact for pricing"}\n`;
      }
    }

    if (floorplanId) {
      const floorplan = await prisma.floorplan.findUnique({
        where: { id: floorplanId },
      });
      if (floorplan) {
        context += `\n\nFOCUS FLOORPLAN: ${floorplan.name}\n`;
        context += `${floorplan.bedrooms} bedrooms, ${floorplan.bathrooms} bathrooms\n`;
        context += `${floorplan.squareFeet.toLocaleString()} sq ft\n`;
        context += `Base Price: $${floorplan.basePrice.toLocaleString()}\n`;
        context += `Description: ${floorplan.description || "N/A"}\n`;
      }
    }

    // Build the generation prompt
    const basePrompt = contentPrompts[contentType] || "Create marketing content";
    const platformContext = platform ? platformPrompts[platform] || "" : "";
    const userContext = additionalContext
      ? `\n\nAdditional requirements: ${additionalContext}`
      : "";

    const systemPrompt = SYSTEM_PROMPTS.marketingAssistant(
      organization.name,
      organization.brandVoice || "",
      context
    );

    const userPrompt = `${basePrompt} ${platformContext}.${userContext}

Please generate the content now. Make it compelling, accurate, and on-brand. Use actual data from the builder information provided.`;

    // Use Replit AI Integrations for content generation
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o is supported by Replit AI Integrations
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 1500,
    });

    const generatedContent = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ content: generatedContent });
  } catch (error) {
    console.error("Marketing content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
