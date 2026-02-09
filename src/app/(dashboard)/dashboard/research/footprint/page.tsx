import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DigitalFootprintAnalyzer } from "@/components/research/digital-footprint-analyzer";
import { DigitalFootprintReports } from "@/components/research/digital-footprint-reports";
import { Globe, Sparkles, Search, Star, Bot, Target, Share2 } from "lucide-react";

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
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/20">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  Digital Presence Deep Dive
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-2.5 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  Multi-Pass AI Research
                </span>
              </div>
              <p className="mt-1 text-gray-500">
                7-dimension deep analysis of your website, social media, reputation, SEO, AI visibility, and competitive positioning
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4 text-blue-500" />
              <span>Website & UX</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Share2 className="h-4 w-4 text-pink-500" />
              <span>Social Media</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="h-4 w-4 text-amber-500" />
              <span>Reputation</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Search className="h-4 w-4 text-green-500" />
              <span>SEO & Local</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bot className="h-4 w-4 text-purple-500" />
              <span>AI Visibility</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="h-4 w-4 text-teal-500" />
              <span>Competitive</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <DigitalFootprintAnalyzer
              config={data?.config}
              websiteUrl={data?.organization?.website || ""}
            />
          </div>

          <div className="lg:col-span-2">
            <DigitalFootprintReports reports={data?.reports || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
