import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  lot: z.string().nullable().optional(),
  block: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  price: z.number().min(0).optional(),
  status: z.enum(["available", "pending", "sold", "model"]).optional(),
  moveInDate: z.string().nullable().optional(),
  completionDate: z.string().nullable().optional(),
  features: z.string().nullable().optional(),
  images: z.string().nullable().optional(),
  mlsNumber: z.string().nullable().optional(),
  virtualTourUrl: z.string().nullable().optional(),
  specialNotes: z.string().nullable().optional(),
  communityId: z.string().optional(),
  floorplanId: z.string().optional(),
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

    const inventoryHome = await prisma.inventoryHome.findFirst({
      where: {
        id,
        community: {
          organizationId: session.user.organizationId,
        },
      },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            address: true,
          },
        },
        floorplan: {
          select: {
            id: true,
            name: true,
            bedrooms: true,
            bathrooms: true,
            halfBaths: true,
            squareFeet: true,
            stories: true,
            garageSpaces: true,
            basePrice: true,
          },
        },
      },
    });

    if (!inventoryHome) {
      return NextResponse.json(
        { error: "Inventory home not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(inventoryHome);
  } catch (error) {
    console.error("Error fetching inventory home:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory home" },
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

    // Verify inventory home belongs to user's organization
    const existing = await prisma.inventoryHome.findFirst({
      where: {
        id,
        community: {
          organizationId: session.user.organizationId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Inventory home not found" },
        { status: 404 }
      );
    }

    // If changing community, verify new community belongs to org
    if (parsed.data.communityId) {
      const newCommunity = await prisma.community.findFirst({
        where: {
          id: parsed.data.communityId,
          organizationId: session.user.organizationId,
        },
      });

      if (!newCommunity) {
        return NextResponse.json(
          { error: "New community not found or access denied" },
          { status: 404 }
        );
      }
    }

    // If changing floorplan, verify new floorplan belongs to org
    if (parsed.data.floorplanId) {
      const newFloorplan = await prisma.floorplan.findFirst({
        where: {
          id: parsed.data.floorplanId,
          organizationId: session.user.organizationId,
        },
      });

      if (!newFloorplan) {
        return NextResponse.json(
          { error: "New floorplan not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Handle features conversion if provided
    let updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.features !== undefined && parsed.data.features !== null) {
      const featuresList = parsed.data.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
      updateData.features = JSON.stringify(featuresList);
    }

    const inventoryHome = await prisma.inventoryHome.update({
      where: { id },
      data: updateData,
      include: {
        community: {
          select: {
            id: true,
            name: true,
          },
        },
        floorplan: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(inventoryHome);
  } catch (error) {
    console.error("Error updating inventory home:", error);
    return NextResponse.json(
      { error: "Failed to update inventory home" },
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

    // Verify inventory home belongs to user's organization
    const existing = await prisma.inventoryHome.findFirst({
      where: {
        id,
        community: {
          organizationId: session.user.organizationId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Inventory home not found" },
        { status: 404 }
      );
    }

    await prisma.inventoryHome.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inventory home:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory home" },
      { status: 500 }
    );
  }
}
