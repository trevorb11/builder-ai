import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const techAccessSchema = z.object({
  websiteUrl: z.string().optional(),
  websitePlatform: z.string().optional(),
  hasAdminAccess: z.boolean().optional(),
  adminAccessNotes: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  gtmContainerId: z.string().optional(),
  hasDnsAccess: z.boolean().optional(),
  dnsProvider: z.string().optional(),
  hostingProvider: z.string().optional(),
  currentChatWidget: z.string().optional(),
  otherMarketingTools: z.array(z.string()).optional(),
  apiAccess: z.array(z.string()).optional(),
  sslCertificate: z.boolean().optional(),
  mobileOptimized: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = techAccessSchema.parse(body);

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
      websiteUrl: data.websiteUrl,
      websitePlatform: data.websitePlatform,
      hasAdminAccess: data.hasAdminAccess,
      adminAccessNotes: data.adminAccessNotes,
      googleAnalyticsId: data.googleAnalyticsId,
      gtmContainerId: data.gtmContainerId,
      hasDnsAccess: data.hasDnsAccess,
      dnsProvider: data.dnsProvider,
      hostingProvider: data.hostingProvider,
      currentChatWidget: data.currentChatWidget,
      otherMarketingTools: data.otherMarketingTools ? JSON.stringify(data.otherMarketingTools) : undefined,
      apiAccess: data.apiAccess ? JSON.stringify(data.apiAccess) : undefined,
      sslCertificate: data.sslCertificate,
      mobileOptimized: data.mobileOptimized,
    };

    const cleanConfigData = Object.fromEntries(
      Object.entries(configData).filter(([, v]) => v !== undefined)
    );

    const techAccess = await prisma.onboardingTechAccess.upsert({
      where: { onboardingId: onboarding.id },
      create: {
        onboardingId: onboarding.id,
        ...cleanConfigData,
      },
      update: cleanConfigData,
    });

    // Also update organization website if provided
    if (data.websiteUrl) {
      await prisma.organization.update({
        where: { id: session.user.organizationId },
        data: { website: data.websiteUrl },
      });
    }

    return NextResponse.json({
      success: true,
      techAccess,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error saving tech access:", error);
    return NextResponse.json(
      { error: "Failed to save tech access configuration" },
      { status: 500 }
    );
  }
}
