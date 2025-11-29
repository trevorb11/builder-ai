import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, ...configData } = body;

    if (session.user.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const config = await prisma.chatbotConfig.create({
      data: {
        organizationId,
        ...configData,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Create chatbot config error:", error);
    return NextResponse.json(
      { error: "Failed to create chatbot config" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { organizationId, ...configData } = body;

    if (session.user.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const config = await prisma.chatbotConfig.upsert({
      where: { organizationId },
      update: configData,
      create: {
        organizationId,
        ...configData,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Update chatbot config error:", error);
    return NextResponse.json(
      { error: "Failed to update chatbot config" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const config = await prisma.chatbotConfig.findUnique({
      where: { organizationId },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Get chatbot config error:", error);
    return NextResponse.json(
      { error: "Failed to get chatbot config" },
      { status: 500 }
    );
  }
}
