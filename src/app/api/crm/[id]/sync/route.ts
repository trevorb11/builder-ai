import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Sync leads to CRM - this would contain actual CRM API integrations
async function syncLeadToCRM(
  provider: string,
  apiKey: string,
  lead: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    score: number | null;
    source: string;
    notes: string | null;
  }
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  // In production, this would make actual API calls to the CRM
  // For now, simulate success with a mock external ID

  // Simulate occasional failures for testing retry logic
  if (Math.random() < 0.1) {
    return { success: false, error: "CRM API temporarily unavailable" };
  }

  const externalId = `${provider}_${Date.now()}_${lead.id.slice(0, 8)}`;
  return { success: true, externalId };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { leadIds, retryFailed } = body;

    const integration = await prisma.cRMIntegration.findUnique({
      where: { id },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    if (integration.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!integration.isActive || !integration.apiKey) {
      return NextResponse.json({
        success: false,
        error: "Integration is not active or missing API key"
      }, { status: 400 });
    }

    // Get settings
    const settings = integration.settings ? JSON.parse(integration.settings) : {};

    // Get leads to sync
    let leadsToSync;

    if (retryFailed) {
      // Get leads that failed to sync previously
      const failedLogs = await prisma.cRMSyncLog.findMany({
        where: {
          integrationId: id,
          entity: "lead",
          status: "error",
        },
        distinct: ["entityId"],
        orderBy: { createdAt: "desc" },
      });

      const failedLeadIds = failedLogs.map(log => log.entityId);

      leadsToSync = await prisma.lead.findMany({
        where: {
          id: { in: failedLeadIds },
          organizationId: session.user.organizationId,
        },
      });
    } else if (leadIds && Array.isArray(leadIds)) {
      // Sync specific leads
      leadsToSync = await prisma.lead.findMany({
        where: {
          id: { in: leadIds },
          organizationId: session.user.organizationId,
        },
      });
    } else {
      // Sync all unsynced leads (those without a sync log entry for this integration)
      const syncedLeadIds = await prisma.cRMSyncLog.findMany({
        where: {
          integrationId: id,
          entity: "lead",
          status: "success",
        },
        select: { entityId: true },
        distinct: ["entityId"],
      });

      const syncedIds = syncedLeadIds.map(log => log.entityId);

      leadsToSync = await prisma.lead.findMany({
        where: {
          organizationId: session.user.organizationId,
          id: { notIn: syncedIds },
        },
        orderBy: { createdAt: "desc" },
        take: 100, // Batch limit
      });
    }

    if (leadsToSync.length === 0) {
      return NextResponse.json({
        success: true,
        synced: 0,
        failed: 0,
        message: "No leads to sync",
      });
    }

    // Update integration status to syncing
    await prisma.cRMIntegration.update({
      where: { id },
      data: { syncStatus: "syncing" },
    });

    let syncedCount = 0;
    let failedCount = 0;
    const results: { leadId: string; success: boolean; error?: string }[] = [];

    // Sync each lead with retry logic
    for (const lead of leadsToSync) {
      let syncResult: { success: boolean; externalId?: string; error?: string } | null = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && (!syncResult || !syncResult.success)) {
        attempts++;
        syncResult = await syncLeadToCRM(integration.provider, integration.apiKey!, {
          id: lead.id,
          email: lead.email,
          phone: lead.phone,
          firstName: lead.firstName,
          lastName: lead.lastName,
          score: lead.score,
          source: lead.source,
          notes: lead.notes,
        });

        if (!syncResult.success && attempts < maxAttempts) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
        }
      }

      // Log the sync attempt
      await prisma.cRMSyncLog.create({
        data: {
          integrationId: id,
          action: "sync",
          entity: "lead",
          entityId: lead.id,
          status: syncResult?.success ? "success" : "error",
          request: JSON.stringify({
            leadId: lead.id,
            email: lead.email,
            attempts,
          }),
          response: JSON.stringify(syncResult),
        },
      });

      if (syncResult?.success) {
        syncedCount++;
      } else {
        failedCount++;
      }

      results.push({
        leadId: lead.id,
        success: syncResult?.success ?? false,
        error: syncResult?.error,
      });
    }

    // Update integration status
    await prisma.cRMIntegration.update({
      where: { id },
      data: {
        syncStatus: failedCount > 0 ? "partial" : "success",
        lastSyncAt: new Date(),
      },
    });

    return NextResponse.json({
      success: failedCount === 0,
      synced: syncedCount,
      failed: failedCount,
      total: leadsToSync.length,
      results,
    });
  } catch (error) {
    console.error("Error syncing to CRM:", error);

    // Update status to error
    const { id } = await params;
    await prisma.cRMIntegration.update({
      where: { id },
      data: { syncStatus: "error" },
    }).catch(() => {});

    return NextResponse.json({
      success: false,
      error: "Sync failed"
    }, { status: 500 });
  }
}

// GET sync history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const entity = searchParams.get("entity");
    const status = searchParams.get("status");

    const integration = await prisma.cRMIntegration.findUnique({
      where: { id },
    });

    if (!integration || integration.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const where: any = { integrationId: id };
    if (entity) where.entity = entity;
    if (status) where.status = status;

    const logs = await prisma.cRMSyncLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Get summary stats
    const stats = await prisma.cRMSyncLog.groupBy({
      by: ["status"],
      where: { integrationId: id },
      _count: true,
    });

    const summary = {
      total: stats.reduce((acc, s) => acc + s._count, 0),
      success: stats.find(s => s.status === "success")?._count || 0,
      error: stats.find(s => s.status === "error")?._count || 0,
      pending: stats.find(s => s.status === "pending")?._count || 0,
    };

    return NextResponse.json({ logs, summary });
  } catch (error) {
    console.error("Error fetching sync history:", error);
    return NextResponse.json({ error: "Failed to fetch sync history" }, { status: 500 });
  }
}
