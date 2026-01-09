import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
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

    await prisma.cRMIntegration.update({
      where: { id },
      data: {
        isActive: false,
        apiKey: null,
        accessToken: null,
        refreshToken: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting CRM:", error);
    return NextResponse.json({ error: "Failed to disconnect CRM" }, { status: 500 });
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
      include: {
        syncLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!integration || integration.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    return NextResponse.json(integration);
  } catch (error) {
    console.error("Error fetching CRM:", error);
    return NextResponse.json({ error: "Failed to fetch CRM" }, { status: 500 });
  }
}
