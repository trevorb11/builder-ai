import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const report = await prisma.deepResearchReport.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
        type: "competitor_research",
      },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Parse metadata to include battle card summary
    const metadata = report.metadata ? JSON.parse(report.metadata) : {};

    return NextResponse.json({
      ...report,
      battleCardSummary: metadata.battleCardSummary || null,
      fullReport: report.rawResponse || null,
      researchEngine: metadata.researchEngine || "openai",
    });
  } catch (error) {
    console.error("Error fetching report detail:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
