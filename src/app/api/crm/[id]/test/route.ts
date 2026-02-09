import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function testHubSpotConnection(apiKey: string): Promise<{ success: boolean; error?: string; accountName?: string }> {
  try {
    const response = await fetch("https://api.hubapi.com/account-info/v3/details", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        return { success: false, error: "Invalid API key. Please check your HubSpot private app token." };
      }
      return { success: false, error: errorData.message || `HubSpot API returned status ${response.status}` };
    }

    const data = await response.json();
    return { success: true, accountName: data.portalId ? `HubSpot (Portal ${data.portalId})` : "HubSpot Account" };
  } catch (error) {
    return { success: false, error: "Unable to reach HubSpot API. Please check your network connection." };
  }
}

async function testSalesforceConnection(apiKey: string): Promise<{ success: boolean; error?: string; accountName?: string }> {
  try {
    // Salesforce API keys typically come with an instance URL; for API key auth,
    // we test using the identity endpoint with the access token
    const response = await fetch("https://login.salesforce.com/services/oauth2/userinfo", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { success: false, error: "Invalid access token. Please check your Salesforce credentials." };
      }
      return { success: false, error: `Salesforce API returned status ${response.status}` };
    }

    const data = await response.json();
    return { success: true, accountName: data.organization_id ? `Salesforce (${data.name || "Connected"})` : "Salesforce Org" };
  } catch (error) {
    return { success: false, error: "Unable to reach Salesforce API. Please check your network connection." };
  }
}

async function testGoHighLevelConnection(apiKey: string): Promise<{ success: boolean; error?: string; accountName?: string }> {
  try {
    const response = await fetch("https://rest.gohighlevel.com/v1/custom-values/", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, error: "Invalid API key. Please check your GoHighLevel API key." };
      }
      return { success: false, error: `GoHighLevel API returned status ${response.status}` };
    }

    return { success: true, accountName: "GoHighLevel Account" };
  } catch (error) {
    return { success: false, error: "Unable to reach GoHighLevel API. Please check your network connection." };
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

    const integration = await prisma.cRMIntegration.findUnique({
      where: { id },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    if (integration.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!integration.apiKey) {
      return NextResponse.json({
        success: false,
        error: "No API key configured"
      }, { status: 400 });
    }

    let result: { success: boolean; error?: string; accountName?: string };

    switch (integration.provider) {
      case "hubspot":
        result = await testHubSpotConnection(integration.apiKey);
        break;
      case "salesforce":
        result = await testSalesforceConnection(integration.apiKey);
        break;
      case "gohighlevel":
        result = await testGoHighLevelConnection(integration.apiKey);
        break;
      default:
        result = { success: false, error: "Unknown provider" };
    }

    // Log the test result
    await prisma.cRMSyncLog.create({
      data: {
        integrationId: id,
        action: "test",
        entity: "connection",
        entityId: id,
        status: result.success ? "success" : "error",
        request: JSON.stringify({ provider: integration.provider }),
        response: JSON.stringify(result),
      },
    });

    // Update integration status if test succeeds
    if (result.success) {
      await prisma.cRMIntegration.update({
        where: { id },
        data: {
          syncStatus: "success",
          lastSyncAt: new Date(),
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error testing CRM connection:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to test connection"
    }, { status: 500 });
  }
}
