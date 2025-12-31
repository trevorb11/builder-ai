import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const knowledgeEntrySchema = z.object({
  category: z.string(),
  key: z.string(),
  value: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  priority: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET - Retrieve knowledge entries
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: Record<string, unknown> = {
      organizationId: session.user.organizationId,
    };

    if (category) {
      where.category = category;
    }

    if (!includeInactive) {
      where.isActive = true;
    }

    const knowledge = await prisma.builderKnowledge.findMany({
      where,
      orderBy: [{ priority: "desc" }, { category: "asc" }, { key: "asc" }],
    });

    // Parse metadata JSON
    const parsed = knowledge.map((k) => ({
      ...k,
      metadata: k.metadata ? JSON.parse(k.metadata) : null,
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error fetching knowledge:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge entries" },
      { status: 500 }
    );
  }
}

// POST - Create or update knowledge entry
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = knowledgeEntrySchema.parse(body);

    const knowledge = await prisma.builderKnowledge.upsert({
      where: {
        organizationId_category_key: {
          organizationId: session.user.organizationId,
          category: data.category,
          key: data.key,
        },
      },
      create: {
        organizationId: session.user.organizationId,
        category: data.category,
        key: data.key,
        value: data.value,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        priority: data.priority ?? 0,
        isActive: data.isActive ?? true,
      },
      update: {
        value: data.value,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        priority: data.priority,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(knowledge);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error saving knowledge:", error);
    return NextResponse.json(
      { error: "Failed to save knowledge entry" },
      { status: 500 }
    );
  }
}

// DELETE - Remove knowledge entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const key = searchParams.get("key");

    if (!category || !key) {
      return NextResponse.json(
        { error: "Category and key are required" },
        { status: 400 }
      );
    }

    await prisma.builderKnowledge.delete({
      where: {
        organizationId_category_key: {
          organizationId: session.user.organizationId,
          category,
          key,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting knowledge:", error);
    return NextResponse.json(
      { error: "Failed to delete knowledge entry" },
      { status: 500 }
    );
  }
}
