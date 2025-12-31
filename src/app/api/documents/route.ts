import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { z } from "zod";

const UPLOAD_DIR = "./uploads/documents";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

// GET - List documents for organization
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const targetFeature = searchParams.get("feature");

    const where: Record<string, unknown> = {
      organizationId: session.user.organizationId,
      isActive: true,
    };

    if (category) where.category = category;
    if (status) where.status = status;

    const documents = await prisma.knowledgeDocument.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        filename: true,
        fileType: true,
        fileSize: true,
        category: true,
        description: true,
        tags: true,
        targetFeatures: true,
        status: true,
        summary: true,
        priority: true,
        createdAt: true,
        processedAt: true,
        community: { select: { id: true, name: true } },
        floorplan: { select: { id: true, name: true } },
      },
    });

    // Filter by target feature if specified
    let filtered = documents;
    if (targetFeature) {
      filtered = documents.filter((doc) => {
        if (!doc.targetFeatures) return true; // "all" by default
        const features = JSON.parse(doc.targetFeatures);
        return features.includes("all") || features.includes(targetFeature);
      });
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST - Upload new document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string | null;
    const tags = formData.get("tags") as string | null;
    const targetFeatures = formData.get("targetFeatures") as string | null;
    const communityId = formData.get("communityId") as string | null;
    const floorplanId = formData.get("floorplanId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Supported: PDF, DOC, DOCX, TXT, MD" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const orgDir = path.join(UPLOAD_DIR, session.user.organizationId);
    if (!existsSync(orgDir)) {
      await mkdir(orgDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const safeFilename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(orgDir, safeFilename);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Determine file type for processing
    const fileType = ext.replace(".", "").toLowerCase() || "unknown";

    // Create document record
    const document = await prisma.knowledgeDocument.create({
      data: {
        organizationId: session.user.organizationId,
        name,
        filename: file.name,
        fileType,
        mimeType: file.type,
        fileSize: file.size,
        filePath,
        category,
        description,
        tags,
        targetFeatures: targetFeatures || JSON.stringify(["all"]),
        status: "pending",
        communityId: communityId || null,
        floorplanId: floorplanId || null,
      },
    });

    // Queue document for processing (text extraction + summarization)
    // In production, this would be handled by a background job queue
    processDocumentAsync(document.id).catch(console.error);

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        name: document.name,
        status: document.status,
      },
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

// DELETE - Remove document
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    // Verify ownership
    const document = await prisma.knowledgeDocument.findFirst({
      where: {
        id,
        organizationId: session.user.organizationId,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Soft delete (keep file for potential recovery)
    await prisma.knowledgeDocument.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

// Background processing function
async function processDocumentAsync(documentId: string) {
  try {
    // Update status to processing
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: { status: "processing" },
    });

    const document = await prisma.knowledgeDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) return;

    // Extract text based on file type
    let extractedText = "";
    try {
      extractedText = await extractTextFromFile(document.filePath, document.mimeType);
    } catch (err) {
      console.error("Text extraction failed:", err);
    }

    // Generate summary using AI (if text was extracted)
    let summary = "";
    let keyPoints: string[] = [];

    if (extractedText && extractedText.length > 100) {
      try {
        const { openai } = await import("@/lib/ai");

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a document analyzer for a home builder company. Analyze the document and provide:
1. A concise summary (2-3 sentences)
2. Key points that would be useful for sales, marketing, or customer service

Respond in JSON format: { "summary": "...", "keyPoints": ["...", "..."] }`,
            },
            {
              role: "user",
              content: `Analyze this document:\n\n${extractedText.slice(0, 8000)}`,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
        summary = parsed.summary || "";
        keyPoints = parsed.keyPoints || [];
      } catch (err) {
        console.error("AI summarization failed:", err);
      }
    }

    // Update document with extracted content
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        extractedText: extractedText || null,
        summary: summary || null,
        keyPoints: keyPoints.length > 0 ? JSON.stringify(keyPoints) : null,
        status: "ready",
        processedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Document processing error:", error);
    await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        status: "error",
        processingError: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}

// Simple text extraction (expandable with pdf-parse, mammoth, etc.)
async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  const { readFile } = await import("fs/promises");

  // For text files, read directly
  if (mimeType === "text/plain" || mimeType === "text/markdown") {
    return await readFile(filePath, "utf-8");
  }

  // For PDFs, we'd use pdf-parse library
  // For now, return placeholder - in production, add:
  // npm install pdf-parse
  if (mimeType === "application/pdf") {
    // const pdfParse = await import("pdf-parse");
    // const buffer = await readFile(filePath);
    // const data = await pdfParse(buffer);
    // return data.text;
    return "[PDF content - install pdf-parse for extraction]";
  }

  // For Word docs, we'd use mammoth
  // npm install mammoth
  if (mimeType.includes("wordprocessingml") || mimeType === "application/msword") {
    // const mammoth = await import("mammoth");
    // const result = await mammoth.extractRawText({ path: filePath });
    // return result.value;
    return "[Word document - install mammoth for extraction]";
  }

  return "";
}
