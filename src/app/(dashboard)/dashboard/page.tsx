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
  Globe,
  Lightbulb,
  Sparkles,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

async function getDashboardStats(organizationId: string) {
  const [
    communities,
    floorplans,
    leads,
    conversations,
    marketingContent,
    salesSessions,
    researchReports,
    contentTopics,
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
    prisma.deepResearchReport.count({
      where: { organizationId, status: "completed" },
    }),
    prisma.contentTopic.count({ where: { organizationId } }),
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

  const recentResearch = await prisma.deepResearchReport.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      createdAt: true,
    },
  });

  return {
    communities,
    floorplans,
    leads,
    conversations,
    marketingContent,
    salesSessions,
    researchReports,
    contentTopics,
    recentLeads,
    recentResearch,
  };
}

const researchTools = [
  {
    name: "Digital Footprint",
    description: "Analyze your online presence",
    href: "/dashboard/research/footprint",
    icon: Globe,
    gradient: "from-teal-400 to-teal-600",
    shadow: "shadow-teal-500/20",
  },
  {
    name: "Competitor Intel",
    description: "Deep competitor analysis",
    href: "/dashboard/research/competitors",
    icon: Target,
    gradient: "from-amber-400 to-amber-600",
    shadow: "shadow-amber-500/20",
  },
  {
    name: "Content Strategy",
    description: "Topic recommendations",
    href: "/dashboard/research/content",
    icon: Lightbulb,
    gradient: "from-purple-400 to-purple-600",
    shadow: "shadow-purple-500/20",
  },
];

const aiTools = [
  {
    name: "Website Assistant",
    description: "AI chatbot for your website",
    href: "/dashboard/assistant",
    icon: MessageSquare,
    color: "bg-blue-500",
  },
  {
    name: "Marketing",
    description: "Generate content with AI",
    href: "/dashboard/marketing",
    icon: FileEdit,
    color: "bg-violet-500",
  },
  {
    name: "SEO & AI Search",
    description: "Optimize for AI discovery",
    href: "/dashboard/seo",
    icon: Search,
    color: "bg-emerald-500",
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
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
              </h1>
              <p className="mt-1 text-gray-500">
                {session?.user?.organizationName || "Your AI-powered builder tools dashboard"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/communities/new">
                <Button variant="outline" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Add Community
                </Button>
              </Link>
              <Link href="/dashboard/research/footprint">
                <Button className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  <Sparkles className="h-4 w-4" />
                  Start Research
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Communities"
            value={stats?.communities || 0}
            description="Active communities"
            icon={Building2}
            trend="+2 this month"
          />
          <StatCard
            title="Total Leads"
            value={stats?.leads || 0}
            description="From AI Assistant"
            icon={Users}
            trend="+12% vs last month"
          />
          <StatCard
            title="Conversations"
            value={stats?.conversations || 0}
            description="Chat sessions"
            icon={MessageSquare}
          />
          <StatCard
            title="Research Reports"
            value={stats?.researchReports || 0}
            description="Completed analyses"
            icon={Activity}
          />
        </div>

        {/* Deep Research Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Deep Research</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                <Sparkles className="h-2.5 w-2.5" />
                AI Powered
              </span>
            </div>
            <Link href="/dashboard/research/footprint" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all research
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {researchTools.map((tool) => (
              <Link key={tool.name} href={tool.href}>
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 card-hover overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tool.gradient} shadow-lg ${tool.shadow}`}>
                        <tool.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {tool.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Tools Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">AI Tools</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {aiTools.map((tool) => (
              <Link key={tool.name} href={tool.href}>
                <Card className="h-full transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tool.color}`}>
                        <tool.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{tool.name}</h3>
                        <p className="text-xs text-gray-500">{tool.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Leads</CardTitle>
                <Link href="/dashboard/leads">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.recentLeads && stats.recentLeads.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-700">
                            {lead.firstName?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {lead.firstName} {lead.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{lead.email}</p>
                        </div>
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
                          className="text-[10px]"
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
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No leads yet. Configure your AI Assistant to start capturing leads.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Research */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Research</CardTitle>
                <Link href="/dashboard/research/footprint">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    View all
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.recentResearch && stats.recentResearch.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentResearch.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ResearchIcon type={report.type} status={report.status} />
                        <div>
                          <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                            {report.title}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {report.type.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <ResearchStatusBadge status={report.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No research yet. Start your first deep research analysis.
                  </p>
                  <Link href="/dashboard/research/footprint">
                    <Button size="sm" className="mt-3">
                      Start Research
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
            {trend && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResearchIcon({ type, status }: { type: string; status: string }) {
  const icons: Record<string, React.ElementType> = {
    digital_footprint: Globe,
    competitor_research: Target,
    content_strategy: Lightbulb,
  };
  const Icon = icons[type] || Activity;

  const colors: Record<string, string> = {
    completed: "bg-green-100 text-green-600",
    in_progress: "bg-blue-100 text-blue-600",
    failed: "bg-red-100 text-red-600",
    pending: "bg-gray-100 text-gray-600",
  };

  return (
    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${colors[status]}`}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

function ResearchStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px]">
          <CheckCircle className="h-3 w-3 mr-1" />
          Done
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px]">
          <Clock className="h-3 w-3 mr-1 animate-spin" />
          Running
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[10px]">
          <AlertCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-[10px]">
          Pending
        </Badge>
      );
  }
}
