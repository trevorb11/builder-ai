import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateIncentiveSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  type: z.enum(["financing", "closing_costs", "upgrade", "price_reduction", "realtor_bonus"]).optional(),
  value: z.string().nullable().optional(),
  terms: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// GET - Get a specific incentive
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

    const incentive = await prisma.incentive.findFirst({
      where: {
        id,
        community: { organizationId: session.user.organizationId },
      },
      include: {
        community: {
          select: { id: true, name: true },
        },
      },
    });

    if (!incentive) {
      return NextResponse.json({ error: "Incentive not found" }, { status: 404 });
    }

    return NextResponse.json(incentive);
  } catch (error) {
    console.error("Error fetching incentive:", error);
    return NextResponse.json(
      { error: "Failed to fetch incentive" },
      { status: 500 }
    );
  }
}

// PATCH - Update an incentive
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
    const validatedData = updateIncentiveSchema.parse(body);

    // Verify incentive belongs to organization
    const existingIncentive = await prisma.incentive.findFirst({
      where: {
        id,
        community: { organizationId: session.user.organizationId },
      },
    });

    if (!existingIncentive) {
      return NextResponse.json({ error: "Incentive not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.type !== undefined) updateData.type = validatedData.type;
    if (validatedData.value !== undefined) updateData.value = validatedData.value;
    if (validatedData.terms !== undefined) updateData.terms = validatedData.terms;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate ? new Date(validatedData.startDate) : null;
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
    }

    const incentive = await prisma.incentive.update({
      where: { id },
      data: updateData,
      include: {
        community: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(incentive);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating incentive:", error);
    return NextResponse.json(
      { error: "Failed to update incentive" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an incentive
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

    // Verify incentive belongs to organization
    const existingIncentive = await prisma.incentive.findFirst({
      where: {
        id,
        community: { organizationId: session.user.organizationId },
      },
    });

    if (!existingIncentive) {
      return NextResponse.json({ error: "Incentive not found" }, { status: 404 });
    }

    await prisma.incentive.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting incentive:", error);
    return NextResponse.json(
      { error: "Failed to delete incentive" },
      { status: 500 }
    );
  }
}
