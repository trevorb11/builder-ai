import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ContentStrategyForm } from "@/components/research/content-strategy-form";
import { ContentTopicsList } from "@/components/research/content-topics-list";
import { ContentStrategyReports } from "@/components/research/content-strategy-reports";
import { Lightbulb, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getContentStrategyData(organizationId: string) {
  const [config, reports, topics, organization] = await Promise.all([
    prisma.contentStrategyConfig.findUnique({
      where: { organizationId },
    }),
    prisma.deepResearchReport.findMany({
      where: {
        organizationId,
        type: "content_strategy",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.contentTopic.findMany({
      where: { organizationId },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      take: 100,
    }),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, city: true, state: true },
    }),
  ]);

  return { config, reports, topics, organization };
}

export default async function ContentStrategyPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  let data = null;
  if (organizationId) {
    data = await getContentStrategyData(organizationId);
  }

  // Derive default markets from organization if config doesn't exist
  const defaultMarkets = data?.organization
    ? [`${data.organization.city}, ${data.organization.state}`]
    : [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/20">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Content Strategy
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2.5 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3 w-3" />
                  Deep Research
                </span>
              </div>
              <p className="mt-1 text-gray-500">
                Discover content topics tailored to your markets and audience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Research Form - Takes 1 column */}
          <div className="lg:col-span-1">
            <ContentStrategyForm
              config={data?.config}
              defaultMarkets={defaultMarkets}
            />
          </div>

          {/* Topics & Reports - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="topics" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="topics">
                  Content Topics ({data?.topics?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="reports">
                  Research Reports ({data?.reports?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="topics">
                <ContentTopicsList topics={data?.topics || []} />
              </TabsContent>

              <TabsContent value="reports">
                <ContentStrategyReports reports={data?.reports || []} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
