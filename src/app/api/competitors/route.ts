import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, name, website, description, communities } = body;

    if (session.user.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const competitor = await prisma.competitor.create({
      data: {
        organizationId,
        name,
        website,
        description,
        communities: {
          create: communities?.map(
            (c: {
              name: string;
              city: string | null;
              state: string | null;
              startingPrice: number | null;
            }) => ({
              name: c.name,
              city: c.city,
              state: c.state,
              startingPrice: c.startingPrice,
            })
          ),
        },
      },
      include: {
        communities: true,
      },
    });

    return NextResponse.json(competitor);
  } catch (error) {
    console.error("Create competitor error:", error);
    return NextResponse.json(
      { error: "Failed to create competitor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const competitors = await prisma.competitor.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
        communities: {
          include: {
            floorplans: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(competitors);
  } catch (error) {
    console.error("Get competitors error:", error);
    return NextResponse.json(
      { error: "Failed to get competitors" },
      { status: 500 }
    );
  }
}
