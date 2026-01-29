import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SYSTEM_PROMPTS, buildBuilderContext } from "@/lib/ai";
import OpenAI from "openai";

const openai = new OpenAI();

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

// Build a real-time data snapshot for the assistant
async function buildDataSnapshot(organizationId: string): Promise<string> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    leads,
    recentLeads,
    communities,
    inventoryHomes,
    floorplans,
    competitors,
    contentTopics,
    researchReports,
  ] = await Promise.all([
    // All leads with details
    prisma.lead.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        community: { select: { name: true } },
        floorplan: { select: { name: true } },
      },
    }),
    // Recent leads (last 7 days)
    prisma.lead.count({
      where: {
        organizationId,
        createdAt: { gte: sevenDaysAgo },
      },
    }),
    // Communities with counts
    prisma.community.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: {
            floorplans: true,
            leads: true,
            inventory: true,
          },
        },
      },
    }),
    // Inventory homes
    prisma.inventoryHome.findMany({
      where: { community: { organizationId } },
      include: {
        community: { select: { name: true } },
        floorplan: { select: { name: true } },
      },
    }),
    // Floorplans
    prisma.floorplan.findMany({
      where: { organizationId },
    }),
    // Competitors
    prisma.competitor.findMany({
      where: { organizationId },
      take: 10,
    }),
    // Content topics
    prisma.contentTopic.findMany({
      where: { organizationId },
      orderBy: { priority: "asc" },
      take: 10,
    }),
    // Recent research reports
    prisma.deepResearchReport.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  // Calculate lead metrics
  const leadsByStatus = {
    new: leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    touring: leads.filter((l) => l.status === "touring").length,
    contracted: leads.filter((l) => l.status === "contracted").length,
  };

  const leadsBySource = leads.reduce((acc, lead) => {
    const source = lead.source || "Unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Find hot leads (high intent score or recent activity)
  const hotLeads = leads
    .filter((l) => l.status === "new" || l.status === "contacted")
    .slice(0, 5);

  // Inventory metrics
  const availableHomes = inventoryHomes.filter((h) => h.status === "available");
  const underContract = inventoryHomes.filter((h) => h.status === "under_contract");
  const sold = inventoryHomes.filter((h) => h.status === "sold");

  let snapshot = `
=== REAL-TIME DASHBOARD DATA (as of ${now.toLocaleDateString()}) ===

📊 LEAD OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━
Total Leads: ${leads.length}
New Leads (Last 7 Days): ${recentLeads}

By Status:
• New: ${leadsByStatus.new}
• Contacted: ${leadsByStatus.contacted}
• Qualified: ${leadsByStatus.qualified}
• Touring: ${leadsByStatus.touring}
• Contracted: ${leadsByStatus.contracted}

Top Lead Sources:
${Object.entries(leadsBySource)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([source, count]) => `• ${source}: ${count} (${Math.round((count / leads.length) * 100)}%)`)
  .join("\n")}

🔥 HOT LEADS NEEDING ATTENTION:
${hotLeads.length > 0
  ? hotLeads.map((l) => `• ${l.firstName} ${l.lastName} (${l.email}) - ${l.status} - Interested in: ${l.community?.name || "Unknown"}`).join("\n")
  : "• No hot leads currently"}

🏘️ COMMUNITIES (${communities.length} total)
━━━━━━━━━━━━━━━━━━━━━━
${communities.map((c) => `• ${c.name} (${c.city}, ${c.state}) - ${c._count.leads} leads, ${c._count.inventory} inventory homes, Status: ${c.status}`).join("\n")}

🏠 INVENTORY HOMES
━━━━━━━━━━━━━━━━━━━━━━
Total: ${inventoryHomes.length}
• Available: ${availableHomes.length}
• Under Contract: ${underContract.length}
• Sold: ${sold.length}

${availableHomes.length > 0 ? `
Available Homes:
${availableHomes.slice(0, 10).map((h) => `• ${h.address || h.lot} - ${h.floorplan?.name || "Custom"} at ${h.community?.name} - $${h.price?.toLocaleString() || "TBD"} - ${h.status}`).join("\n")}
` : "No available inventory homes currently."}

📐 FLOORPLANS (${floorplans.length} total)
━━━━━━━━━━━━━━━━━━━━━━
${floorplans.slice(0, 10).map((f) => `• ${f.name} - ${f.bedrooms}bd/${f.bathrooms}ba, ${f.squareFeet.toLocaleString()} sqft - $${f.basePrice.toLocaleString()}`).join("\n")}

🎯 COMPETITORS TRACKED (${competitors.length})
━━━━━━━━━━━━━━━━━━━━━━
${competitors.length > 0
  ? competitors.map((c) => `• ${c.name}${c.website ? ` (${c.website})` : ""}`).join("\n")
  : "No competitors tracked yet."}

📝 CONTENT IDEAS TO WRITE
━━━━━━━━━━━━━━━━━━━━━━
${contentTopics.length > 0
  ? contentTopics.map((t) => `• [${t.priority?.toUpperCase() || "MEDIUM"}] ${t.title}`).join("\n")
  : "No content topics queued."}

📊 RECENT RESEARCH REPORTS
━━━━━━━━━━━━━━━━━━━━━━
${researchReports.length > 0
  ? researchReports.map((r) => `• ${r.title} (${r.status}) - ${r.createdAt.toLocaleDateString()}`).join("\n")
  : "No research reports yet."}
`;

  return snapshot;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, stream = true } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Get organization info
    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Build context and data snapshot in parallel
    const [builderContext, dataSnapshot] = await Promise.all([
      buildBuilderContext(session.user.organizationId),
      buildDataSnapshot(session.user.organizationId),
    ]);

    // Build system prompt
    const systemPrompt = SYSTEM_PROMPTS.dashboardAssistant(
      organization.name,
      builderContext,
      dataSnapshot
    );

    // Prepare messages for OpenAI
    const openaiMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    if (stream) {
      // Streaming response
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: openaiMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      });

      // Create a streaming response
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of response) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                );
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Non-streaming response
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || "";

      return NextResponse.json({ content });
    }
  } catch (error) {
    console.error("Dashboard assistant error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch quick suggestions
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get some data to generate smart suggestions
    const [recentLeads, availableHomes, pendingContent] = await Promise.all([
      prisma.lead.count({
        where: {
          organizationId: session.user.organizationId,
          status: "new",
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.inventoryHome.count({
        where: {
          community: { organizationId: session.user.organizationId },
          status: "available",
        },
      }),
      prisma.contentTopic.count({
        where: {
          organizationId: session.user.organizationId,
          status: "pending",
        },
      }),
    ]);

    // Generate contextual quick prompts
    const suggestions = [
      {
        id: "leads",
        label: "How are my leads?",
        icon: "users",
        description: `You have ${recentLeads} new leads this week`,
      },
      {
        id: "social",
        label: "Write a social post",
        icon: "share",
        description: "Generate engaging content",
      },
      {
        id: "inventory",
        label: "Show my inventory",
        icon: "home",
        description: `${availableHomes} homes available`,
      },
      {
        id: "focus",
        label: "What should I focus on?",
        icon: "target",
        description: "Get prioritized tasks",
      },
      {
        id: "email",
        label: "Draft a follow-up email",
        icon: "mail",
        description: "For hot leads",
      },
      {
        id: "competitor",
        label: "How do I compare to competitors?",
        icon: "bar-chart",
        description: "Competitive insights",
      },
    ];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
