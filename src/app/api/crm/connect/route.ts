import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider, apiKey, organizationId } = await request.json();

    if (organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "Provider and API key are required" }, { status: 400 });
    }

    const existingIntegration = await prisma.cRMIntegration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: session.user.organizationId,
          provider,
        },
      },
    });

    if (existingIntegration) {
      const updated = await prisma.cRMIntegration.update({
        where: { id: existingIntegration.id },
        data: {
          apiKey,
          isActive: true,
          syncStatus: "pending",
          updatedAt: new Date(),
        },
      });
      return NextResponse.json(updated);
    }

    const integration = await prisma.cRMIntegration.create({
      data: {
        organizationId: session.user.organizationId,
        provider,
        name: provider.charAt(0).toUpperCase() + provider.slice(1),
        apiKey,
        isActive: true,
        syncStatus: "pending",
      },
    });

    await prisma.cRMSyncLog.create({
      data: {
        integrationId: integration.id,
        action: "create",
        entity: "integration",
        entityId: integration.id,
        status: "success",
        request: JSON.stringify({ provider }),
        response: JSON.stringify({ message: "Integration created successfully" }),
      },
    });

    return NextResponse.json(integration);
  } catch (error) {
    console.error("Error connecting CRM:", error);
    return NextResponse.json({ error: "Failed to connect CRM" }, { status: 500 });
  }
}
