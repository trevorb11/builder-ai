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
} from "lucide-react";

const contentTypes = [
  {
    id: "social_post",
    name: "Social Media",
    icon: Instagram,
    description: "Facebook, Instagram, LinkedIn posts",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    description: "Nurture sequences and campaigns",
  },
  {
    id: "blog",
    name: "Blog Post",
    icon: FileText,
    description: "SEO-optimized articles",
  },
  {
    id: "listing",
    name: "Listings",
    icon: FileEdit,
    description: "QMI and inventory descriptions",
  },
  {
    id: "ad_copy",
    name: "Ad Copy",
    icon: Megaphone,
    description: "Facebook and Google ads",
  },
  {
    id: "realtor_email",
    name: "Realtor Comms",
    icon: Users,
    description: "Agent communications",
  },
];

async function getMarketingData(organizationId: string) {
  const [recentContent, communities, floorplans] = await Promise.all([
    prisma.marketingContent.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 20,
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
      <div className="p-8">
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-500 p-2">
            <FileEdit className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketing Assistant</h1>
            <p className="text-gray-600">
              Generate content using your builder data and brand voice
            </p>
          </div>
        </div>
      </div>

      {/* Content Type Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {contentTypes.map((type) => {
          const count =
            contentStats.find((s) => s.type === type.id)?._count || 0;
          return (
            <Card key={type.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <type.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{type.name}</p>
                    <p className="text-xs text-gray-500">{count} created</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate" className="gap-2">
            <FileEdit className="h-4 w-4" />
            Generate Content
          </TabsTrigger>
          <TabsTrigger value="library" className="gap-2">
            <History className="h-4 w-4" />
            Content Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>AI Content Generator</CardTitle>
                  <CardDescription>
                    Select a content type and provide details to generate marketing content
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
                <CardHeader>
                  <CardTitle className="text-base">Content Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="font-medium text-blue-900">Social Media</p>
                    <p className="text-blue-700">
                      Include community highlights, lifestyle benefits, and clear CTAs
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-3">
                    <p className="font-medium text-purple-900">Email Campaigns</p>
                    <p className="text-purple-700">
                      Personalize with buyer interests and current incentives
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3">
                    <p className="font-medium text-green-900">Listings</p>
                    <p className="text-green-700">
                      Highlight unique features, upgrades, and move-in dates
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Available Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Communities</span>
                    <Badge variant="secondary">{communities.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Floorplans</span>
                    <Badge variant="secondary">{floorplans.length}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                Browse, edit, and manage your AI-generated content
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
