import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getChatCompletion, buildBuilderContext } from "@/lib/ai";
import { z } from "zod";

const endSchema = z.object({
  sessionId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = endSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { sessionId } = parsed.data;

    // Get training session with all messages
    const trainingSession = await prisma.salesTrainingSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id,
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

    if (trainingSession.status === "completed") {
      return NextResponse.json({
        score: trainingSession.score,
        feedback: trainingSession.feedback,
      });
    }

    // Get builder context for evaluation
    const builderContext = await buildBuilderContext(trainingSession.user.organizationId!);

    // Get organization name
    const organization = await prisma.organization.findUnique({
      where: { id: trainingSession.user.organizationId! },
      select: { name: true },
    });

    // Build conversation transcript
    const transcript = trainingSession.messages
      .filter((m) => m.role !== "coach")
      .map((m) => `${m.role === "agent" ? "Sales Agent" : "Buyer"}: ${m.content}`)
      .join("\n\n");

    // Evaluation prompt
    const evaluationPrompt = `You are an expert sales trainer evaluating a roleplay session for ${organization?.name || "a home builder"}.

SCENARIO CONTEXT:
- Scenario Type: ${trainingSession.scenario.replace("_", " ")}
- Difficulty Level: ${trainingSession.difficulty}
- Buyer Persona: ${trainingSession.buyerPersona}

PRODUCT KNOWLEDGE AVAILABLE:
${builderContext}

CONVERSATION TRANSCRIPT:
${transcript}

Evaluate the sales agent's performance and provide:

1. OVERALL SCORE (0-100): Rate the agent's performance considering the difficulty level.

2. CATEGORY SCORES (0-100 each):
   - Objection Handling: How well did they address buyer concerns?
   - Product Knowledge: Did they demonstrate accurate knowledge of the product?
   - Rapport Building: Did they connect with the buyer personally?
   - Closing Skills: Did they move the conversation toward a decision?
   - Listening Skills: Did they understand and respond to the buyer's needs?

3. DETAILED FEEDBACK: Provide 3-4 paragraphs covering:
   - Strengths: What did the agent do well?
   - Areas for Improvement: Specific things to work on
   - Key Moments: Important exchanges in the conversation
   - Recommendations: Specific tips for future interactions

Format your response as JSON:
{
  "overallScore": number,
  "objectionHandling": number,
  "productKnowledge": number,
  "rapport": number,
  "closingSkills": number,
  "listeningSkills": number,
  "feedback": "string with detailed feedback"
}`;

    const evaluationResponse = await getChatCompletion([
      { role: "system", content: "You are a sales training evaluator. Respond only with valid JSON." },
      { role: "user", content: evaluationPrompt },
    ], {
      temperature: 0.3,
    });

    // Parse evaluation
    let evaluation;
    try {
      // Try to extract JSON from the response
      const jsonMatch = evaluationResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      // Fallback if JSON parsing fails
      evaluation = {
        overallScore: 70,
        objectionHandling: 70,
        productKnowledge: 70,
        rapport: 70,
        closingSkills: 70,
        listeningSkills: 70,
        feedback: "Great effort in this training session! Continue practicing to improve your skills.",
      };
    }

    // Calculate session duration
    const startTime = trainingSession.createdAt.getTime();
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // Update session with results
    await prisma.salesTrainingSession.update({
      where: { id: sessionId },
      data: {
        status: "completed",
        score: evaluation.overallScore,
        feedback: evaluation.feedback,
        duration,
        completedAt: new Date(),
      },
    });

    // Create metrics record
    await prisma.salesTrainingMetrics.create({
      data: {
        sessionId,
        objectionHandling: evaluation.objectionHandling,
        productKnowledge: evaluation.productKnowledge,
        rapport: evaluation.rapport,
        closingSkills: evaluation.closingSkills,
        listeningSkills: evaluation.listeningSkills,
        overallScore: evaluation.overallScore,
      },
    });

    return NextResponse.json({
      score: evaluation.overallScore,
      feedback: evaluation.feedback,
      metrics: {
        objectionHandling: evaluation.objectionHandling,
        productKnowledge: evaluation.productKnowledge,
        rapport: evaluation.rapport,
        closingSkills: evaluation.closingSkills,
        listeningSkills: evaluation.listeningSkills,
      },
    });
  } catch (error) {
    console.error("Error ending training session:", error);
    return NextResponse.json(
      { error: "Failed to end training session" },
      { status: 500 }
    );
  }
}
