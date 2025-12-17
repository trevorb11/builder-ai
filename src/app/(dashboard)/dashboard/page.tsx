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
  Play,
  BookOpen,
  Zap,
  BarChart3,
  Mail,
  Star,
  ChevronRight,
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
    organization,
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
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, website: true },
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
      score: true,
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

  // Check if chatbot is configured
  const chatbotConfig = await prisma.chatbotConfig.findUnique({
    where: { organizationId },
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
    organization,
    hasChatbot: !!chatbotConfig,
  };
}

// Quick action cards for new users
const quickActions = [
  {
    title: "Add Your First Community",
    description: "Start by adding the communities where you build homes",
    href: "/dashboard/communities",
    icon: Building2,
    color: "from-emerald-500 to-emerald-600",
    priority: 1,
    checkKey: "communities",
  },
  {
    title: "Add Floorplans",
    description: "Add your floorplan catalog with pricing and specs",
    href: "/dashboard/floorplans",
    icon: Home,
    color: "from-violet-500 to-violet-600",
    priority: 2,
    checkKey: "floorplans",
  },
  {
    title: "Set Up AI Chatbot",
    description: "Configure your website AI assistant to capture leads",
    href: "/dashboard/assistant",
    icon: MessageSquare,
    color: "from-blue-500 to-blue-600",
    priority: 3,
    checkKey: "hasChatbot",
  },
  {
    title: "Analyze Your Online Presence",
    description: "Get AI insights on your digital footprint",
    href: "/dashboard/research/footprint",
    icon: Globe,
    color: "from-teal-500 to-teal-600",
    priority: 4,
    checkKey: "researchReports",
  },
];

const featureCards = [
  {
    title: "AI Website Assistant",
    description: "24/7 chatbot that answers buyer questions and captures leads automatically",
    href: "/dashboard/assistant",
    icon: MessageSquare,
    gradient: "from-blue-500 to-blue-600",
    benefits: ["Capture leads 24/7", "Answer FAQs instantly", "Qualify buyers"],
  },
  {
    title: "Deep Research",
    description: "AI-powered analysis of your digital presence and competitors",
    href: "/dashboard/research/footprint",
    icon: Search,
    gradient: "from-teal-500 to-teal-600",
    benefits: ["Digital footprint audit", "Competitor insights", "Content ideas"],
  },
  {
    title: "Marketing Generator",
    description: "Create social posts, emails, and listings with AI in seconds",
    href: "/dashboard/marketing",
    icon: FileEdit,
    gradient: "from-violet-500 to-violet-600",
    benefits: ["Social media posts", "Email campaigns", "Listing descriptions"],
  },
  {
    title: "Sales Training",
    description: "Practice objection handling with AI roleplay coaching",
    href: "/dashboard/training",
    icon: GraduationCap,
    gradient: "from-pink-500 to-pink-600",
    benefits: ["Realistic scenarios", "Instant feedback", "Track improvement"],
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  let stats = null;
  if (organizationId) {
    stats = await getDashboardStats(organizationId);
  }

  const isNewUser = !stats || (stats.communities === 0 && stats.floorplans === 0);
  const userName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Welcome Header */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNewUser ? `Welcome to Builder AI, ${userName}!` : `Welcome back, ${userName}`}
              </h1>
              <p className="mt-1 text-gray-500">
                {stats?.organization?.name || "Your AI-powered home builder toolkit"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/leads">
                <Button variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  {stats?.leads || 0} Leads
                </Button>
              </Link>
              <Link href="/dashboard/research/footprint">
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
                  <Sparkles className="h-4 w-4" />
                  Start Research
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Getting Started Section for New Users */}
        {isNewUser && (
          <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                    <Zap className="h-4 w-4" />
                    Quick Start Guide
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Let&apos;s get your AI tools set up
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Complete these steps to unlock the full power of your AI-powered builder platform.
                    It only takes a few minutes!
                  </p>

                  <div className="space-y-3">
                    {quickActions.map((action, index) => {
                      const isCompleted = stats && stats[action.checkKey as keyof typeof stats];
                      return (
                        <Link key={action.href} href={action.href}>
                          <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                            isCompleted
                              ? "bg-white/50 opacity-60"
                              : "bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          }`}>
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${action.color} shadow-lg`}>
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-white" />
                              ) : (
                                <action.icon className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${isCompleted ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                {action.title}
                              </p>
                              <p className="text-sm text-gray-500">{action.description}</p>
                            </div>
                            <ChevronRight className={`h-5 w-5 ${isCompleted ? "text-gray-300" : "text-gray-400"}`} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-center text-white">
                  <div className="mb-6">
                    <BookOpen className="h-12 w-12 opacity-80 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
                    <p className="text-blue-100">
                      Our AI tools are designed to be easy to use. If you need assistance,
                      check out our guides or contact support.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                      <Play className="h-4 w-4 mr-2" />
                      Watch Tutorial
                    </Button>
                    <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                      <Mail className="h-4 w-4 mr-2" />
                      Get Help
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Show for existing users */}
        {!isNewUser && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Communities"
              value={stats?.communities || 0}
              description="Active communities"
              icon={Building2}
              href="/dashboard/communities"
              color="emerald"
            />
            <StatCard
              title="Total Leads"
              value={stats?.leads || 0}
              description="From AI Assistant"
              icon={Users}
              href="/dashboard/leads"
              color="blue"
              highlight={stats?.leads !== undefined && stats.leads > 0}
            />
            <StatCard
              title="Conversations"
              value={stats?.conversations || 0}
              description="Chat sessions"
              icon={MessageSquare}
              href="/dashboard/assistant"
              color="violet"
            />
            <StatCard
              title="Research Reports"
              value={stats?.researchReports || 0}
              description="Completed analyses"
              icon={Activity}
              href="/dashboard/research/footprint"
              color="teal"
            />
          </div>
        )}

        {/* Feature Cards Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI-Powered Tools</h2>
              <p className="text-gray-500 text-sm mt-1">
                Everything you need to market, sell, and grow your home building business
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature) => (
              <Link key={feature.href} href={feature.href} className="group">
                <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-md overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${feature.gradient}`} />
                  <CardContent className="p-5">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-4`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {feature.description}
                    </p>
                    <div className="space-y-1.5">
                      {feature.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/dashboard/competitors" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-orange-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                  <Target className="h-6 w-6 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Competitive Intelligence</h3>
                  <p className="text-sm text-gray-500">Track competitor pricing & features</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 ml-auto group-hover:text-orange-500 transition-colors" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/crm" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-cyan-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-cyan-100 flex items-center justify-center group-hover:bg-cyan-500 transition-colors">
                  <Link2 className="h-6 w-6 text-cyan-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">CRM Integration</h3>
                  <p className="text-sm text-gray-500">Connect HubSpot, Salesforce, GHL</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 ml-auto group-hover:text-cyan-500 transition-colors" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/realtors" className="group">
            <Card className="h-full transition-all hover:shadow-lg hover:border-indigo-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                  <Users className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Realtor Portal</h3>
                  <p className="text-sm text-gray-500">Manage agent access & resources</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 ml-auto group-hover:text-indigo-500 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity Section - Only for users with data */}
        {!isNewUser && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Leads */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Recent Leads</CardTitle>
                    <CardDescription className="text-xs">Latest inquiries from your AI assistant</CardDescription>
                  </div>
                  <Link href="/dashboard/leads">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-600 hover:text-blue-800">
                      View all
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {stats?.recentLeads && stats.recentLeads.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                            <span className="text-sm font-semibold text-white">
                              {lead.firstName?.charAt(0) || lead.email?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {lead.firstName || lead.lastName
                                ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim()
                                : lead.email || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {lead.community?.name || "General Inquiry"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {lead.score >= 70 && (
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              <span className="text-xs font-medium">Hot</span>
                            </div>
                          )}
                          <LeadStatusBadge status={lead.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No leads yet"
                    description="Set up your AI chatbot to start capturing leads automatically"
                    href="/dashboard/assistant"
                    buttonText="Configure Chatbot"
                  />
                )}
              </CardContent>
            </Card>

            {/* Recent Research */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Research Reports</CardTitle>
                    <CardDescription className="text-xs">AI-powered insights and analysis</CardDescription>
                  </div>
                  <Link href="/dashboard/research/footprint">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs text-blue-600 hover:text-blue-800">
                      New research
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {stats?.recentResearch && stats.recentResearch.length > 0 ? (
                  <div className="space-y-2">
                    {stats.recentResearch.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50/80 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ResearchIcon type={report.type} status={report.status} />
                          <div>
                            <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                              {report.title}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {report.type.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>
                        <ResearchStatusBadge status={report.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Search}
                    title="No research yet"
                    description="Start with a digital footprint analysis to see how you appear online"
                    href="/dashboard/research/footprint"
                    buttonText="Start Research"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  color,
  highlight,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  href: string;
  color: "emerald" | "blue" | "violet" | "teal";
  highlight?: boolean;
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500",
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-500",
    violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-500",
    teal: "bg-teal-50 text-teal-600 group-hover:bg-teal-500",
  };

  return (
    <Link href={href} className="group">
      <Card className={`transition-all hover:shadow-lg ${highlight ? "ring-2 ring-blue-200" : ""}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-colors ${colors[color]} group-hover:text-white`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  buttonText,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  buttonText: string;
}) {
  return (
    <div className="text-center py-8 px-4">
      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-[200px] mx-auto">
        {description}
      </p>
      <Link href={href}>
        <Button size="sm" variant="outline">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}

function LeadStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-yellow-100 text-yellow-700",
    qualified: "bg-purple-100 text-purple-700",
    nurturing: "bg-orange-100 text-orange-700",
    closed_won: "bg-green-100 text-green-700",
    closed_lost: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] || styles.new}`}>
      {status.replace("_", " ")}
    </span>
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
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${colors[status]}`}>
      <Icon className="h-5 w-5" />
    </div>
  );
}

function ResearchStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
          <CheckCircle className="h-3 w-3" />
          Done
        </span>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium">
          <Clock className="h-3 w-3 animate-spin" />
          Running
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-medium">
          <AlertCircle className="h-3 w-3" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-medium">
          Pending
        </span>
      );
  }
}
