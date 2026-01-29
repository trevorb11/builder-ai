import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Get monitor details with reports
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

    const monitor = await prisma.competitorMonitor.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        competitor: {
          select: { id: true, name: true, website: true },
        },
        reports: {
          orderBy: { checkedAt: "desc" },
          take: 20,
        },
      },
    });

    if (!monitor) {
      return NextResponse.json(
        { error: "Monitor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(monitor);
  } catch (error) {
    console.error("Error fetching monitor:", error);
    return NextResponse.json(
      { error: "Failed to fetch monitor" },
      { status: 500 }
    );
  }
}

// Update monitor (toggle active, change interval)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updates = await req.json();

    // Verify monitor belongs to this organization
    const existing = await prisma.competitorMonitor.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Monitor not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (typeof updates.isActive === "boolean") {
      updateData.isActive = updates.isActive;
    }
    if (typeof updates.intervalHours === "number") {
      updateData.intervalHours = updates.intervalHours;
      updateData.nextCheckAt = new Date(
        Date.now() + updates.intervalHours * 60 * 60 * 1000
      );
    }

    const monitor = await prisma.competitorMonitor.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(monitor);
  } catch (error) {
    console.error("Error updating monitor:", error);
    return NextResponse.json(
      { error: "Failed to update monitor" },
      { status: 500 }
    );
  }
}

// Delete monitor
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.competitorMonitor.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Monitor not found" },
        { status: 404 }
      );
    }

    await prisma.competitorMonitor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting monitor:", error);
    return NextResponse.json(
      { error: "Failed to delete monitor" },
      { status: 500 }
    );
  }
}
