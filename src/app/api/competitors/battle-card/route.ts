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
    const { organizationId, competitorId } = body;

    if (session.user.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [organization, competitor, myFloorplans, myCommunities] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
      }),
      prisma.competitor.findFirst({
        where: { id: competitorId, organizationId },
        include: {
          communities: {
            include: { floorplans: true },
          },
        },
      }),
      prisma.floorplan.findMany({
        where: { organizationId, status: "active" },
      }),
      prisma.community.findMany({
        where: { organizationId, status: "active" },
        include: { floorplans: true },
      }),
    ]);

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (!competitor) {
      return NextResponse.json({ error: "Competitor not found or access denied" }, { status: 404 });
    }

    const myAvgPrice = myFloorplans.length > 0
      ? myFloorplans.reduce((sum, fp) => sum + fp.basePrice, 0) / myFloorplans.length
      : 0;
    const myAvgSqFt = myFloorplans.length > 0
      ? myFloorplans.reduce((sum, fp) => sum + fp.squareFeet, 0) / myFloorplans.length
      : 0;

    const competitorFloorplans = competitor.communities.flatMap(c => c.floorplans);
    const validCompFloorplans = competitorFloorplans.filter(fp => fp.price && fp.squareFeet);
    const compAvgPrice = validCompFloorplans.length > 0
      ? validCompFloorplans.reduce((sum, fp) => sum + (fp.price || 0), 0) / validCompFloorplans.length
      : 0;
    const compAvgSqFt = validCompFloorplans.length > 0
      ? validCompFloorplans.reduce((sum, fp) => sum + (fp.squareFeet || 0), 0) / validCompFloorplans.length
      : 0;

    let myContext = `YOUR COMPANY (${organization.name}):\n`;
    myContext += `- Tagline: ${organization.tagline || "Not set"}\n`;
    myContext += `- Differentiators: ${organization.differentiators || "Not specified"}\n`;
    myContext += `- Markets: ${organization.marketsServed || organization.city + ", " + organization.state}\n`;
    myContext += `- Communities: ${myCommunities.length}\n`;
    myContext += `- Floorplans: ${myFloorplans.length}\n`;
    myContext += `- Avg Price: $${Math.round(myAvgPrice).toLocaleString()}\n`;
    myContext += `- Avg Sq Ft: ${Math.round(myAvgSqFt).toLocaleString()}\n`;
    myContext += `- Price/Sq Ft: $${myAvgSqFt > 0 ? Math.round(myAvgPrice / myAvgSqFt) : 0}\n\n`;

    myContext += `COMPETITOR (${competitor.name}):\n`;
    myContext += `- Website: ${competitor.website || "Unknown"}\n`;
    myContext += `- Markets: ${competitor.markets || "Unknown"}\n`;
    myContext += `- Communities: ${competitor.communities.length}\n`;
    myContext += `- Floorplans tracked: ${competitorFloorplans.length}\n`;
    myContext += `- Avg Price: $${Math.round(compAvgPrice).toLocaleString()}\n`;
    myContext += `- Avg Sq Ft: ${Math.round(compAvgSqFt).toLocaleString()}\n`;
    myContext += `- Price/Sq Ft: $${compAvgSqFt > 0 ? Math.round(compAvgPrice / compAvgSqFt) : 0}\n\n`;

    myContext += `COMPETITOR COMMUNITY DETAILS:\n`;
    for (const comm of competitor.communities) {
      myContext += `${comm.name} (${comm.city}, ${comm.state}):\n`;
      myContext += `  Starting Price: $${comm.startingPrice?.toLocaleString() || "Unknown"}\n`;
      myContext += `  Price Range: ${comm.priceRange || "Unknown"}\n`;
      for (const fp of comm.floorplans) {
        myContext += `  - ${fp.name}: ${fp.bedrooms || "?"}bd/${fp.bathrooms || "?"}ba, `;
        myContext += `${fp.squareFeet?.toLocaleString() || "?"} sf, $${fp.price?.toLocaleString() || "Unknown"}\n`;
      }
    }

    const systemPrompt = `You are a competitive intelligence analyst for home builders. Create a battle card comparison that helps sales teams win deals against competitors.

Your analysis should be practical, actionable, and focused on what sales teams need to know to compete effectively.

IMPORTANT: You must respond with valid JSON only. No markdown, no explanation, just the JSON object.`;

    const userPrompt = `Generate a battle card comparison between ${organization.name} and ${competitor.name}.

${myContext}

Return a JSON object with this exact structure:
{
  "yourCompany": {
    "strengths": ["strength1", "strength2", "strength3"]
  },
  "competitor": {
    "strengths": ["strength1", "strength2", "strength3"]
  },
  "comparison": {
    "priceAdvantage": "you" or "them" or "tie",
    "valueAdvantage": "you" or "them" or "tie",
    "sizeAdvantage": "you" or "them" or "tie"
  },
  "winningPoints": ["point1", "point2", "point3", "point4"],
  "watchOutFor": ["warning1", "warning2", "warning3"],
  "recommendedTalkingPoints": ["talking point 1", "talking point 2", "talking point 3", "talking point 4"],
  "summary": "2-3 sentence executive summary of the competitive landscape"
}

Base your analysis on the actual data provided. Be specific and actionable.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    let battleCardContent;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      battleCardContent = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      battleCardContent = {
        yourCompany: { strengths: ["Quality construction", "Local reputation", "Customer service"] },
        competitor: { strengths: ["Competitive pricing", "Multiple locations", "Marketing presence"] },
        comparison: { priceAdvantage: "tie", valueAdvantage: "tie", sizeAdvantage: "tie" },
        winningPoints: ["Focus on quality", "Highlight local expertise", "Emphasize warranty"],
        watchOutFor: ["Price comparisons", "Competitor promotions"],
        recommendedTalkingPoints: ["Quality over quantity", "Local support", "Customer testimonials"],
        summary: "Competitive landscape analysis generated with limited data."
      };
    }

    const report = await prisma.competitiveReport.create({
      data: {
        title: `Battle Card: ${organization.name} vs ${competitor.name}`,
        reportType: "battle_card",
        content: JSON.stringify({
          battleCard: battleCardContent,
          rawData: {
            yourAvgPrice: myAvgPrice,
            yourAvgSqFt: myAvgSqFt,
            competitorAvgPrice: compAvgPrice,
            competitorAvgSqFt: compAvgSqFt,
          },
        }),
        summary: battleCardContent.summary,
        insights: JSON.stringify(battleCardContent.winningPoints),
        organizationId,
        competitorId,
      },
    });

    const battleCard = {
      id: report.id,
      generatedAt: report.generatedAt.toISOString(),
      yourCompany: {
        name: organization.name,
        strengths: battleCardContent.yourCompany.strengths,
        avgPrice: Math.round(myAvgPrice),
        avgSqFt: Math.round(myAvgSqFt),
        pricePerSqFt: myAvgSqFt > 0 ? Math.round(myAvgPrice / myAvgSqFt) : 0,
      },
      competitor: {
        name: competitor.name,
        strengths: battleCardContent.competitor.strengths,
        avgPrice: Math.round(compAvgPrice),
        avgSqFt: Math.round(compAvgSqFt),
        pricePerSqFt: compAvgSqFt > 0 ? Math.round(compAvgPrice / compAvgSqFt) : 0,
      },
      comparison: battleCardContent.comparison,
      winningPoints: battleCardContent.winningPoints,
      watchOutFor: battleCardContent.watchOutFor,
      recommendedTalkingPoints: battleCardContent.recommendedTalkingPoints,
      summary: battleCardContent.summary,
    };

    return NextResponse.json({ battleCard, analysisId: report.id });
  } catch (error) {
    console.error("Battle card generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate battle card" },
      { status: 500 }
    );
  }
}
