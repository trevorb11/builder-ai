import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MarketingContentGenerator } from "@/components/marketing/content-generator";
import { ContentLibrary } from "@/components/marketing/content-library";
import {
  FileEdit,
  Instagram,
  Mail,
  FileText,
  Megaphone,
  Users,
  History,
  Sparkles,
} from "lucide-react";

const contentTypesWithIcons = [
  {
    id: "social_post",
    name: "Social Media",
    icon: Instagram,
    description: "Facebook, Instagram, LinkedIn posts",
    color: "bg-pink-100 text-pink-600",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    description: "Nurture sequences and campaigns",
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "blog",
    name: "Blog Post",
    icon: FileText,
    description: "SEO-optimized articles",
    color: "bg-green-100 text-green-600",
  },
  {
    id: "listing",
    name: "Listings",
    icon: FileEdit,
    description: "QMI and inventory descriptions",
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: "ad_copy",
    name: "Ad Copy",
    icon: Megaphone,
    description: "Facebook and Google ads",
    color: "bg-purple-100 text-purple-600",
  },
  {
    id: "realtor_email",
    name: "Realtor Comms",
    icon: Users,
    description: "Agent communications",
    color: "bg-indigo-100 text-indigo-600",
  },
];

const contentTypes = contentTypesWithIcons.map(({ icon, color, ...rest }) => rest);

async function getMarketingData(organizationId: string) {
  const [recentContent, communities, floorplans] = await Promise.all([
    prisma.marketingContent.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.community.findMany({
      where: { organizationId, status: "active" },
      select: { id: true, name: true },
    }),
    prisma.floorplan.findMany({
      where: { organizationId, status: "active" },
      select: { id: true, name: true, bedrooms: true, bathrooms: true },
    }),
  ]);

  const contentStats = await prisma.marketingContent.groupBy({
    by: ["type"],
    where: { organizationId },
    _count: true,
  });

  return { recentContent, communities, floorplans, contentStats };
}

export default async function MarketingPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to access Marketing Assistant.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { recentContent, communities, floorplans, contentStats } =
    await getMarketingData(organizationId);

  const totalContent = contentStats.reduce((acc, s) => acc + s._count, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start sm:items-center gap-3">
          <div className="rounded-lg bg-violet-500 p-2 flex-shrink-0">
            <FileEdit className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Marketing Writer</h1>
              <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 text-[10px]">
                <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                AI
              </Badge>
            </div>
            <p className="text-sm sm:text-base text-gray-600">
              Generate on-brand content using your community data and builder info
            </p>
          </div>
        </div>
      </div>

      {/* Content Type Stats */}
      <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {contentTypesWithIcons.map((type) => {
          const count =
            contentStats.find((s) => s.type === type.id)?._count || 0;
          const IconComponent = type.icon;
          return (
            <Card key={type.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2.5">
                  <div className={`rounded-lg p-1.5 sm:p-2 ${type.color.split(" ")[0]}`}>
                    <IconComponent className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${type.color.split(" ")[1]}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{type.name}</p>
                    <p className="text-xs text-gray-500">{count} created</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="generate" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto h-auto gap-1 p-1">
          <TabsTrigger value="generate" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Generate Content</span>
            <span className="sm:hidden">Generate</span>
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Content Library</span>
            <span className="sm:hidden">Library</span>
            {totalContent > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{totalContent}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>AI Content Generator</CardTitle>
                  <CardDescription>
                    Select a content type, choose your tone, and let AI create marketing content using your real product data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MarketingContentGenerator
                    organizationId={organizationId}
                    communities={communities}
                    floorplans={floorplans}
                    contentTypes={contentTypes}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Writing Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-lg bg-pink-50 border border-pink-100 p-3">
                    <p className="font-medium text-pink-900">Social Media</p>
                    <p className="text-pink-700 text-xs mt-1">
                      Lead with lifestyle benefits. Use a specific community name, include a clear CTA, and mention a current incentive to drive engagement.
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                    <p className="font-medium text-blue-900">Email Campaigns</p>
                    <p className="text-blue-700 text-xs mt-1">
                      Personalize with buyer interests. Reference their preferred community or floorplan, and include time-sensitive offers to create urgency.
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                    <p className="font-medium text-amber-900">Listings & QMIs</p>
                    <p className="text-amber-700 text-xs mt-1">
                      Highlight included upgrades, move-in timeline, and lot premium details. Focus on what makes this home different from building new.
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50 border border-purple-100 p-3">
                    <p className="font-medium text-purple-900">Ad Copy</p>
                    <p className="text-purple-700 text-xs mt-1">
                      Keep it concise with a strong hook. Google Ads: use keywords buyers search for. Facebook: lead with emotion and visuals.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Your Data</CardTitle>
                  <CardDescription className="text-xs">
                    The AI uses this data to generate accurate content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Communities</span>
                    <Badge variant={communities.length > 0 ? "secondary" : "outline"} className="text-xs">
                      {communities.length > 0 ? communities.length : "None yet"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Floorplans</span>
                    <Badge variant={floorplans.length > 0 ? "secondary" : "outline"} className="text-xs">
                      {floorplans.length > 0 ? floorplans.length : "None yet"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Content Created</span>
                    <Badge variant={totalContent > 0 ? "secondary" : "outline"} className="text-xs">
                      {totalContent}
                    </Badge>
                  </div>
                  {communities.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-md p-2">
                      Add communities and floorplans for more specific, accurate content generation.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle>Content Library</CardTitle>
              <CardDescription>
                Browse, edit, and manage your saved content. Click any item to view, copy, or edit it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentLibrary content={recentContent} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
