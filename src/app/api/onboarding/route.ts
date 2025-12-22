import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = await prisma.onboardingProgress.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    return NextResponse.json(progress || {});
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
