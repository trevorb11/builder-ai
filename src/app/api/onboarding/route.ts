import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Auto-detect progress from actual database state
async function detectProgress(organizationId: string) {
  // Fetch all relevant data in parallel
  const [
    organization,
    communities,
    floorplans,
    inventory,
    incentives,
    competitors,
    crmIntegrations,
    chatbotConfig,
    realtorPortal,
    realtors,
    digitalFootprint,
  ] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
    }),
    prisma.community.count({ where: { organizationId } }),
    prisma.floorplan.count({ where: { organizationId } }),
    prisma.inventoryHome.count({
      where: { community: { organizationId } },
    }),
    prisma.incentive.count({
      where: { community: { organizationId }, isActive: true },
    }),
    prisma.competitor.count({ where: { organizationId } }),
    prisma.cRMIntegration.count({
      where: { organizationId, isActive: true },
    }),
    prisma.chatbotConfig.findUnique({
      where: { organizationId },
    }),
    prisma.realtorPortalConfig.findUnique({
      where: { organizationId },
    }),
    prisma.realtorAccess.count({
      where: { portal: { organizationId } },
    }),
    prisma.digitalFootprintConfig.findUnique({
      where: { organizationId },
    }),
  ]);

  // Calculate auto-detected progress
  const org = organization as {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    city?: string;
    state?: string;
    logo?: string;
    brandVoice?: string;
    tagline?: string;
    buyerPersonas?: string;
    differentiators?: string;
    marketsServed?: string;
    preferredLender?: string;
    pricingContacts?: string;
  } | null;

  const autoDetected = {
    // Company & Brand Basics
    companyName: !!(org?.name && org.name.trim() !== ""),
    contacts: !!(org?.email || org?.phone),
    websiteUrl: !!(org?.website && org.website.trim() !== ""),
    tagline: !!(org?.tagline && org.tagline.trim() !== ""),
    buyerPersonas: !!(org?.buyerPersonas && org.buyerPersonas.trim() !== ""),
    differentiators: !!(org?.differentiators && org.differentiators.trim() !== ""),
    marketsServed: !!(org?.marketsServed && org.marketsServed.trim() !== "") || !!(org?.city || org?.state),
    preferredLender: !!(org?.preferredLender && org.preferredLender.trim() !== ""),
    pricingContacts: !!(org?.pricingContacts && org.pricingContacts.trim() !== ""),
    brandAssets: !!(org?.logo || org?.brandVoice),

    // Communities
    communitiesAdded: communities > 0,

    // Floorplans
    floorplansAdded: floorplans > 0,

    // Pricing & Incentives
    incentivesAdded: incentives > 0,
    inventoryAdded: inventory > 0,

    // CRM
    crmConnected: crmIntegrations > 0,

    // Website & Chatbot
    chatbotPlacement: !!(chatbotConfig?.isActive),

    // Competitive Intelligence
    competitorsAdded: competitors > 0,

    // Realtor Portal
    realtorDatabase: realtors > 0,

    // Marketing - Social handles from digital footprint
    socialHandles: !!(
      digitalFootprint?.facebookUrl ||
      digitalFootprint?.instagramUrl ||
      digitalFootprint?.linkedinUrl
    ),
  };

  return autoDetected;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = session.user.organizationId;

    // Get stored manual progress
    const storedProgress = await prisma.onboardingProgress.findUnique({
      where: { organizationId },
    });

    // Get auto-detected progress
    const autoDetected = await detectProgress(organizationId);

    // Merge: auto-detected overrides stored for certain fields
    // Manual overrides remain for fields that can't be auto-detected
    const mergedProgress = {
      // Auto-detected fields (these update automatically based on data)
      companyName: autoDetected.companyName,
      contacts: autoDetected.contacts,
      websiteUrl: autoDetected.websiteUrl,
      tagline: autoDetected.tagline || storedProgress?.tagline || false,
      buyerPersonas: autoDetected.buyerPersonas || storedProgress?.buyerPersonas || false,
      differentiators: autoDetected.differentiators || storedProgress?.differentiators || false,
      marketsServed: autoDetected.marketsServed,
      preferredLender: autoDetected.preferredLender || storedProgress?.preferredLender || false,
      pricingContacts: autoDetected.pricingContacts || storedProgress?.pricingContacts || false,
      brandAssets: autoDetected.brandAssets || storedProgress?.brandAssets || false,
      communitiesAdded: autoDetected.communitiesAdded,
      floorplansAdded: autoDetected.floorplansAdded,
      incentivesAdded: autoDetected.incentivesAdded,
      inventoryAdded: autoDetected.inventoryAdded,
      crmConnected: autoDetected.crmConnected,
      chatbotPlacement: autoDetected.chatbotPlacement,
      competitorsAdded: autoDetected.competitorsAdded,
      realtorDatabase: autoDetected.realtorDatabase,
      socialHandles: autoDetected.socialHandles,

      // Manual-only fields (no auto-detection available)
      coopCommission: storedProgress?.coopCommission || false,
      leadFlowSetup: storedProgress?.leadFlowSetup || false,
      salesTeamAdded: storedProgress?.salesTeamAdded || false,
      websiteAccess: storedProgress?.websiteAccess || false,
      analyticsAccess: storedProgress?.analyticsAccess || false,
      salesAgentsAdded: storedProgress?.salesAgentsAdded || false,
      trainingAssets: storedProgress?.trainingAssets || false,
      realtorAssets: storedProgress?.realtorAssets || false,
      emailPlatform: storedProgress?.emailPlatform || false,
      contentPrefs: storedProgress?.contentPrefs || false,
      approvalContacts: storedProgress?.approvalContacts || false,
      launchDate: storedProgress?.launchDate || false,
    };

    // Calculate overall progress
    const completedCount = Object.values(mergedProgress).filter(Boolean).length;
    const totalItems = Object.keys(mergedProgress).length;
    const overallProgress = Math.round((completedCount / totalItems) * 100);

    return NextResponse.json({
      ...mergedProgress,
      overallProgress,
      // Include metadata about auto-detection
      _autoDetected: Object.keys(autoDetected),
    });
  } catch (error) {
    console.error("Error fetching onboarding progress:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, ...progressData } = body;

    if (organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const completedCount = Object.entries(progressData).filter(
      ([key, value]) => key !== "overallProgress" && value === true
    ).length;
    const totalItems = Object.keys(progressData).filter(k => k !== "overallProgress").length;
    const overallProgress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    const progress = await prisma.onboardingProgress.upsert({
      where: { organizationId: session.user.organizationId },
      create: {
        organizationId: session.user.organizationId,
        ...progressData,
        overallProgress,
        completedAt: overallProgress === 100 ? new Date() : null,
      },
      update: {
        ...progressData,
        overallProgress,
        completedAt: overallProgress === 100 ? new Date() : null,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error saving onboarding progress:", error);
    return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
  }
}
