import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkCompetitorWebsite } from "@/lib/ai";

// Run monitor checks - can be called manually or by a cron job
// POST /api/competitors/monitor/run
// Body: { monitorId?: string } - if provided, only check that monitor; otherwise check all due monitors
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { monitorId } = body;

    // Get the organization name for context
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { name: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    let monitors;
    if (monitorId) {
      // Run a specific monitor (manual check)
      const monitor = await prisma.competitorMonitor.findFirst({
        where: {
          id: monitorId,
          organizationId: session.user.organizationId,
        },
        include: {
          competitor: { select: { name: true } },
        },
      });

      if (!monitor) {
        return NextResponse.json(
          { error: "Monitor not found" },
          { status: 404 }
        );
      }
      monitors = [monitor];
    } else {
      // Find all active monitors that are due for a check
      monitors = await prisma.competitorMonitor.findMany({
        where: {
          organizationId: session.user.organizationId,
          isActive: true,
          OR: [
            { nextCheckAt: { lte: new Date() } },
            { nextCheckAt: null },
          ],
        },
        include: {
          competitor: { select: { name: true } },
        },
      });
    }

    if (monitors.length === 0) {
      return NextResponse.json({
        message: "No monitors due for checking",
        checked: 0,
      });
    }

    const results = [];

    for (const monitor of monitors) {
      try {
        // Run the web search check
        const checkResult = await checkCompetitorWebsite(
          monitor.competitor.name,
          monitor.websiteUrl,
          organization.name
        );

        // Save the report
        const report = await prisma.monitorReport.create({
          data: {
            monitorId: monitor.id,
            findings: JSON.stringify(checkResult.findings),
            summary: checkResult.summary,
            hasUpdates: checkResult.hasUpdates,
            checkedAt: checkResult.checkedAt,
          },
        });

        // Update the monitor's last check and next check times
        await prisma.competitorMonitor.update({
          where: { id: monitor.id },
          data: {
            lastCheckedAt: new Date(),
            nextCheckAt: new Date(
              Date.now() + monitor.intervalHours * 60 * 60 * 1000
            ),
          },
        });

        results.push({
          monitorId: monitor.id,
          competitorName: monitor.competitor.name,
          reportId: report.id,
          hasUpdates: checkResult.hasUpdates,
          summary: checkResult.summary,
        });
      } catch (error) {
        console.error(
          `Monitor check failed for ${monitor.competitor.name}:`,
          error
        );
        results.push({
          monitorId: monitor.id,
          competitorName: monitor.competitor.name,
          error: "Check failed",
        });
      }
    }

    return NextResponse.json({
      message: `Checked ${results.length} monitor(s)`,
      checked: results.length,
      results,
    });
  } catch (error) {
    console.error("Monitor run error:", error);
    return NextResponse.json(
      { error: "Failed to run monitor checks" },
      { status: 500 }
    );
  }
}
