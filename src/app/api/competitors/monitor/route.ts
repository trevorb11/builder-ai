import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Create or update a competitor monitor
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { competitorId, websiteUrl, intervalHours } = await req.json();

    if (!competitorId || !websiteUrl) {
      return NextResponse.json(
        { error: "Competitor ID and website URL are required" },
        { status: 400 }
      );
    }

    // Verify competitor belongs to this organization
    const competitor = await prisma.competitor.findFirst({
      where: {
        id: competitorId,
        organizationId: session.user.organizationId,
      },
    });

    if (!competitor) {
      return NextResponse.json(
        { error: "Competitor not found" },
        { status: 404 }
      );
    }

    const hours = intervalHours || 24;
    const nextCheckAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    // Upsert the monitor (one per competitor per org)
    const monitor = await prisma.competitorMonitor.upsert({
      where: {
        competitorId_organizationId: {
          competitorId,
          organizationId: session.user.organizationId,
        },
      },
      update: {
        websiteUrl,
        intervalHours: hours,
        isActive: true,
        nextCheckAt,
      },
      create: {
        competitorId,
        organizationId: session.user.organizationId,
        websiteUrl,
        intervalHours: hours,
        isActive: true,
        nextCheckAt,
      },
    });

    return NextResponse.json(monitor);
  } catch (error) {
    console.error("Error creating monitor:", error);
    return NextResponse.json(
      { error: "Failed to create monitor" },
      { status: 500 }
    );
  }
}

// Get all monitors for this organization
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const monitors = await prisma.competitorMonitor.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        competitor: {
          select: { id: true, name: true, website: true },
        },
        reports: {
          orderBy: { checkedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ monitors });
  } catch (error) {
    console.error("Error fetching monitors:", error);
    return NextResponse.json(
      { error: "Failed to fetch monitors" },
      { status: 500 }
    );
  }
}
