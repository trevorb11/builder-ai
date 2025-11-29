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
    const { organizationId, communityId, faqs } = body;

    if (session.user.organizationId !== organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create FAQs in database
    const createdFaqs = await prisma.fAQSection.createMany({
      data: faqs.map((faq: { category: string; question: string; answer: string }, index: number) => ({
        organizationId,
        communityId: communityId || null,
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        sortOrder: index,
        isActive: true,
      })),
    });

    return NextResponse.json({ count: createdFaqs.count });
  } catch (error) {
    console.error("Save FAQ error:", error);
    return NextResponse.json(
      { error: "Failed to save FAQs" },
      { status: 500 }
    );
  }
}
