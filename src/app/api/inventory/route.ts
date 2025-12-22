import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const inventorySchema = z.object({
  communityId: z.string().min(1, "Community is required"),
  floorplanId: z.string().min(1, "Floorplan is required"),
  lot: z.string().nullable().optional(),
  block: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  price: z.number().positive("Price must be positive"),
  status: z.enum(["available", "pending", "sold", "model"]).default("available"),
  moveInDate: z.string().nullable().optional(),
  completionDate: z.string().nullable().optional(),
  mlsNumber: z.string().nullable().optional(),
  specialNotes: z.string().nullable().optional(),
  features: z.string().nullable().optional(),
  virtualTourUrl: z.string().nullable().optional(),
  images: z.string().nullable().optional(),
});

// GET - List all inventory homes for the organization
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const communityId = searchParams.get("communityId");

    const where: Record<string, unknown> = {
      community: { organizationId: session.user.organizationId },
    };

    if (status) {
      where.status = status;
    }

    if (communityId) {
      where.communityId = communityId;
    }

    const inventoryHomes = await prisma.inventoryHome.findMany({
      where,
      include: {
        community: {
          select: { id: true, name: true, city: true, state: true },
        },
        floorplan: {
          select: { id: true, name: true, bedrooms: true, bathrooms: true, squareFeet: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(inventoryHomes);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory homes" },
      { status: 500 }
    );
  }
}

// POST - Create a new inventory home
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = inventorySchema.parse(body);

    // Verify community belongs to organization
    const community = await prisma.community.findFirst({
      where: {
        id: validatedData.communityId,
        organizationId: session.user.organizationId,
      },
    });

    if (!community) {
      return NextResponse.json(
        { error: "Community not found or unauthorized" },
        { status: 404 }
      );
    }

    // Verify floorplan belongs to organization
    const floorplan = await prisma.floorplan.findFirst({
      where: {
        id: validatedData.floorplanId,
        organizationId: session.user.organizationId,
      },
    });

    if (!floorplan) {
      return NextResponse.json(
        { error: "Floorplan not found or unauthorized" },
        { status: 404 }
      );
    }

    const inventoryHome = await prisma.inventoryHome.create({
      data: {
        communityId: validatedData.communityId,
        floorplanId: validatedData.floorplanId,
        lot: validatedData.lot || null,
        block: validatedData.block || null,
        address: validatedData.address || null,
        price: validatedData.price,
        status: validatedData.status,
        moveInDate: validatedData.moveInDate || null,
        completionDate: validatedData.completionDate || null,
        mlsNumber: validatedData.mlsNumber || null,
        specialNotes: validatedData.specialNotes || null,
        features: validatedData.features || null,
        virtualTourUrl: validatedData.virtualTourUrl || null,
        images: validatedData.images || null,
      },
      include: {
        community: {
          select: { id: true, name: true },
        },
        floorplan: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(inventoryHome, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating inventory home:", error);
    return NextResponse.json(
      { error: "Failed to create inventory home" },
      { status: 500 }
    );
  }
}
