import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface LeadData {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  score: number | null;
  source: string | null;
  notes: string | null;
}

async function syncLeadToHubSpot(
  apiKey: string,
  lead: LeadData
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    const properties: Record<string, string> = {};
    if (lead.email) properties.email = lead.email;
    if (lead.firstName) properties.firstname = lead.firstName;
    if (lead.lastName) properties.lastname = lead.lastName;
    if (lead.phone) properties.phone = lead.phone;
    if (lead.source) properties.hs_lead_status = lead.source;
    if (lead.notes) properties.notes_last_contacted = lead.notes;
    if (lead.score !== null) properties.hubspotscore = String(lead.score);

    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
    });

    if (!response.ok) {
      // If contact already exists, try to update by email
      if (response.status === 409 && lead.email) {
        const updateResponse = await fetch(
          `https://api.hubapi.com/crm/v3/objects/contacts/${lead.email}?idProperty=email`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ properties }),
          }
        );

        if (updateResponse.ok) {
          const data = await updateResponse.json();
          return { success: true, externalId: data.id };
        }
      }

      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.message || `HubSpot API error (${response.status})` };
    }

    const data = await response.json();
    return { success: true, externalId: data.id };
  } catch (error) {
    return { success: false, error: "Failed to connect to HubSpot API" };
  }
}

async function syncLeadToSalesforce(
  apiKey: string,
  lead: LeadData,
  instanceUrl?: string | null
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    const baseUrl = instanceUrl || "https://login.salesforce.com";

    const leadPayload: Record<string, string | number> = {
      LastName: lead.lastName || lead.email || "Unknown",
    };
    if (lead.firstName) leadPayload.FirstName = lead.firstName;
    if (lead.email) leadPayload.Email = lead.email;
    if (lead.phone) leadPayload.Phone = lead.phone;
    if (lead.source) leadPayload.LeadSource = lead.source;
    if (lead.notes) leadPayload.Description = lead.notes;

    const response = await fetch(`${baseUrl}/services/data/v59.0/sobjects/Lead/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ([]));
      const errorMsg = Array.isArray(errorData) && errorData[0]?.message
        ? errorData[0].message
        : `Salesforce API error (${response.status})`;
      return { success: false, error: errorMsg };
    }

    const data = await response.json();
    return { success: true, externalId: data.id };
  } catch (error) {
    return { success: false, error: "Failed to connect to Salesforce API" };
  }
}

async function syncLeadToGoHighLevel(
  apiKey: string,
  lead: LeadData
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    const contactPayload: Record<string, string | number | null> = {};
    if (lead.email) contactPayload.email = lead.email;
    if (lead.firstName) contactPayload.firstName = lead.firstName;
    if (lead.lastName) contactPayload.lastName = lead.lastName;
    if (lead.phone) contactPayload.phone = lead.phone;
    if (lead.source) contactPayload.source = lead.source;
    if (lead.notes) contactPayload.notes = lead.notes;

    const response = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.message || `GoHighLevel API error (${response.status})` };
    }

    const data = await response.json();
    return { success: true, externalId: data.contact?.id || data.id };
  } catch (error) {
    return { success: false, error: "Failed to connect to GoHighLevel API" };
  }
}

async function syncLeadToCRM(
  provider: string,
  apiKey: string,
  lead: LeadData,
  instanceUrl?: string | null
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  switch (provider) {
    case "hubspot":
      return syncLeadToHubSpot(apiKey, lead);
    case "salesforce":
      return syncLeadToSalesforce(apiKey, lead, instanceUrl);
    case "gohighlevel":
      return syncLeadToGoHighLevel(apiKey, lead);
    default:
      return { success: false, error: `Unsupported CRM provider: ${provider}` };
  }
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
        syncResult = await syncLeadToCRM(
          integration.provider,
          integration.apiKey!,
          {
            id: lead.id,
            email: lead.email,
            phone: lead.phone,
            firstName: lead.firstName,
            lastName: lead.lastName,
            score: lead.score,
            source: lead.source,
            notes: lead.notes,
          },
          integration.instanceUrl
        );

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
