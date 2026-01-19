import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Mock CRM API validation - in production, these would call actual CRM APIs
async function testHubSpotConnection(apiKey: string): Promise<{ success: boolean; error?: string; accountName?: string }> {
  // Simulate API call - would be actual HubSpot API call
  if (!apiKey || apiKey.length < 10) {
    return { success: false, error: "Invalid API key format" };
  }
  // In production: const response = await fetch('https://api.hubapi.com/account-info/v3/details', { headers: { Authorization: `Bearer ${apiKey}` } });
  return { success: true, accountName: "HubSpot Account" };
}

async function testSalesforceConnection(apiKey: string): Promise<{ success: boolean; error?: string; accountName?: string }> {
  if (!apiKey || apiKey.length < 10) {
    return { success: false, error: "Invalid API key format" };
  }
  return { success: true, accountName: "Salesforce Org" };
}

async function testGoHighLevelConnection(apiKey: string): Promise<{ success: boolean; error?: string; accountName?: string }> {
  if (!apiKey || apiKey.length < 10) {
    return { success: false, error: "Invalid API key format" };
  }
  return { success: true, accountName: "GoHighLevel Account" };
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
