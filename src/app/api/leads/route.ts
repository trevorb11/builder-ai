import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {
      organizationId: session.user.organizationId,
    };

    if (status) {
      where.status = status;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        community: { select: { name: true } },
        floorplan: { select: { name: true } },
        conversations: {
          select: { id: true },
          take: 1,
        },
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    let communityId = null;
    let floorplanId = null;

    if (data.communityId) {
      const community = await prisma.community.findFirst({
        where: { id: data.communityId, organizationId: session.user.organizationId },
      });
      if (community) {
        communityId = community.id;
      }
    }

    if (data.floorplanId) {
      const floorplan = await prisma.floorplan.findFirst({
        where: { id: data.floorplanId, organizationId: session.user.organizationId },
      });
      if (floorplan) {
        floorplanId = floorplan.id;
      }
    }

    const lead = await prisma.lead.create({
      data: {
        organizationId: session.user.organizationId,
        email: data.email,
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        source: data.source || "manual",
        status: data.status || "new",
        budget: data.budget,
        timeline: data.timeline,
        notes: data.notes,
        interestedIn: data.interestedIn,
        communityId,
        floorplanId,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
