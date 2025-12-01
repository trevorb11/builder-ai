import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const floorplanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  bedrooms: z.number().min(1),
  bathrooms: z.number().min(0.5),
  halfBaths: z.number().min(0).default(0),
  squareFeet: z.number().min(100),
  stories: z.number().min(1).default(1),
  garageSpaces: z.number().min(0).default(2),
  basePrice: z.number().min(0),
  status: z.enum(["active", "inactive", "coming_soon"]).default("active"),
  communityId: z.string().nullable().optional(),
  features: z.string().optional(),
  organizationId: z.string(),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const communityId = searchParams.get("communityId");

    const where: { organizationId: string; communityId?: string } = {
      organizationId: session.user.organizationId,
    };

    if (communityId) {
      where.communityId = communityId;
    }

    const floorplans = await prisma.floorplan.findMany({
      where,
      include: {
        community: {
          select: { id: true, name: true },
        },
        inventory: {
          select: { id: true, status: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(floorplans);
  } catch (error) {
    console.error("Error fetching floorplans:", error);
    return NextResponse.json(
      { error: "Failed to fetch floorplans" },
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
    const parsed = floorplanSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify organization access
    if (data.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify community belongs to organization if specified
    if (data.communityId) {
      const community = await prisma.community.findFirst({
        where: {
          id: data.communityId,
          organizationId: data.organizationId,
        },
      });

      if (!community) {
        return NextResponse.json(
          { error: "Community not found" },
          { status: 404 }
        );
      }
    }

    // Generate unique slug
    let slug = generateSlug(data.name);
    let counter = 1;
    while (
      await prisma.floorplan.findFirst({
        where: { organizationId: data.organizationId, slug },
      })
    ) {
      slug = `${generateSlug(data.name)}-${counter}`;
      counter++;
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

    const floorplan = await prisma.floorplan.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        halfBaths: data.halfBaths,
        squareFeet: data.squareFeet,
        stories: data.stories,
        garageSpaces: data.garageSpaces,
        basePrice: data.basePrice,
        status: data.status,
        features: featuresJson,
        organizationId: data.organizationId,
        communityId: data.communityId || null,
      },
    });

    return NextResponse.json(floorplan, { status: 201 });
  } catch (error) {
    console.error("Error creating floorplan:", error);
    return NextResponse.json(
      { error: "Failed to create floorplan" },
      { status: 500 }
    );
  }
}
