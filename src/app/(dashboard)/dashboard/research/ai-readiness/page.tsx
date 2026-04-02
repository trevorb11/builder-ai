import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AIReadinessScore } from "@/components/research/ai-readiness-score";
import { Bot, Sparkles, Brain, MessageSquare } from "lucide-react";

async function getAIReadinessData(organizationId: string) {
  const [reports, organization] = await Promise.all([
    prisma.deepResearchReport.findMany({
      where: {
        organizationId,
        type: "digital_footprint",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, website: true },
    }),
  ]);

  return { reports, organization };
}

export default async function AIReadinessPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  let data = null;
  if (organizationId) {
    data = await getAIReadinessData(organizationId);
  }

  const latestReport = data?.reports?.[0];
  let aiReadinessData = null;

  if (latestReport?.content) {
    try {
      const content = typeof latestReport.content === 'string' 
        ? JSON.parse(latestReport.content) 
        : latestReport.content;
      aiReadinessData = content.aiReadiness || content;
    } catch {
      aiReadinessData = null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/20">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Readiness
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-violet-500 px-2.5 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  Deep Research
                </span>
              </div>
              <p className="mt-1 text-gray-500">
                How well your business appears in ChatGPT, Gemini, and other AI assistants
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Brain className="h-4 w-4 text-purple-500" />
              <span>AI Search Visibility</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bot className="h-4 w-4 text-violet-500" />
              <span>ChatGPT & Gemini</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              <span>AI Assistant Responses</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {aiReadinessData ? (
          <AIReadinessScore data={aiReadinessData} />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
              <Bot className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No AI Readiness Data Yet</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Run an analysis from the Online Presence page first to see how your business appears in AI search results.
            </p>
            <a 
              href="/dashboard/research/footprint"
              className="mt-4 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              Go to Online Presence
              <span aria-hidden="true">→</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
