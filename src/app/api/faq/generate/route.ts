import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { openai, SYSTEM_PROMPTS, buildBuilderContext } from "@/lib/ai";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, category, communityId } = body;

    if (session.user.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let context = await buildBuilderContext(organizationId);

    if (communityId) {
      const community = await prisma.community.findUnique({
        where: { id: communityId },
        include: {
          floorplans: true,
          incentives: { where: { isActive: true } },
        },
      });
      if (community) {
        context += `\n\nFOCUS COMMUNITY: ${community.name}\n`;
        context += `Location: ${community.city}, ${community.state}\n`;
        context += `Starting Price: $${community.startingPrice?.toLocaleString()}\n`;
      }
    }

    const systemPrompt = SYSTEM_PROMPTS.faqGenerator(organization.name, context);

    const categoryPrompt = category
      ? `Focus specifically on the "${category}" category.`
      : "Cover multiple categories including general, pricing, financing, timeline, features, and community.";

    const userPrompt = `Generate 5-8 comprehensive FAQs for AI search optimization.

${categoryPrompt}

Format your response as a JSON array with this structure:
[
  {
    "category": "category_name",
    "question": "The question in natural language",
    "answer": "A comprehensive, helpful answer"
  }
]

Important guidelines:
- Use natural language that matches how people search
- Provide specific, accurate answers based on the builder data
- Include pricing ranges, timelines, and specific details when available
- Make questions conversational (e.g., "How long does it take to build a new home with [Builder]?")

Return ONLY the JSON array, no additional text.`;

    // Use Replit AI Integrations for FAQ generation
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-4o is supported by Replit AI Integrations
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || "[]";

    // Parse the JSON response
    let faqs;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      faqs = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      console.error("Failed to parse FAQ response:", content);
      faqs = [];
    }

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("FAQ generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate FAQs" },
      { status: 500 }
    );
  }
}
