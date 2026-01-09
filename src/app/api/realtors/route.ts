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

    if (!portal) {
      return NextResponse.json({ realtors: [] });
    }

    const realtors = await prisma.realtorAccess.findMany({
      where: { portalId: portal.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ realtors });
  } catch (error) {
    console.error("Error fetching realtors:", error);
    return NextResponse.json({ error: "Failed to fetch realtors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name, company, phone, licenseNumber } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let portal = await prisma.realtorPortalConfig.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    if (!portal) {
      portal = await prisma.realtorPortalConfig.create({
        data: {
          organizationId: session.user.organizationId,
          isActive: true,
        },
      });
    }

    const existingRealtor = await prisma.realtorAccess.findUnique({
      where: {
        portalId_email: {
          portalId: portal.id,
          email,
        },
      },
    });

    if (existingRealtor) {
      return NextResponse.json({ error: "Realtor already exists" }, { status: 400 });
    }

    const realtor = await prisma.realtorAccess.create({
      data: {
        portalId: portal.id,
        email,
        name,
        company,
        phone,
        licenseNumber,
        isActive: true,
        isVerified: false,
      },
    });

    return NextResponse.json(realtor);
  } catch (error) {
    console.error("Error creating realtor:", error);
    return NextResponse.json({ error: "Failed to create realtor" }, { status: 500 });
  }
}
