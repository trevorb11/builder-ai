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
    const data = await request.json();

    const realtor = await prisma.realtorAccess.findUnique({
      where: { id },
      include: { portal: true },
    });

    if (!realtor || realtor.portal.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Realtor not found" }, { status: 404 });
    }

    const updated = await prisma.realtorAccess.update({
      where: { id },
      data: {
        name: data.name,
        company: data.company,
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        isActive: data.isActive,
        isVerified: data.isVerified,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating realtor:", error);
    return NextResponse.json({ error: "Failed to update realtor" }, { status: 500 });
  }
}

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

    const realtor = await prisma.realtorAccess.findUnique({
      where: { id },
      include: { portal: true },
    });

    if (!realtor || realtor.portal.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Realtor not found" }, { status: 404 });
    }

    await prisma.realtorAccess.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting realtor:", error);
    return NextResponse.json({ error: "Failed to delete realtor" }, { status: 500 });
  }
}
