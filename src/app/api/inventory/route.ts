import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const inventorySchema = z.object({
  communityId: z.string().min(1, "Community is required"),
  floorplanId: z.string().min(1, "Floorplan is required"),
  lot: z.string().optional(),
  block: z.string().optional(),
  address: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  status: z.enum(["available", "pending", "sold", "model"]).default("available"),
  moveInDate: z.string().optional(),
  completionDate: z.string().optional(),
  features: z.string().optional(),
  images: z.string().optional(),
  mlsNumber: z.string().optional(),
  virtualTourUrl: z.string().optional(),
  specialNotes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get("communityId");
    const floorplanId = searchParams.get("floorplanId");
    const status = searchParams.get("status");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Build where clause dynamically
    const where: Record<string, unknown> = {
      community: {
        organizationId: session.user.organizationId,
      },
    };

    if (communityId) {
      where.communityId = communityId;
    }
    if (floorplanId) {
      where.floorplanId = floorplanId;
    }
    if (status) {
      where.status = status;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        (where.price as Record<string, number>).gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        (where.price as Record<string, number>).lte = parseFloat(maxPrice);
      }
    }

    const inventory = await prisma.inventoryHome.findMany({
      where,
      include: {
        community: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        floorplan: {
          select: {
            id: true,
            name: true,
            bedrooms: true,
            bathrooms: true,
            squareFeet: true,
            basePrice: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = inventorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify community belongs to user's organization
    const community = await prisma.community.findFirst({
      where: {
        id: data.communityId,
        organizationId: session.user.organizationId,
      },
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found or access denied" },
        { status: 404 }
      );
    }

    // Verify floorplan exists
    const floorplan = await prisma.floorplan.findFirst({
      where: {
        id: data.floorplanId,
        organizationId: session.user.organizationId,
      },
    });

    if (!floorplan) {
      return NextResponse.json(
        { error: "Floorplan not found or access denied" },
        { status: 404 }
      );
    }

    // Convert features string to JSON array if provided
    let featuresJson: string | null = null;
    if (data.features) {
      const featuresList = data.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
      featuresJson = JSON.stringify(featuresList);
    }

    const inventoryHome = await prisma.inventoryHome.create({
      data: {
        communityId: data.communityId,
        floorplanId: data.floorplanId,
        lot: data.lot || null,
        block: data.block || null,
        address: data.address || null,
        price: data.price,
        status: data.status,
        moveInDate: data.moveInDate || null,
        completionDate: data.completionDate || null,
        features: featuresJson,
        images: data.images || null,
        mlsNumber: data.mlsNumber || null,
        virtualTourUrl: data.virtualTourUrl || null,
        specialNotes: data.specialNotes || null,
      },
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

    return NextResponse.json(inventoryHome, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory home:", error);
    return NextResponse.json(
      { error: "Failed to create inventory home" },
      { status: 500 }
    );
  }
}

// Bulk update endpoint for status changes
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, status } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No inventory IDs provided" },
        { status: 400 }
      );
    }

    if (!["available", "pending", "sold", "model"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Verify all homes belong to user's organization
    const homes = await prisma.inventoryHome.findMany({
      where: {
        id: { in: ids },
        community: {
          organizationId: session.user.organizationId,
        },
      },
      select: { id: true },
    });

    if (homes.length !== ids.length) {
      return NextResponse.json(
        { error: "Some inventory homes not found or access denied" },
        { status: 403 }
      );
    }

    // Bulk update
    const result = await prisma.inventoryHome.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
    });
  } catch (error) {
    console.error("Error bulk updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}
