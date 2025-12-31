import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createLeadSchema = z.object({
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  source: z.string().default("website_chat"),
  status: z
    .enum(["new", "contacted", "qualified", "nurturing", "closed_won", "closed_lost"])
    .default("new"),
  communityId: z.string().nullable().optional(),
  floorplanId: z.string().nullable().optional(),
  budget: z.string().nullable().optional(),
  timeline: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  score: z.number().min(0).max(100).default(50),
  organizationId: z.string().optional(),
});

// GET - List all leads for the organization
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const communityId = searchParams.get("communityId");
    const source = searchParams.get("source");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const where: Record<string, unknown> = {
      organizationId: session.user.organizationId,
    };

    if (status) {
      where.status = status;
    }

    if (communityId) {
      where.communityId = communityId;
    }

    if (source) {
      where.source = source;
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        community: {
          select: { id: true, name: true },
        },
        floorplan: {
          select: { id: true, name: true },
        },
        conversations: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            messages: {
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : 100,
      skip: offset ? parseInt(offset) : 0,
    });

    // Get total count for pagination
    const total = await prisma.lead.count({ where });

    return NextResponse.json({
      leads,
      total,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

// POST - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const organizationId = session?.user?.organizationId;

    // For chatbot-created leads, we may not have a session
    const body = await request.json();
    const parsed = createLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Use organization ID from session or from request body
    const finalOrgId = organizationId || data.organizationId;

    if (!finalOrgId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Verify community belongs to organization if provided
    if (data.communityId) {
      const community = await prisma.community.findFirst({
        where: {
          id: data.communityId,
          organizationId: finalOrgId,
        },
      });

      if (!community) {
        return NextResponse.json(
          { error: "Community not found" },
          { status: 404 }
        );
      }
    }

    // Verify floorplan belongs to organization if provided
    if (data.floorplanId) {
      const floorplan = await prisma.floorplan.findFirst({
        where: {
          id: data.floorplanId,
          organizationId: finalOrgId,
        },
      });

      if (!floorplan) {
        return NextResponse.json(
          { error: "Floorplan not found" },
          { status: 404 }
        );
      }
    }

    // Check if lead with same email already exists
    if (data.email) {
      const existingLead = await prisma.lead.findFirst({
        where: {
          email: data.email,
          organizationId: finalOrgId,
        },
      });

      if (existingLead) {
        // Update existing lead instead of creating a duplicate
        const updatedLead = await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            firstName: data.firstName || existingLead.firstName,
            lastName: data.lastName || existingLead.lastName,
            phone: data.phone || existingLead.phone,
            communityId: data.communityId || existingLead.communityId,
            floorplanId: data.floorplanId || existingLead.floorplanId,
            budget: data.budget || existingLead.budget,
            timeline: data.timeline || existingLead.timeline,
            notes: data.notes
              ? `${existingLead.notes || ""}\n${data.notes}`
              : existingLead.notes,
          },
          include: {
            community: { select: { id: true, name: true } },
            floorplan: { select: { id: true, name: true } },
          },
        });

        return NextResponse.json(updatedLead, { status: 200 });
      }
    }

    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        email: data.email || null,
        phone: data.phone || null,
        source: data.source,
        status: data.status,
        communityId: data.communityId || null,
        floorplanId: data.floorplanId || null,
        budget: data.budget || null,
        timeline: data.timeline || null,
        notes: data.notes || null,
        score: data.score,
        organizationId: finalOrgId,
      },
      include: {
        community: { select: { id: true, name: true } },
        floorplan: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
