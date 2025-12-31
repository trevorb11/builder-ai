import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET - Get onboarding status and data
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let onboarding = await prisma.builderOnboarding.findUnique({
      where: { organizationId: session.user.organizationId },
      include: {
        companyProfile: true,
        salesConfig: true,
        techAccess: true,
        contentPrefs: true,
        launchConfig: true,
        organization: {
          include: {
            communities: {
              include: {
                floorplans: true,
                incentives: true,
              },
            },
            competitors: true,
            crmIntegrations: true,
            digitalFootprintConfig: true,
          },
        },
      },
    });

    // Create onboarding record if it doesn't exist
    if (!onboarding) {
      onboarding = await prisma.builderOnboarding.create({
        data: {
          organizationId: session.user.organizationId,
          currentStep: 1,
          totalSteps: 10,
          completedSteps: JSON.stringify([]),
        },
        include: {
          companyProfile: true,
          salesConfig: true,
          techAccess: true,
          contentPrefs: true,
          launchConfig: true,
          organization: {
            include: {
              communities: {
                include: {
                  floorplans: true,
                  incentives: true,
                },
              },
              competitors: true,
              crmIntegrations: true,
              digitalFootprintConfig: true,
            },
          },
        },
      });
    }

    return NextResponse.json(onboarding);
  } catch (error) {
    console.error("Error fetching onboarding:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding data" },
      { status: 500 }
    );
  }
}

// POST - Initialize or reset onboarding
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "reset") {
      // Delete existing onboarding and related data
      await prisma.builderOnboarding.deleteMany({
        where: { organizationId: session.user.organizationId },
      });
    }

    // Create fresh onboarding record
    const onboarding = await prisma.builderOnboarding.create({
      data: {
        organizationId: session.user.organizationId,
        currentStep: 1,
        totalSteps: 10,
        completedSteps: JSON.stringify([]),
      },
      include: {
        companyProfile: true,
        salesConfig: true,
        techAccess: true,
        contentPrefs: true,
        launchConfig: true,
      },
    });

    return NextResponse.json(onboarding);
  } catch (error) {
    console.error("Error initializing onboarding:", error);
    return NextResponse.json(
      { error: "Failed to initialize onboarding" },
      { status: 500 }
    );
  }
}

// PATCH - Update onboarding progress
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentStep, completedSteps, status } = body;

    const updateData: Record<string, unknown> = {};
    if (currentStep !== undefined) updateData.currentStep = currentStep;
    if (completedSteps !== undefined)
      updateData.completedSteps = JSON.stringify(completedSteps);
    if (status !== undefined) {
      updateData.status = status;
      if (status === "completed") {
        updateData.completedAt = new Date();
      }
    }

    const onboarding = await prisma.builderOnboarding.update({
      where: { organizationId: session.user.organizationId },
      data: updateData,
      include: {
        companyProfile: true,
        salesConfig: true,
        techAccess: true,
        contentPrefs: true,
        launchConfig: true,
      },
    });

    return NextResponse.json(onboarding);
  } catch (error) {
    console.error("Error updating onboarding:", error);
    return NextResponse.json(
      { error: "Failed to update onboarding" },
      { status: 500 }
    );
  }
}
