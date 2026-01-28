import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { openai } from "@/lib/ai";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const report = await prisma.competitiveReport.findUnique({
      where: { id },
      include: {
        organization: true,
        competitor: {
          include: {
            communities: {
              include: { floorplans: true },
            },
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existingContent = JSON.parse(report.content);
    if (existingContent.deepDive) {
      return NextResponse.json({
        id: report.id,
        generatedAt: report.generatedAt.toISOString(),
        yourCompany: report.organization.name,
        competitorName: report.competitor?.name || "Unknown",
        ...existingContent.deepDive,
      });
    }

    const myFloorplans = await prisma.floorplan.findMany({
      where: { organizationId: report.organizationId, status: "active" },
    });
    const myCommunities = await prisma.community.findMany({
      where: { organizationId: report.organizationId, status: "active" },
    });

    const myAvgPrice = myFloorplans.length > 0
      ? myFloorplans.reduce((sum, fp) => sum + fp.basePrice, 0) / myFloorplans.length
      : 0;
    const myAvgSqFt = myFloorplans.length > 0
      ? myFloorplans.reduce((sum, fp) => sum + fp.squareFeet, 0) / myFloorplans.length
      : 0;

    const competitor = report.competitor;
    const competitorFloorplans = competitor?.communities.flatMap(c => c.floorplans) || [];
    const validCompFloorplans = competitorFloorplans.filter(fp => fp.price && fp.squareFeet);
    const compAvgPrice = validCompFloorplans.length > 0
      ? validCompFloorplans.reduce((sum, fp) => sum + (fp.price || 0), 0) / validCompFloorplans.length
      : 0;
    const compAvgSqFt = validCompFloorplans.length > 0
      ? validCompFloorplans.reduce((sum, fp) => sum + (fp.squareFeet || 0), 0) / validCompFloorplans.length
      : 0;

    let context = `DETAILED COMPETITIVE ANALYSIS REQUEST\n\n`;
    context += `YOUR COMPANY: ${report.organization.name}\n`;
    context += `- Tagline: ${report.organization.tagline || "Not set"}\n`;
    context += `- Differentiators: ${report.organization.differentiators || "Not specified"}\n`;
    context += `- Target Buyers: ${report.organization.buyerPersonas || "Not specified"}\n`;
    context += `- Markets: ${report.organization.marketsServed || "Not specified"}\n`;
    context += `- Communities: ${myCommunities.length}\n`;
    context += `- Floorplans: ${myFloorplans.length}\n`;
    context += `- Avg Price: $${Math.round(myAvgPrice).toLocaleString()}\n`;
    context += `- Avg Sq Ft: ${Math.round(myAvgSqFt).toLocaleString()}\n`;
    if (myFloorplans.length > 0) {
      context += `- Price Range: $${Math.min(...myFloorplans.map(f => f.basePrice)).toLocaleString()} - $${Math.max(...myFloorplans.map(f => f.basePrice)).toLocaleString()}\n\n`;
    } else {
      context += `- Price Range: Not available\n\n`;
    }

    context += `COMPETITOR: ${competitor?.name || "Unknown"}\n`;
    context += `- Website: ${competitor?.website || "Unknown"}\n`;
    context += `- Description: ${competitor?.description || "Unknown"}\n`;
    context += `- Markets: ${competitor?.markets || "Unknown"}\n`;
    context += `- Communities: ${competitor?.communities.length || 0}\n`;
    context += `- Floorplans: ${competitorFloorplans.length}\n`;
    context += `- Avg Price: $${Math.round(compAvgPrice).toLocaleString()}\n`;
    context += `- Avg Sq Ft: ${Math.round(compAvgSqFt).toLocaleString()}\n\n`;

    if (competitor) {
      for (const comm of competitor.communities) {
        context += `COMMUNITY: ${comm.name} (${comm.city}, ${comm.state})\n`;
        context += `  Starting Price: $${comm.startingPrice?.toLocaleString() || "Unknown"}\n`;
        context += `  Price Range: ${comm.priceRange || "Unknown"}\n`;
        context += `  Amenities: ${comm.amenities || "Unknown"}\n`;
        for (const fp of comm.floorplans) {
          context += `  Floorplan: ${fp.name}\n`;
          context += `    - ${fp.bedrooms || "?"}bd/${fp.bathrooms || "?"}ba\n`;
          context += `    - ${fp.squareFeet?.toLocaleString() || "?"} sq ft\n`;
          context += `    - $${fp.price?.toLocaleString() || "Unknown"}\n`;
          context += `    - Features: ${fp.features || "Not listed"}\n`;
        }
      }
    }

    const systemPrompt = `You are a senior competitive intelligence analyst specializing in the home building industry. 
Create a comprehensive deep-dive analysis that executives and sales teams can use for strategic planning.

IMPORTANT: Respond with valid JSON only. No markdown, no explanation, just the JSON object.`;

    const userPrompt = `Generate a comprehensive deep-dive competitive analysis.

${context}

Return a JSON object with this exact structure:
{
  "executiveSummary": "3-4 paragraph executive summary covering key findings and recommendations",
  "marketPositioning": {
    "yourPosition": "Description of your market position",
    "theirPosition": "Description of competitor's market position",
    "overlap": "Where you compete head-to-head",
    "differentiationOpportunities": ["opportunity1", "opportunity2", "opportunity3"]
  },
  "pricingAnalysis": {
    "summary": "Overall pricing comparison summary",
    "yourPriceRange": "$XXX,XXX - $XXX,XXX",
    "theirPriceRange": "$XXX,XXX - $XXX,XXX",
    "valueProposition": "Who offers better value and why",
    "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
  },
  "productComparison": {
    "summary": "Overview of product comparison",
    "yourStrengths": ["strength1", "strength2", "strength3"],
    "theirStrengths": ["strength1", "strength2", "strength3"],
    "gapAnalysis": "Areas where you have product gaps",
    "productRecommendations": ["recommendation1", "recommendation2"]
  },
  "communityAnalysis": {
    "summary": "Overview of community comparison",
    "locationComparison": "How locations compare",
    "amenitiesComparison": "How amenities compare",
    "targetDemographics": "Target buyer comparison"
  },
  "salesStrategy": {
    "keyObjections": [
      {"objection": "Common buyer objection", "response": "Recommended response"},
      {"objection": "Another objection", "response": "Another response"},
      {"objection": "Third objection", "response": "Third response"}
    ],
    "winningScenarios": ["scenario1", "scenario2"],
    "competitiveAdvantages": ["advantage1", "advantage2", "advantage3"],
    "warningSignals": ["signal1", "signal2"]
  },
  "marketingRecommendations": {
    "messagingGuidelines": ["guideline1", "guideline2", "guideline3"],
    "contentIdeas": ["content idea 1", "content idea 2", "content idea 3"],
    "differentiatorHighlights": ["differentiator1", "differentiator2"]
  },
  "actionItems": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["action1", "action2"],
    "longTerm": ["action1", "action2"]
  }
}

Be specific, actionable, and based on the actual data provided. Focus on practical insights sales teams can use immediately.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    let deepDiveContent;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      deepDiveContent = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      deepDiveContent = generateFallbackDeepDive(report.organization.name, competitor?.name || "Unknown");
    }

    await prisma.competitiveReport.update({
      where: { id: report.id },
      data: {
        content: JSON.stringify({
          ...existingContent,
          deepDive: deepDiveContent,
        }),
      },
    });

    return NextResponse.json({
      id: report.id,
      generatedAt: report.generatedAt.toISOString(),
      yourCompany: report.organization.name,
      competitorName: competitor?.name || "Unknown",
      ...deepDiveContent,
    });
  } catch (error) {
    console.error("Deep dive error:", error);
    return NextResponse.json(
      { error: "Failed to generate deep dive analysis" },
      { status: 500 }
    );
  }
}

function generateFallbackDeepDive(yourCompany: string, competitorName: string) {
  return {
    executiveSummary: `This analysis compares ${yourCompany} against ${competitorName} in the local home building market. Based on available data, both builders serve overlapping markets with different value propositions. Key recommendations focus on emphasizing your unique differentiators and addressing common buyer objections.`,
    marketPositioning: {
      yourPosition: "Local builder with established reputation",
      theirPosition: "Competitor in the same market segment",
      overlap: "Both compete for similar buyer demographics in overlapping geographic areas",
      differentiationOpportunities: [
        "Emphasize unique design features",
        "Highlight customer service excellence",
        "Focus on build quality and warranty"
      ]
    },
    pricingAnalysis: {
      summary: "Pricing comparison based on available data",
      yourPriceRange: "Contact for current pricing",
      theirPriceRange: "Contact for current pricing",
      valueProposition: "Focus on overall value including quality, service, and warranty",
      recommendations: [
        "Conduct regular price monitoring",
        "Develop value comparison materials",
        "Train sales team on price objection handling"
      ]
    },
    productComparison: {
      summary: "Product comparison requires more data for detailed analysis",
      yourStrengths: ["Quality construction", "Customer service", "Local expertise"],
      theirStrengths: ["Market presence", "Brand recognition", "Multiple locations"],
      gapAnalysis: "Additional data needed for comprehensive gap analysis",
      productRecommendations: ["Gather more competitor product data", "Create comparison sheets"]
    },
    communityAnalysis: {
      summary: "Community analysis based on available information",
      locationComparison: "Both builders serve similar geographic areas",
      amenitiesComparison: "Amenity comparison requires additional research",
      targetDemographics: "Similar buyer demographics with some variation"
    },
    salesStrategy: {
      keyObjections: [
        { objection: "Their homes are cheaper", response: "Focus on total value including quality, warranty, and service" },
        { objection: "They have more communities", response: "Highlight the benefits of our focused, quality-driven approach" },
        { objection: "I've never heard of you", response: "Share customer testimonials and local reputation" }
      ],
      winningScenarios: ["Buyers prioritizing quality", "Service-oriented customers"],
      competitiveAdvantages: ["Local expertise", "Personalized service", "Quality focus"],
      warningSignals: ["Heavy price shopping", "Competitor preference mentioned early"]
    },
    marketingRecommendations: {
      messagingGuidelines: ["Lead with quality", "Emphasize local roots", "Highlight customer satisfaction"],
      contentIdeas: ["Customer testimonial videos", "Quality comparison content", "Community spotlights"],
      differentiatorHighlights: ["Build quality", "Customer service", "Local expertise"]
    },
    actionItems: {
      immediate: ["Update sales training materials", "Gather more competitor data"],
      shortTerm: ["Create comparison sheets", "Develop objection handling guide"],
      longTerm: ["Establish competitive monitoring process", "Quarterly competitor reviews"]
    }
  };
}
