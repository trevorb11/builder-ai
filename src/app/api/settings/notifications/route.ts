import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { notificationPrefs: true },
    });

    const prefs = user?.notificationPrefs
      ? JSON.parse(user.notificationPrefs)
      : getDefaultPrefs();

    return NextResponse.json(prefs);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notificationPrefs: JSON.stringify(data),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}

function getDefaultPrefs() {
  return {
    email: {
      newLeads: true,
      leadStatusChanges: true,
      crmSyncResults: false,
      competitorUpdates: true,
      aiSearchMentions: true,
      weeklyReport: true,
      marketingContentReady: true,
    },
    inApp: {
      newLeads: true,
      leadStatusChanges: true,
      crmSyncResults: true,
      competitorUpdates: true,
      aiSearchMentions: true,
      salesTrainingReminders: true,
      marketingContentReady: true,
    },
  };
}
