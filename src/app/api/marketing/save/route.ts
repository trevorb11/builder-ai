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
    const { organizationId, type, platform, content, title } = body;

    if (session.user.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const marketingContent = await prisma.marketingContent.create({
      data: {
        organizationId,
        type,
        platform,
        content,
        title,
        status: "draft",
        createdById: session.user.id,
      },
    });

    return NextResponse.json(marketingContent);
  } catch (error) {
    console.error("Save marketing content error:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
