import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CompetitorList } from "@/components/competitive/competitor-list";
import { AddCompetitorForm } from "@/components/competitive/add-competitor-form";
import { CompetitiveReports } from "@/components/competitive/competitive-reports";
import { ComparisonTool } from "@/components/competitive/comparison-tool";
import { BattleCardContainer } from "@/components/competitive/battle-card-container";
import { CompetitorMonitoring } from "@/components/competitive/competitor-monitoring";
import {
  Target,
  Building2,
  FileBarChart,
  GitCompare,
  Plus,
  Swords,
  Radio,
} from "lucide-react";

async function getCompetitorData(organizationId: string) {
  const [competitors, reports, myFloorplans, organization, monitors] = await Promise.all([
    prisma.competitor.findMany({
      where: { organizationId },
      include: {
        communities: {
          include: {
            floorplans: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.competitiveReport.findMany({
      where: { organizationId },
      include: { competitor: { select: { name: true } } },
      orderBy: { generatedAt: "desc" },
      take: 10,
    }),
    prisma.floorplan.findMany({
      where: { organizationId, status: "active" },
      select: {
        id: true,
        name: true,
        bedrooms: true,
        bathrooms: true,
        squareFeet: true,
        basePrice: true,
      },
    }),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        name: true,
        tagline: true,
        differentiators: true,
      },
    }),
    prisma.competitorMonitor.findMany({
      where: { organizationId },
      include: {
        competitor: {
          select: { id: true, name: true, website: true },
        },
        reports: {
          orderBy: { checkedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { competitors, reports, myFloorplans, organization, monitors };
}

export default async function CompetitorsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to access Competitive Intelligence.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { competitors, reports, myFloorplans, organization, monitors } = await getCompetitorData(organizationId);

  const totalCommunities = competitors.reduce(
    (acc, c) => acc + c.communities.length,
    0
  );
  const totalFloorplans = competitors.reduce(
    (acc, c) =>
      acc + c.communities.reduce((a, cm) => a + cm.floorplans.length, 0),
    0
  );
  const activeMonitors = monitors.filter((m) => m.isActive).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-500 p-2">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Competitive Intelligence
            </h1>
            <p className="text-gray-600">
              Track competitor data and get AI-powered insights
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Competitors Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{competitors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Communities Monitored
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCommunities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Floorplans Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFloorplans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Reports Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Monitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeMonitors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="battle-cards" className="space-y-6">
        <TabsList>
          <TabsTrigger value="battle-cards" className="gap-2">
            <Swords className="h-4 w-4" />
            Battle Cards
          </TabsTrigger>
          <TabsTrigger value="competitors" className="gap-2">
            <Building2 className="h-4 w-4" />
            Competitors
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-2">
            <Radio className="h-4 w-4" />
            Monitoring
            {activeMonitors > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {activeMonitors}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Competitor
          </TabsTrigger>
          <TabsTrigger value="compare" className="gap-2">
            <GitCompare className="h-4 w-4" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileBarChart className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="battle-cards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-orange-500" />
                Battle Card Comparison
              </CardTitle>
              <CardDescription>
                Get a visual head-to-head comparison with actionable insights for your sales team.
                Click &quot;View Full Deep Dive Analysis&quot; for comprehensive research.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {competitors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No competitors tracked yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add your first competitor to generate battle cards.
                  </p>
                </div>
              ) : (
                <BattleCardContainer
                  competitors={competitors}
                  organization={organization || { name: "Your Company", tagline: null, differentiators: null }}
                  organizationId={organizationId}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors">
          <Card>
            <CardHeader>
              <CardTitle>Tracked Competitors</CardTitle>
              <CardDescription>
                View and manage your competitor data. Click &quot;Monitor&quot; to set up automated website tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompetitorList competitors={competitors} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-green-500" />
                Competitor Monitoring
              </CardTitle>
              <CardDescription>
                Automated website monitoring using AI web search. Set check frequencies per
                competitor and get reports on new updates, pricing changes, and announcements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompetitorMonitoring monitors={monitors} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add Competitor</CardTitle>
              <CardDescription>
                Add a new competitor to track their communities and floorplans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddCompetitorForm organizationId={organizationId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle>Floorplan Comparison</CardTitle>
              <CardDescription>
                Compare your floorplans against competitor offerings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComparisonTool
                myFloorplans={myFloorplans}
                competitors={competitors}
                organizationId={organizationId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Reports</CardTitle>
              <CardDescription>
                AI-generated insights and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompetitiveReports
                reports={reports}
                competitors={competitors}
                organizationId={organizationId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
