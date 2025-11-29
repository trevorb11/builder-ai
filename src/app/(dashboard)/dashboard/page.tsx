import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MessageSquare,
  FileEdit,
  Search,
  Target,
  GraduationCap,
  Link2,
  Users,
  TrendingUp,
  Home,
  Building2,
  ArrowRight,
} from "lucide-react";

async function getDashboardStats(organizationId: string) {
  const [
    communities,
    floorplans,
    leads,
    conversations,
    marketingContent,
    salesSessions,
  ] = await Promise.all([
    prisma.community.count({ where: { organizationId } }),
    prisma.floorplan.count({ where: { organizationId } }),
    prisma.lead.count({ where: { organizationId } }),
    prisma.conversation.count({
      where: { lead: { organizationId } },
    }),
    prisma.marketingContent.count({ where: { organizationId } }),
    prisma.salesTrainingSession.count({
      where: { user: { organizationId } },
    }),
  ]);

  const recentLeads = await prisma.lead.findMany({
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
      community: { select: { name: true } },
    },
  });

  return {
    communities,
    floorplans,
    leads,
    conversations,
    marketingContent,
    salesSessions,
    recentLeads,
  };
}

const tools = [
  {
    name: "AI Assistant",
    description: "Configure your website chatbot",
    href: "/dashboard/assistant",
    icon: MessageSquare,
    color: "bg-blue-500",
  },
  {
    name: "Marketing",
    description: "Generate content with AI",
    href: "/dashboard/marketing",
    icon: FileEdit,
    color: "bg-purple-500",
  },
  {
    name: "SEO & AI Search",
    description: "Optimize for AI discovery",
    href: "/dashboard/seo",
    icon: Search,
    color: "bg-green-500",
  },
  {
    name: "Competitors",
    description: "Track competitive intelligence",
    href: "/dashboard/competitors",
    icon: Target,
    color: "bg-orange-500",
  },
  {
    name: "Sales Training",
    description: "Practice with AI roleplay",
    href: "/dashboard/training",
    icon: GraduationCap,
    color: "bg-pink-500",
  },
  {
    name: "CRM Integration",
    description: "Connect HubSpot, Salesforce",
    href: "/dashboard/crm",
    icon: Link2,
    color: "bg-cyan-500",
  },
  {
    name: "Realtor Portal",
    description: "Manage agent resources",
    href: "/dashboard/realtors",
    icon: Users,
    color: "bg-indigo-500",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  let stats = null;
  if (organizationId) {
    stats = await getDashboardStats(organizationId);
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="mt-2 text-gray-600">
          {session?.user?.organizationName || "Your AI-powered builder tools dashboard"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Communities
            </CardTitle>
            <Building2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.communities || 0}</div>
            <p className="text-xs text-gray-500">Active communities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Floorplans
            </CardTitle>
            <Home className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.floorplans || 0}</div>
            <p className="text-xs text-gray-500">Available plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Leads
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.leads || 0}</div>
            <p className="text-xs text-gray-500">From AI Assistant</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Conversations
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.conversations || 0}</div>
            <p className="text-xs text-gray-500">Chat sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tools Grid */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">AI Tools</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool) => (
            <Link key={tool.name} href={tool.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${tool.color}`}>
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{tool.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Leads</CardTitle>
              <Link href="/dashboard/leads">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentLeads && stats.recentLeads.length > 0 ? (
              <div className="space-y-4">
                {stats.recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          lead.status === "new"
                            ? "default"
                            : lead.status === "qualified"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {lead.status}
                      </Badge>
                      {lead.community && (
                        <p className="mt-1 text-xs text-gray-500">
                          {lead.community.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No leads yet. Configure your AI Assistant to start capturing leads.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/communities/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Add New Community
              </Button>
            </Link>
            <Link href="/dashboard/floorplans/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Add New Floorplan
              </Button>
            </Link>
            <Link href="/dashboard/marketing" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileEdit className="mr-2 h-4 w-4" />
                Generate Marketing Content
              </Button>
            </Link>
            <Link href="/dashboard/training" className="block">
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="mr-2 h-4 w-4" />
                Start Sales Training Session
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
