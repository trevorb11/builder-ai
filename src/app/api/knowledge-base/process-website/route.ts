import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { entryId } = body;

    if (!entryId) {
      return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
    }

    const entry = await prisma.knowledgeBaseEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    if (entry.type !== "website" || !entry.sourceUrl) {
      return NextResponse.json({ error: "Invalid entry type" }, { status: 400 });
    }

    try {
      const response = await fetch(entry.sourceUrl, {
        headers: {
          "User-Agent": "Builder AI Knowledge Base Bot/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();

      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 50000);

      const updatedEntry = await prisma.knowledgeBaseEntry.update({
        where: { id: entryId },
        data: {
          content: textContent,
          isProcessed: true,
        },
      });

      return NextResponse.json({ 
        entry: updatedEntry,
        message: "Website content extracted successfully" 
      });
    } catch (fetchError) {
      console.error("Failed to fetch website:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch website content. Please check the URL and try again." },
        { status: 422 }
      );
    }
  } catch (error) {
    console.error("Process website error:", error);
    return NextResponse.json(
      { error: "Failed to process website" },
      { status: 500 }
    );
  }
}
