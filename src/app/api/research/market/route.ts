import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeMarket } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { market } = await req.json();

    if (!market) {
      return NextResponse.json(
        { error: "Market location is required" },
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

    // Create a pending report
    const report = await prisma.deepResearchReport.create({
      data: {
        type: "market_analysis",
        title: `Market Analysis: ${market}`,
        status: "in_progress",
        metadata: JSON.stringify({ market }),
        startedAt: new Date(),
        organizationId: session.user.organizationId,
        createdById: session.user.id,
      },
    });

    // Perform the research
    try {
      const result = await analyzeMarket(organization.name, market);

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
    console.error("Market research error:", error);
    return NextResponse.json(
      { error: "Failed to analyze market" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.deepResearchReport.findMany({
      where: {
        organizationId: session.user.organizationId,
        type: "market_analysis",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching market reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
