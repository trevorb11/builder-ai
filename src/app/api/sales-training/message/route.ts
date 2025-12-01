import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getChatCompletion, SYSTEM_PROMPTS, buildBuilderContext } from "@/lib/ai";
import { z } from "zod";

const messageSchema = z.object({
  sessionId: z.string(),
  message: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, message } = parsed.data;

    // Get training session with messages
    const trainingSession = await prisma.salesTrainingSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
        status: "active",
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        user: {
          select: { organizationId: true },
        },
      },
    });

    if (!trainingSession) {
      return NextResponse.json(
        { error: "Training session not found" },
        { status: 404 }
      );
    }

    // Get builder context
    const builderContext = await buildBuilderContext(trainingSession.user.organizationId!);

    // Get organization name
    const organization = await prisma.organization.findUnique({
      where: { id: trainingSession.user.organizationId! },
      select: { name: true },
    });

    // Build conversation history
    const conversationHistory = trainingSession.messages.map((msg) => ({
      role: msg.role === "agent" ? "assistant" as const : "user" as const,
      content: msg.content,
    }));

    // System prompt for buyer response
    const buyerSystemPrompt = `${SYSTEM_PROMPTS.salesTrainer(organization?.name || "Builder", builderContext)}

You are roleplaying as a homebuyer with this persona:
${trainingSession.buyerPersona}

Scenario type: ${trainingSession.scenario.replace("_", " ")}
Difficulty: ${trainingSession.difficulty}

IMPORTANT: You are playing the BUYER role. The "assistant" messages in the conversation are from you (the buyer). The "user" messages are from the sales agent.

Respond naturally as the buyer based on what the sales agent just said. Stay in character and keep responses to 2-4 sentences. If the agent is handling things well, you can become more positive. If they're struggling, maintain or increase your objections based on your difficulty level.`;

    // Get buyer response
    const buyerResponse = await getChatCompletion([
      { role: "system", content: buyerSystemPrompt },
      ...conversationHistory,
      { role: "user", content: `Sales Agent: ${message}` },
    ]);

    // Save agent message
    await prisma.salesTrainingMessage.create({
      data: {
        sessionId,
        role: "agent",
        content: message,
      },
    });

    // Save buyer response
    await prisma.salesTrainingMessage.create({
      data: {
        sessionId,
        role: "buyer",
        content: buyerResponse,
      },
    });

    // Generate coach feedback (periodic, not every message)
    let coachFeedback: string | null = null;
    const messageCount = trainingSession.messages.length + 2; // Including new messages

    // Provide feedback every 3-4 exchanges or on specific triggers
    const shouldProvideCoaching =
      messageCount % 4 === 0 ||
      message.toLowerCase().includes("i don't know") ||
      message.toLowerCase().includes("let me check") ||
      message.length < 20;

    if (shouldProvideCoaching) {
      const coachSystemPrompt = `You are an expert sales coach reviewing a roleplay conversation between a sales agent and a potential homebuyer.

Product knowledge available:
${builderContext}

Scenario: ${trainingSession.scenario.replace("_", " ")}
Difficulty: ${trainingSession.difficulty}

Review ONLY the agent's last response and provide brief, constructive coaching feedback. Focus on:
- What they did well
- One specific improvement suggestion
- A tip relevant to the scenario

Keep feedback to 2-3 sentences. Be encouraging but honest.`;

      coachFeedback = await getChatCompletion([
        { role: "system", content: coachSystemPrompt },
        { role: "user", content: `Agent's response: "${message}"\n\nBuyer's reaction: "${buyerResponse}"` },
      ]);

      // Save coach feedback
      if (coachFeedback) {
        await prisma.salesTrainingMessage.create({
          data: {
            sessionId,
            role: "coach",
            content: coachFeedback,
          },
        });
      }
    }

    return NextResponse.json({
      buyerResponse,
      coachFeedback,
    });
  } catch (error) {
    console.error("Error processing training message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
