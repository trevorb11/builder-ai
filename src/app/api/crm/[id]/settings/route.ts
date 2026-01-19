import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { settings } = await request.json();

    const integration = await prisma.cRMIntegration.findUnique({
      where: { id },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    if (integration.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await prisma.cRMIntegration.update({
      where: { id },
      data: {
        settings: JSON.stringify(settings),
        updatedAt: new Date(),
      },
    });

    // Log the settings update
    await prisma.cRMSyncLog.create({
      data: {
        integrationId: id,
        action: "update",
        entity: "settings",
        entityId: id,
        status: "success",
        request: JSON.stringify({ settings }),
        response: JSON.stringify({ message: "Settings updated successfully" }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating CRM settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

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

    const integration = await prisma.cRMIntegration.findUnique({
      where: { id },
      select: {
        id: true,
        settings: true,
      },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const settings = integration.settings ? JSON.parse(integration.settings) : {};

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching CRM settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
