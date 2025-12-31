import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const salesConfigSchema = z.object({
  teamSize: z.number().optional(),
  salesAgents: z.array(z.object({
    name: z.string(),
    email: z.string().optional(),
    role: z.string().optional(),
  })).optional(),
  commonObjections: z.array(z.string()).optional(),
  competitorObjections: z.array(z.object({
    competitor: z.string(),
    objection: z.string(),
    response: z.string().optional(),
  })).optional(),
  uniqueSellingPoints: z.array(z.string()).optional(),
  pricingStrategy: z.string().optional(),
  negotiationBoundaries: z.string().optional(),
  closingTechniques: z.array(z.string()).optional(),
  existingMaterials: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
  buyerPersonas: z.array(z.object({
    name: z.string(),
    description: z.string(),
    demographics: z.string().optional(),
    motivations: z.array(z.string()).optional(),
    objections: z.array(z.string()).optional(),
  })).optional(),
  salesProcess: z.string().optional(),
  averageSalesCycle: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = salesConfigSchema.parse(body);

    // Ensure onboarding record exists
    let onboarding = await prisma.builderOnboarding.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    if (!onboarding) {
      onboarding = await prisma.builderOnboarding.create({
        data: {
          organizationId: session.user.organizationId,
          currentStep: 1,
          totalSteps: 10,
          completedSteps: JSON.stringify([]),
        },
      });
    }

    const configData = {
      teamSize: data.teamSize,
      salesAgents: data.salesAgents ? JSON.stringify(data.salesAgents) : undefined,
      commonObjections: data.commonObjections ? JSON.stringify(data.commonObjections) : undefined,
      competitorObjections: data.competitorObjections ? JSON.stringify(data.competitorObjections) : undefined,
      uniqueSellingPoints: data.uniqueSellingPoints ? JSON.stringify(data.uniqueSellingPoints) : undefined,
      pricingStrategy: data.pricingStrategy,
      negotiationBoundaries: data.negotiationBoundaries,
      closingTechniques: data.closingTechniques ? JSON.stringify(data.closingTechniques) : undefined,
      existingMaterials: data.existingMaterials,
      focusAreas: data.focusAreas ? JSON.stringify(data.focusAreas) : undefined,
      buyerPersonas: data.buyerPersonas ? JSON.stringify(data.buyerPersonas) : undefined,
      salesProcess: data.salesProcess,
      averageSalesCycle: data.averageSalesCycle,
    };

    const cleanConfigData = Object.fromEntries(
      Object.entries(configData).filter(([, v]) => v !== undefined)
    );

    const salesConfig = await prisma.onboardingSalesConfig.upsert({
      where: { onboardingId: onboarding.id },
      create: {
        onboardingId: onboarding.id,
        ...cleanConfigData,
      },
      update: cleanConfigData,
    });

    // Store as knowledge entries for AI context
    await storeSalesKnowledge(session.user.organizationId, data);

    return NextResponse.json({
      success: true,
      salesConfig,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error saving sales config:", error);
    return NextResponse.json(
      { error: "Failed to save sales configuration" },
      { status: 500 }
    );
  }
}

async function storeSalesKnowledge(organizationId: string, data: z.infer<typeof salesConfigSchema>) {
  const knowledgeEntries = [
    { key: "team_size", value: data.teamSize?.toString(), category: "sales" },
    { key: "common_objections", value: data.commonObjections?.join("; "), category: "sales" },
    { key: "unique_selling_points", value: data.uniqueSellingPoints?.join("; "), category: "sales" },
    { key: "pricing_strategy", value: data.pricingStrategy, category: "sales" },
    { key: "negotiation_boundaries", value: data.negotiationBoundaries, category: "sales" },
    { key: "sales_process", value: data.salesProcess, category: "sales" },
    { key: "average_sales_cycle", value: data.averageSalesCycle, category: "sales" },
  ].filter(entry => entry.value);

  // Store buyer personas separately
  if (data.buyerPersonas) {
    for (const persona of data.buyerPersonas) {
      await prisma.builderKnowledge.upsert({
        where: {
          organizationId_category_key: {
            organizationId,
            category: "buyer_persona",
            key: persona.name.toLowerCase().replace(/\s+/g, "_"),
          },
        },
        create: {
          organizationId,
          category: "buyer_persona",
          key: persona.name.toLowerCase().replace(/\s+/g, "_"),
          value: persona.description,
          metadata: JSON.stringify({
            demographics: persona.demographics,
            motivations: persona.motivations,
            objections: persona.objections,
          }),
          priority: 8,
        },
        update: {
          value: persona.description,
          metadata: JSON.stringify({
            demographics: persona.demographics,
            motivations: persona.motivations,
            objections: persona.objections,
          }),
        },
      });
    }
  }

  // Store competitor objections
  if (data.competitorObjections) {
    for (const obj of data.competitorObjections) {
      await prisma.builderKnowledge.upsert({
        where: {
          organizationId_category_key: {
            organizationId,
            category: "competitor_objection",
            key: obj.competitor.toLowerCase().replace(/\s+/g, "_"),
          },
        },
        create: {
          organizationId,
          category: "competitor_objection",
          key: obj.competitor.toLowerCase().replace(/\s+/g, "_"),
          value: obj.objection,
          metadata: JSON.stringify({ response: obj.response }),
          priority: 9,
        },
        update: {
          value: obj.objection,
          metadata: JSON.stringify({ response: obj.response }),
        },
      });
    }
  }

  for (const entry of knowledgeEntries) {
    await prisma.builderKnowledge.upsert({
      where: {
        organizationId_category_key: {
          organizationId,
          category: entry.category,
          key: entry.key,
        },
      },
      create: {
        organizationId,
        category: entry.category,
        key: entry.key,
        value: entry.value!,
        priority: 7,
      },
      update: {
        value: entry.value!,
      },
    });
  }
}
