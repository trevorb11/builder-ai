import { NextRequest, NextResponse } from "next/server";
import { openai, SYSTEM_PROMPTS, buildBuilderContext } from "@/lib/ai";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, organizationId, sessionId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, brandVoice: true },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Build context from builder data
    const context = await buildBuilderContext(organizationId);

    // Prepare messages for OpenAI
    const systemPrompt = SYSTEM_PROMPTS.websiteAssistant(
      organization.name,
      context
    );

    const openaiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Get completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0]?.message?.content || "";

    // Save conversation to database if sessionId provided
    if (sessionId) {
      let conversation = await prisma.conversation.findUnique({
        where: { sessionId },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            sessionId,
            source: "website",
            status: "active",
          },
        });
      }

      // Save messages
      const userMessage = messages[messages.length - 1];
      await prisma.message.createMany({
        data: [
          {
            conversationId: conversation.id,
            role: "user",
            content: userMessage.content,
          },
          {
            conversationId: conversation.id,
            role: "assistant",
            content: assistantMessage,
          },
        ],
      });
    }

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
