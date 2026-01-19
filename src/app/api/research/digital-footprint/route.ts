import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeDigitalFootprint } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { websiteUrl, socialProfiles } = await req.json();

    if (!websiteUrl) {
      return NextResponse.json(
        { error: "Website URL is required" },
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
        type: "digital_footprint",
        title: `Digital Footprint Analysis - ${new Date().toLocaleDateString()}`,
        status: "in_progress",
        metadata: JSON.stringify({ websiteUrl, socialProfiles }),
        startedAt: new Date(),
        organizationId: session.user.organizationId,
        createdById: session.user.id,
      },
    });

    // Perform the research asynchronously with builder context for personalized analysis
    try {
      const result = await analyzeDigitalFootprint(
        organization.name,
        websiteUrl,
        session.user.organizationId,
        socialProfiles
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

      return NextResponse.json(updatedReport);
    } catch (error) {
      // Update report with error
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
    console.error("Digital footprint analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze digital footprint" },
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
        type: "digital_footprint",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Also get the config
    const config = await prisma.digitalFootprintConfig.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    return NextResponse.json({ reports, config });
  } catch (error) {
    console.error("Error fetching digital footprint reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
