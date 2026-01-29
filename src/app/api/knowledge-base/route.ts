import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await prisma.knowledgeBaseEntry.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Knowledge base GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge base entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, content, sourceUrl, fileName, fileType, fileSize, category } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    const entry = await prisma.knowledgeBaseEntry.create({
      data: {
        organizationId: session.user.organizationId,
        title,
        type,
        content,
        sourceUrl,
        fileName,
        fileType,
        fileSize,
        category,
        isProcessed: type === "text" || type === "file",
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error("Knowledge base POST error:", error);
    return NextResponse.json(
      { error: "Failed to create knowledge base entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
    }

    const entry = await prisma.knowledgeBaseEntry.findUnique({
      where: { id },
    });

    if (!entry || entry.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await prisma.knowledgeBaseEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Knowledge base DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete knowledge base entry" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, content, category, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
    }

    const entry = await prisma.knowledgeBaseEntry.findUnique({
      where: { id },
    });

    if (!entry || entry.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const updatedEntry = await prisma.knowledgeBaseEntry.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ entry: updatedEntry });
  } catch (error) {
    console.error("Knowledge base PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update knowledge base entry" },
      { status: 500 }
    );
  }
}
