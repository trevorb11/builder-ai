import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const companyProfileSchema = z.object({
  // Basic company info (also updates Organization)
  name: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  // Extended profile
  tagline: z.string().optional(),
  missionStatement: z.string().optional(),
  yearEstablished: z.number().optional(),
  employeeCount: z.string().optional(),
  homesBuiltPerYear: z.string().optional(),
  targetBuyers: z.array(z.string()).optional(),
  priceRanges: z.array(z.object({
    min: z.number(),
    max: z.number(),
    label: z.string().optional(),
  })).optional(),
  markets: z.array(z.string()).optional(),
  differentiators: z.string().optional(),
  valueProposition: z.string().optional(),
  brandVoice: z.string().optional(),
  brandPersonality: z.array(z.string()).optional(),
  competitiveAdvantages: z.array(z.string()).optional(),
  awards: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
});

// POST/PUT - Save company profile data
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = companyProfileSchema.parse(body);

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

    // Update Organization with basic info
    const orgData: Record<string, unknown> = {};
    if (data.name) orgData.name = data.name;
    if (data.description) orgData.description = data.description;
    if (data.website) orgData.website = data.website;
    if (data.phone) orgData.phone = data.phone;
    if (data.email) orgData.email = data.email;
    if (data.address) orgData.address = data.address;
    if (data.city) orgData.city = data.city;
    if (data.state) orgData.state = data.state;
    if (data.zipCode) orgData.zipCode = data.zipCode;
    if (data.brandVoice) orgData.brandVoice = data.brandVoice;

    if (Object.keys(orgData).length > 0) {
      await prisma.organization.update({
        where: { id: session.user.organizationId },
        data: orgData,
      });
    }

    // Upsert company profile
    const profileData = {
      tagline: data.tagline,
      missionStatement: data.missionStatement,
      yearEstablished: data.yearEstablished,
      employeeCount: data.employeeCount,
      homesBuiltPerYear: data.homesBuiltPerYear,
      targetBuyers: data.targetBuyers ? JSON.stringify(data.targetBuyers) : undefined,
      priceRanges: data.priceRanges ? JSON.stringify(data.priceRanges) : undefined,
      markets: data.markets ? JSON.stringify(data.markets) : undefined,
      differentiators: data.differentiators,
      valueProposition: data.valueProposition,
      brandVoice: data.brandVoice,
      brandPersonality: data.brandPersonality ? JSON.stringify(data.brandPersonality) : undefined,
      competitiveAdvantages: data.competitiveAdvantages ? JSON.stringify(data.competitiveAdvantages) : undefined,
      awards: data.awards ? JSON.stringify(data.awards) : undefined,
      certifications: data.certifications ? JSON.stringify(data.certifications) : undefined,
    };

    // Remove undefined values
    const cleanProfileData = Object.fromEntries(
      Object.entries(profileData).filter(([, v]) => v !== undefined)
    );

    const companyProfile = await prisma.onboardingCompanyProfile.upsert({
      where: { onboardingId: onboarding.id },
      create: {
        onboardingId: onboarding.id,
        ...cleanProfileData,
      },
      update: cleanProfileData,
    });

    // Store as knowledge entries for AI context
    await storeCompanyKnowledge(session.user.organizationId, data);

    return NextResponse.json({
      success: true,
      companyProfile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error saving company profile:", error);
    return NextResponse.json(
      { error: "Failed to save company profile" },
      { status: 500 }
    );
  }
}

// Helper to store company data as knowledge entries
async function storeCompanyKnowledge(organizationId: string, data: z.infer<typeof companyProfileSchema>) {
  const knowledgeEntries = [
    { key: "company_name", value: data.name, category: "company" },
    { key: "tagline", value: data.tagline, category: "company" },
    { key: "mission_statement", value: data.missionStatement, category: "company" },
    { key: "value_proposition", value: data.valueProposition, category: "company" },
    { key: "differentiators", value: data.differentiators, category: "company" },
    { key: "brand_voice", value: data.brandVoice, category: "company" },
    { key: "target_buyers", value: data.targetBuyers?.join(", "), category: "company" },
    { key: "markets", value: data.markets?.join(", "), category: "company" },
    { key: "certifications", value: data.certifications?.join(", "), category: "company" },
    { key: "awards", value: data.awards?.join(", "), category: "company" },
  ].filter(entry => entry.value);

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
        priority: 10,
      },
      update: {
        value: entry.value!,
      },
    });
  }
}
