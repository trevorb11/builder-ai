import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const launchConfigSchema = z.object({
  // Primary contacts
  primaryContactName: z.string().optional(),
  primaryContactEmail: z.string().optional(),
  primaryContactPhone: z.string().optional(),
  primaryContactRole: z.string().optional(),
  // Approval workflow
  requiresApproval: z.boolean().optional(),
  approverName: z.string().optional(),
  approverEmail: z.string().optional(),
  approverPhone: z.string().optional(),
  approvalProcess: z.string().optional(),
  // Launch timeline
  targetLaunchDate: z.string().optional(),
  launchPriorities: z.array(z.string()).optional(),
  phasedRollout: z.boolean().optional(),
  phaseDetails: z.array(z.object({
    name: z.string(),
    features: z.array(z.string()),
    targetDate: z.string().optional(),
  })).optional(),
  // Support
  preferredMeetingTimes: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  communicationPrefs: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = launchConfigSchema.parse(body);

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
      primaryContactName: data.primaryContactName,
      primaryContactEmail: data.primaryContactEmail,
      primaryContactPhone: data.primaryContactPhone,
      primaryContactRole: data.primaryContactRole,
      requiresApproval: data.requiresApproval,
      approverName: data.approverName,
      approverEmail: data.approverEmail,
      approverPhone: data.approverPhone,
      approvalProcess: data.approvalProcess,
      targetLaunchDate: data.targetLaunchDate ? new Date(data.targetLaunchDate) : undefined,
      launchPriorities: data.launchPriorities ? JSON.stringify(data.launchPriorities) : undefined,
      phasedRollout: data.phasedRollout,
      phaseDetails: data.phaseDetails ? JSON.stringify(data.phaseDetails) : undefined,
      preferredMeetingTimes: data.preferredMeetingTimes ? JSON.stringify(data.preferredMeetingTimes) : undefined,
      timezone: data.timezone,
      communicationPrefs: data.communicationPrefs,
      additionalNotes: data.additionalNotes,
    };

    const cleanConfigData = Object.fromEntries(
      Object.entries(configData).filter(([, v]) => v !== undefined)
    );

    const launchConfig = await prisma.onboardingLaunchConfig.upsert({
      where: { onboardingId: onboarding.id },
      create: {
        onboardingId: onboarding.id,
        ...cleanConfigData,
      },
      update: cleanConfigData,
    });

    return NextResponse.json({
      success: true,
      launchConfig,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error saving launch config:", error);
    return NextResponse.json(
      { error: "Failed to save launch configuration" },
      { status: 500 }
    );
  }
}
