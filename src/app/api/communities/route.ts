import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const communitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  status: z.enum(["active", "coming_soon", "sold_out"]).default("active"),
  startingPrice: z.number().nullable().optional(),
  priceRange: z.string().optional(),
  hoaFee: z.number().nullable().optional(),
  amenities: z.string().optional(),
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

    const communities = await prisma.community.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
        floorplans: true,
        inventory: true,
        incentives: { where: { isActive: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(communities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { error: "Failed to fetch communities" },
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
    const parsed = communitySchema.safeParse(body);

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

    // Generate unique slug
    let slug = generateSlug(data.name);
    let counter = 1;
    while (
      await prisma.community.findFirst({
        where: { organizationId: data.organizationId, slug },
      })
    ) {
      slug = `${generateSlug(data.name)}-${counter}`;
      counter++;
    }

    // Convert amenities string to JSON array if provided
    let amenitiesJson: string | null = null;
    if (data.amenities) {
      const amenitiesList = data.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      amenitiesJson = JSON.stringify(amenitiesList);
    }

    const community = await prisma.community.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        status: data.status,
        startingPrice: data.startingPrice ?? null,
        priceRange: data.priceRange || null,
        hoaFee: data.hoaFee ?? null,
        amenities: amenitiesJson,
        organizationId: data.organizationId,
      },
    });

    return NextResponse.json(community, { status: 201 });
  } catch (error) {
    console.error("Error creating community:", error);
    return NextResponse.json(
      { error: "Failed to create community" },
      { status: 500 }
    );
  }
}
