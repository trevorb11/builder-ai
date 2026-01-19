import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getContentStrategy } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { markets, targetAudience } = await req.json();

    if (!markets || markets.length === 0) {
      return NextResponse.json(
        { error: "At least one market is required" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Default target audience if not provided
    const audience = targetAudience || "First-time homebuyers and families looking for new construction homes";

    // Create a pending report
    const report = await prisma.deepResearchReport.create({
      data: {
        type: "content_strategy",
        title: `Content Strategy Research - ${markets.join(", ")}`,
        status: "in_progress",
        metadata: JSON.stringify({ markets, targetAudience: audience }),
        startedAt: new Date(),
        organizationId: session.user.organizationId,
        createdById: session.user.id,
      },
    });

    // Perform the research with builder context for personalized content strategy
    try {
      const result = await getContentStrategy(
        organization.name,
        markets,
        audience,
        session.user.organizationId
      );

      // Update the report with results
      const updatedReport = await prisma.deepResearchReport.update({
        where: { id: report.id },
        data: {
          status: "completed",
          summary: result.summary,
          findings: JSON.stringify(result.findings),
          sources: JSON.stringify(result.sources),
          recommendations: JSON.stringify(result.recommendations),
          completedAt: new Date(),
        },
      });

      // Create content topics from recommendations
      if (result.findings && result.findings.length > 0) {
        const orgId = session.user.organizationId!;
        const topicData = result.findings.map((finding) => ({
          title: finding.title,
          category: mapFindingCategory(finding.category),
          description: finding.description,
          priority: finding.importance,
          organizationId: orgId,
        }));

        await prisma.contentTopic.createMany({
          data: topicData,
        });
      }

      return NextResponse.json(updatedReport);
    } catch (error) {
      await prisma.deepResearchReport.update({
        where: { id: report.id },
        data: {
          status: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  } catch (error) {
    console.error("Content strategy research error:", error);
    return NextResponse.json(
      { error: "Failed to research content strategy" },
      { status: 500 }
    );
  }
}

function mapFindingCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    "trending": "trending",
    "local": "local",
    "education": "education",
    "seo": "seo",
    "social": "social",
    "ai": "ai_search",
    "ai_search": "ai_search",
  };

  const lowerCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerCategory.includes(key)) {
      return value;
    }
  }
  return "trending";
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [reports, config, topics] = await Promise.all([
      prisma.deepResearchReport.findMany({
        where: {
          organizationId: session.user.organizationId,
          type: "content_strategy",
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.contentStrategyConfig.findUnique({
        where: { organizationId: session.user.organizationId },
      }),
      prisma.contentTopic.findMany({
        where: { organizationId: session.user.organizationId },
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        take: 50,
      }),
    ]);

    return NextResponse.json({ reports, config, topics });
  } catch (error) {
    console.error("Error fetching content strategy data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
