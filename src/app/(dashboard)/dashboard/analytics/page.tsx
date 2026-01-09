import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Home, TrendingUp, MessageSquare, Target } from "lucide-react";

async function getAnalyticsData(organizationId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalLeads,
    totalCommunities,
    totalFloorplans,
    totalConversations,
    recentLeads,
    qualifiedLeads,
    newLeadsThisMonth,
    contentGenerated,
    leadsWithConversations,
  ] = await Promise.all([
    prisma.lead.count({ where: { organizationId } }),
    prisma.community.count({ where: { organizationId, status: "active" } }),
    prisma.floorplan.count({ where: { organizationId, status: "active" } }),
    prisma.conversation.count({ where: { lead: { organizationId } } }),
    prisma.lead.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.lead.count({ where: { organizationId, status: "qualified" } }),
    prisma.lead.count({ where: { organizationId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.marketingContent.count({ where: { organizationId } }),
    prisma.lead.count({ where: { organizationId, conversations: { some: {} } } }),
  ]);

  const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

  return { 
    totalLeads, 
    totalCommunities, 
    totalFloorplans, 
    totalConversations, 
    recentLeads,
    qualifiedLeads,
    newLeadsThisMonth,
    contentGenerated,
    conversionRate,
    leadsWithConversations,
  };
}

export default async function AnalyticsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to view analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = await getAnalyticsData(organizationId);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500 p-2">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">
              Track your performance and key metrics
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalLeads}</div>
            <p className="text-xs text-gray-500 mt-1">All captured leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Communities</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCommunities}</div>
            <p className="text-xs text-gray-500 mt-1">Currently selling</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Floorplans</CardTitle>
            <Home className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalFloorplans}</div>
            <p className="text-xs text-gray-500 mt-1">Available designs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalConversations}</div>
            <p className="text-xs text-gray-500 mt-1">AI chat sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Latest leads captured from your website</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentLeads.length > 0 ? (
              <div className="space-y-4">
                {data.recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      lead.status === 'qualified' ? 'bg-green-100 text-green-700' :
                      lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No leads yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Key metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Lead Conversion Rate</span>
                <div className="flex items-center gap-2">
                  {data.conversionRate > 0 && <TrendingUp className="h-4 w-4 text-green-500" />}
                  <span className="font-medium">{data.conversionRate}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">New Leads (30 days)</span>
                <span className="font-medium">{data.newLeadsThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Content Generated</span>
                <span className="font-medium">{data.contentGenerated}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Leads with AI Chats</span>
                <span className="font-medium">{data.leadsWithConversations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Qualified Leads</span>
                <span className="font-medium text-green-600">{data.qualifiedLeads}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
