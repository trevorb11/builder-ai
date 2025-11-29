import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { openai, SYSTEM_PROMPTS } from "@/lib/ai";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, floorplanId, competitorId } = body;

    if (session.user.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get my floorplan
    const myFloorplan = await prisma.floorplan.findUnique({
      where: { id: floorplanId },
      include: { organization: true },
    });

    if (!myFloorplan) {
      return NextResponse.json({ error: "Floorplan not found" }, { status: 404 });
    }

    // Get competitor data
    const competitorQuery = competitorId
      ? { id: competitorId }
      : { organizationId };

    const competitors = await prisma.competitor.findMany({
      where: competitorQuery,
      include: {
        communities: {
          include: { floorplans: true },
        },
      },
    });

    // Build context for analysis
    let competitorContext = "COMPETITOR DATA:\n\n";
    for (const comp of competitors) {
      competitorContext += `${comp.name}:\n`;
      for (const comm of comp.communities) {
        competitorContext += `  Community: ${comm.name} (${comm.city}, ${comm.state})\n`;
        competitorContext += `  Starting Price: $${comm.startingPrice?.toLocaleString() || "Unknown"}\n`;
        for (const fp of comm.floorplans) {
          competitorContext += `    - ${fp.name}: ${fp.bedrooms || "?"}bd/${fp.bathrooms || "?"}ba, `;
          competitorContext += `${fp.squareFeet?.toLocaleString() || "?"} sf, `;
          competitorContext += `$${fp.price?.toLocaleString() || "Unknown"}\n`;
        }
      }
      competitorContext += "\n";
    }

    const systemPrompt = SYSTEM_PROMPTS.competitiveIntelligence(
      myFloorplan.organization.name
    );

    const userPrompt = `Analyze my floorplan against the competition:

MY FLOORPLAN:
- Name: ${myFloorplan.name}
- Bedrooms: ${myFloorplan.bedrooms}
- Bathrooms: ${myFloorplan.bathrooms}
- Square Feet: ${myFloorplan.squareFeet.toLocaleString()}
- Base Price: $${myFloorplan.basePrice.toLocaleString()}
- Price/SF: $${Math.round(myFloorplan.basePrice / myFloorplan.squareFeet)}

${competitorContext}

Please provide:
1. How my floorplan compares on price, size, and value
2. Key competitive advantages I should highlight
3. Potential objections from buyers comparing to competitors
4. Recommended positioning strategy
5. Suggested talking points for sales team

Be specific and actionable.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const analysis = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Competitive analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
