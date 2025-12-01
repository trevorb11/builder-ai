import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  bedrooms: z.number().min(1).optional(),
  bathrooms: z.number().min(0.5).optional(),
  halfBaths: z.number().min(0).optional(),
  squareFeet: z.number().min(100).optional(),
  stories: z.number().min(1).optional(),
  garageSpaces: z.number().min(0).optional(),
  basePrice: z.number().min(0).optional(),
  status: z.enum(["active", "inactive", "coming_soon"]).optional(),
  communityId: z.string().nullable().optional(),
  features: z.string().nullable().optional(),
});

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

    const floorplan = await prisma.floorplan.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
      include: {
        community: true,
        inventory: true,
        leads: true,
      },
    });

    if (!floorplan) {
      return NextResponse.json(
        { error: "Floorplan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(floorplan);
  } catch (error) {
    console.error("Error fetching floorplan:", error);
    return NextResponse.json(
      { error: "Failed to fetch floorplan" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Verify floorplan belongs to user's organization
    const existing = await prisma.floorplan.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Floorplan not found" },
        { status: 404 }
      );
    }

    // Verify community if being changed
    if (parsed.data.communityId) {
      const community = await prisma.community.findFirst({
        where: {
          id: parsed.data.communityId,
          organizationId: session.user.organizationId,
        },
      });

      if (!community) {
        return NextResponse.json(
          { error: "Community not found" },
          { status: 404 }
        );
      }
    }

    const floorplan = await prisma.floorplan.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(floorplan);
  } catch (error) {
    console.error("Error updating floorplan:", error);
    return NextResponse.json(
      { error: "Failed to update floorplan" },
      { status: 500 }
    );
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

    // Verify floorplan belongs to user's organization
    const existing = await prisma.floorplan.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Floorplan not found" },
        { status: 404 }
      );
    }

    // Delete floorplan (cascades to inventory)
    await prisma.floorplan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting floorplan:", error);
    return NextResponse.json(
      { error: "Failed to delete floorplan" },
      { status: 500 }
    );
  }
}
