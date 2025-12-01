import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getChatCompletion, SYSTEM_PROMPTS, buildBuilderContext } from "@/lib/ai";
import { z } from "zod";

const startSchema = z.object({
  userId: z.string(),
  organizationId: z.string(),
  scenario: z.enum(["objection_handling", "product_knowledge", "closing", "discovery"]),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

const buyerPersonas = {
  easy: {
    objection_handling: "You are a friendly first-time homebuyer who has minor concerns about the price but is generally positive about the home. Ask one or two simple questions about pricing and be easily reassured.",
    product_knowledge: "You are a curious buyer who wants to know about basic features like bedrooms, bathrooms, and square footage. Be interested and engaged.",
    closing: "You are a motivated buyer who is almost ready to make a decision. You just need a little encouragement and reassurance.",
    discovery: "You are an open buyer who shares your needs freely. You're looking for a 3-bedroom home for your growing family.",
  },
  medium: {
    objection_handling: "You are a skeptical buyer comparing multiple builders. You have concerns about: 1) Price compared to competitors 2) Timeline for move-in 3) Quality of materials. Push back on the agent's first responses but be open to good arguments.",
    product_knowledge: "You are a detail-oriented buyer who asks specific questions about construction quality, energy efficiency, warranty coverage, and HOA fees. Expect thorough answers.",
    closing: "You are interested but hesitant. You like the home but keep saying you need to 'think about it' and 'talk to your spouse.' You need help overcoming your fear of commitment.",
    discovery: "You have specific needs but don't volunteer information easily. The agent needs to ask good questions to uncover that you need a home office, good schools nearby, and a quick commute to downtown.",
  },
  hard: {
    objection_handling: "You are a tough negotiator who has done extensive research. You know competitor pricing and will challenge the agent with specific data points. You believe you can get a better deal elsewhere and frequently threaten to walk away. Only be convinced by exceptional value propositions.",
    product_knowledge: "You are a demanding buyer with construction background. Ask detailed questions about foundation types, HVAC efficiency ratings, window R-values, and specific brand names for appliances. Point out if answers seem vague or generic.",
    closing: "You are a highly analytical buyer paralyzed by options. You've been looking for 8 months and always find a reason not to decide. Challenge any urgency tactics and question every incentive.",
    discovery: "You are guarded and initially dismissive. You've had bad experiences with salespeople before. The agent must build genuine rapport before you'll share your needs. Even then, your requirements are complex: multigenerational living, accessibility features, and a very specific budget range.",
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = startSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { userId, organizationId, scenario, difficulty } = parsed.data;

    // Verify user matches session
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get builder context for product knowledge
    const builderContext = await buildBuilderContext(organizationId);

    // Get organization name
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    // Create buyer persona
    const buyerPersona = buyerPersonas[difficulty][scenario];

    // Create training session
    const trainingSession = await prisma.salesTrainingSession.create({
      data: {
        userId,
        scenario,
        difficulty,
        buyerPersona,
        status: "active",
      },
    });

    // Generate initial buyer message
    const systemPrompt = `${SYSTEM_PROMPTS.salesTrainer(organization?.name || "Builder", builderContext)}

You are now roleplaying as a homebuyer with this persona:
${buyerPersona}

Scenario type: ${scenario.replace("_", " ")}
Difficulty: ${difficulty}

Start the conversation as the buyer. Introduce yourself briefly and express your interest in buying a new home, then present your initial situation or question based on the scenario. Keep your opening message to 2-3 sentences.`;

    const initialMessage = await getChatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: "Start the roleplay. Introduce yourself as the homebuyer and begin the conversation." },
    ]);

    // Save the initial buyer message
    await prisma.salesTrainingMessage.create({
      data: {
        sessionId: trainingSession.id,
        role: "buyer",
        content: initialMessage,
      },
    });

    return NextResponse.json({
      sessionId: trainingSession.id,
      initialMessage,
    });
  } catch (error) {
    console.error("Error starting training session:", error);
    return NextResponse.json(
      { error: "Failed to start training session" },
      { status: 500 }
    );
  }
}
