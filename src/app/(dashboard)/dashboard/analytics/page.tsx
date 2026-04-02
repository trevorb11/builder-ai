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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start sm:items-center gap-3">
          <div className="rounded-lg bg-blue-500 p-2 flex-shrink-0">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track your performance and key metrics
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
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

      <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Latest leads captured from your website</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentLeads.length > 0 ? (
              <div className="space-y-3">
                {data.recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-blue-700">
                          {lead.firstName?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{lead.firstName} {lead.lastName}</p>
                        <p className="text-xs text-gray-500">{lead.email}</p>
                      </div>
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
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No leads captured yet</p>
                <p className="text-xs text-gray-400 mt-1">Leads from your AI chatbot will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Key metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600">Lead Conversion Rate</span>
                  <div className="flex items-center gap-2">
                    {data.conversionRate > 0 && <TrendingUp className="h-3.5 w-3.5 text-green-500" />}
                    <span className="text-sm font-semibold">{data.conversionRate}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${Math.min(data.conversionRate, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-600">AI Chat Engagement</span>
                  <span className="text-sm font-semibold">
                    {data.totalLeads > 0 ? Math.round((data.leadsWithConversations / data.totalLeads) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${data.totalLeads > 0 ? Math.min(Math.round((data.leadsWithConversations / data.totalLeads) * 100), 100) : 0}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Leads (30 days)</span>
                  <span className="text-sm font-semibold">{data.newLeadsThisMonth}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Content Generated</span>
                  <span className="text-sm font-semibold">{data.contentGenerated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Qualified Leads</span>
                  <span className="text-sm font-semibold text-green-600">{data.qualifiedLeads}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
