import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const incentiveSchema = z.object({
  communityId: z.string().min(1, "Community is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["financing", "closing_costs", "upgrade", "price_reduction", "realtor_bonus"]),
  value: z.string().nullable().optional(),
  terms: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

// GET - List all incentives for the organization
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("active");
    const communityId = searchParams.get("communityId");
    const type = searchParams.get("type");

    const where: Record<string, unknown> = {
      community: { organizationId: session.user.organizationId },
    };

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (communityId) {
      where.communityId = communityId;
    }

    if (type) {
      where.type = type;
    }

    const incentives = await prisma.incentive.findMany({
      where,
      include: {
        community: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(incentives);
  } catch (error) {
    console.error("Error fetching incentives:", error);
    return NextResponse.json(
      { error: "Failed to fetch incentives" },
      { status: 500 }
    );
  }
}

// POST - Create a new incentive
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = incentiveSchema.parse(body);

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

    const incentive = await prisma.incentive.create({
      data: {
        communityId: validatedData.communityId,
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        value: validatedData.value || null,
        terms: validatedData.terms || null,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        isActive: validatedData.isActive,
      },
      include: {
        community: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(incentive, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating incentive:", error);
    return NextResponse.json(
      { error: "Failed to create incentive" },
      { status: 500 }
    );
  }
}
