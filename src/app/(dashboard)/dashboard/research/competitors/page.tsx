import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CompetitorResearchForm } from "@/components/research/competitor-research-form";
import { CompetitorResearchReports } from "@/components/research/competitor-research-reports";
import { Target, Sparkles } from "lucide-react";

async function getCompetitorData(organizationId: string) {
  const [reports, competitors] = await Promise.all([
    prisma.deepResearchReport.findMany({
      where: {
        organizationId,
        type: "competitor_research",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.competitor.findMany({
      where: { organizationId },
      orderBy: { name: "asc" },
    }),
  ]);

  return { reports, competitors };
}

export default async function CompetitorResearchPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  let data = null;
  if (organizationId) {
    data = await getCompetitorData(organizationId);
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Competitor Intelligence
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2.5 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  Deep Research
                </span>
              </div>
              <p className="mt-1 text-gray-500">
                Forensic-level competitor research powered by Claude. Get battle card summaries and full competitive reports.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Research Form - Takes 1 column */}
          <div className="lg:col-span-1">
            <CompetitorResearchForm existingCompetitors={data?.competitors || []} />
          </div>

          {/* Reports - Takes 2 columns */}
          <div className="lg:col-span-2">
            <CompetitorResearchReports reports={data?.reports || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
