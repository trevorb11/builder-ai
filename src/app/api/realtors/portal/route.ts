import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portal = await prisma.realtorPortalConfig.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    return NextResponse.json(portal || null);
  } catch (error) {
    console.error("Error fetching portal config:", error);
    return NextResponse.json({ error: "Failed to fetch portal config" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const portal = await prisma.realtorPortalConfig.upsert({
      where: { organizationId: session.user.organizationId },
      create: {
        organizationId: session.user.organizationId,
        isActive: data.isActive ?? true,
        welcomeMessage: data.welcomeMessage,
        showPricing: data.showPricing ?? true,
        showIncentives: data.showIncentives ?? true,
        showInventory: data.showInventory ?? true,
        showFloorplans: data.showFloorplans ?? true,
        requireLogin: data.requireLogin ?? false,
        coopCommission: data.coopCommission,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      },
      update: {
        isActive: data.isActive,
        welcomeMessage: data.welcomeMessage,
        showPricing: data.showPricing,
        showIncentives: data.showIncentives,
        showInventory: data.showInventory,
        showFloorplans: data.showFloorplans,
        requireLogin: data.requireLogin,
        coopCommission: data.coopCommission,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
      },
    });

    return NextResponse.json(portal);
  } catch (error) {
    console.error("Error updating portal config:", error);
    return NextResponse.json({ error: "Failed to update portal config" }, { status: 500 });
  }
}
