import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadsList } from "@/components/leads/leads-list";
import { LeadStats } from "@/components/leads/lead-stats";
import { LeadFilters } from "@/components/leads/lead-filters";
import {
  Users,
  UserPlus,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
} from "lucide-react";

async function getLeadsData(organizationId: string) {
  const [leads, communities, floorplans] = await Promise.all([
    prisma.lead.findMany({
      where: { organizationId },
      include: {
        community: {
          select: { id: true, name: true },
        },
        floorplan: {
          select: { id: true, name: true },
        },
        conversations: {
          select: {
            id: true,
            status: true,
            summary: true,
            sentiment: true,
            intentScore: true,
            createdAt: true,
            messages: {
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.community.findMany({
      where: { organizationId, status: "active" },
      select: { id: true, name: true },
    }),
    prisma.floorplan.findMany({
      where: { organizationId, status: "active" },
      select: { id: true, name: true },
    }),
  ]);

  return { leads, communities, floorplans };
}

export default async function LeadsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to manage leads.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { leads, communities, floorplans } = await getLeadsData(organizationId);

  // Calculate stats
  const newLeads = leads.filter((l) => l.status === "new").length;
  const qualifiedLeads = leads.filter((l) => l.status === "qualified").length;
  const contactedLeads = leads.filter((l) => l.status === "contacted").length;
  const closedWon = leads.filter((l) => l.status === "closed_won").length;

  // Calculate conversation metrics
  const totalConversations = leads.reduce(
    (acc, l) => acc + l.conversations.length,
    0
  );

  const avgScore =
    leads.length > 0
      ? Math.round(
          leads.reduce((acc, l) => acc + (l.score || 0), 0) / leads.length
        )
      : 0;

  // Recent leads (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentLeads = leads.filter(
    (l) => new Date(l.createdAt) > weekAgo
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start sm:items-center gap-3">
          <div className="rounded-lg bg-cyan-500 p-2 flex-shrink-0">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Lead Management</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track and manage leads from your AI chatbot and realtor portal
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-gray-500">+{recentLeads} this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{newLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Contacted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {contactedLeads}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Qualified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {qualifiedLeads}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Won
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{closedWon}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg. Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="all" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
              <span className="hidden sm:inline">All Leads</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>
            <TabsTrigger value="new" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
              <span className="hidden sm:inline">New</span>
              <span className="sm:hidden">New</span>
              <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{newLeads}</span>
            </TabsTrigger>
            <TabsTrigger value="qualified" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
              <span className="hidden sm:inline">Qualified</span>
              <span className="sm:hidden">Qual.</span>
              <span className="text-[10px] sm:text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">{qualifiedLeads}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>
                View and manage all leads from your website chatbot and realtor
                portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadFilters
                communities={communities}
                floorplans={floorplans}
              />
              <LeadsList
                leads={leads}
                organizationId={organizationId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>New Leads</CardTitle>
              <CardDescription>
                Leads that need initial contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsList
                leads={leads.filter((l) => l.status === "new")}
                organizationId={organizationId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualified">
          <Card>
            <CardHeader>
              <CardTitle>Qualified Leads</CardTitle>
              <CardDescription>
                Leads that are ready for sales follow-up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadsList
                leads={leads.filter((l) => l.status === "qualified")}
                organizationId={organizationId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Lead Analytics</CardTitle>
              <CardDescription>
                Insights and trends from your lead data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadStats leads={leads} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
