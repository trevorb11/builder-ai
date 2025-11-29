import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CompetitorList } from "@/components/competitive/competitor-list";
import { AddCompetitorForm } from "@/components/competitive/add-competitor-form";
import { CompetitiveReports } from "@/components/competitive/competitive-reports";
import { ComparisonTool } from "@/components/competitive/comparison-tool";
import {
  Target,
  Building2,
  FileBarChart,
  GitCompare,
  Plus,
} from "lucide-react";

async function getCompetitorData(organizationId: string) {
  const [competitors, reports, myFloorplans] = await Promise.all([
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
  ]);

  return { competitors, reports, myFloorplans };
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

  const { competitors, reports, myFloorplans } = await getCompetitorData(organizationId);

  const totalCommunities = competitors.reduce(
    (acc, c) => acc + c.communities.length,
    0
  );
  const totalFloorplans = competitors.reduce(
    (acc, c) =>
      acc + c.communities.reduce((a, cm) => a + cm.floorplans.length, 0),
    0
  );

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
      <div className="mb-8 grid gap-4 md:grid-cols-4">
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
      </div>

      {/* Main Content */}
      <Tabs defaultValue="competitors" className="space-y-6">
        <TabsList>
          <TabsTrigger value="competitors" className="gap-2">
            <Building2 className="h-4 w-4" />
            Competitors
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

        <TabsContent value="competitors">
          <Card>
            <CardHeader>
              <CardTitle>Tracked Competitors</CardTitle>
              <CardDescription>
                View and manage your competitor data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompetitorList competitors={competitors} />
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
