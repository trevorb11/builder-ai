import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DigitalFootprintAnalyzer } from "@/components/research/digital-footprint-analyzer";
import { DigitalFootprintReports } from "@/components/research/digital-footprint-reports";
import { Globe, Sparkles } from "lucide-react";

async function getFootprintData(organizationId: string) {
  const [config, reports, organization] = await Promise.all([
    prisma.digitalFootprintConfig.findUnique({
      where: { organizationId },
    }),
    prisma.deepResearchReport.findMany({
      where: {
        organizationId,
        type: "digital_footprint",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, website: true },
    }),
  ]);

  return { config, reports, organization };
}

export default async function DigitalFootprintPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  let data = null;
  if (organizationId) {
    data = await getFootprintData(organizationId);
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/20">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Digital Footprint Analysis
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2.5 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  Deep Research
                </span>
              </div>
              <p className="mt-1 text-gray-500">
                Analyze your website, social media presence, online reputation, and AI search visibility
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Analyzer Form - Takes 1 column */}
          <div className="lg:col-span-1">
            <DigitalFootprintAnalyzer
              config={data?.config}
              websiteUrl={data?.organization?.website || ""}
            />
          </div>

          {/* Reports - Takes 2 columns */}
          <div className="lg:col-span-2">
            <DigitalFootprintReports reports={data?.reports || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
