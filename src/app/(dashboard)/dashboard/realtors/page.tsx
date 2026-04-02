import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RealtorPortalSettings } from "@/components/realtor/portal-settings";
import { RealtorList } from "@/components/realtor/realtor-list";
import { PortalPreview } from "@/components/realtor/portal-preview";
import {
  Users,
  Settings,
  Eye,
  UserCheck,
  ExternalLink,
} from "lucide-react";

async function getRealtorData(organizationId: string) {
  const [portalConfig, realtors, organization] = await Promise.all([
    prisma.realtorPortalConfig.findUnique({
      where: { organizationId },
    }),
    prisma.realtorAccess.findMany({
      where: { portal: { organizationId } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        communities: {
          where: { status: "active" },
          include: {
            floorplans: { where: { status: "active" } },
            incentives: { where: { isActive: true } },
            inventory: { where: { status: "available" } },
          },
        },
      },
    }),
  ]);

  return { portalConfig, realtors, organization };
}

export default async function RealtorsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to access Realtor Portal.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { portalConfig, realtors, organization } =
    await getRealtorData(organizationId);

  const verifiedRealtors = realtors.filter((r) => r.isVerified);
  const activeRealtors = realtors.filter((r) => r.isActive);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex-shrink-0 rounded-lg bg-indigo-500 p-2">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Realtor Portal</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your agent resources and portal access
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Portal Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={portalConfig?.isActive ? "success" : "secondary"}>
              {portalConfig?.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Registered Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realtors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{verifiedRealtors.length}</div>
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Communities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organization?.communities.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Portal Settings
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2">
            <Users className="h-4 w-4" />
            Registered Agents
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Portal Configuration</CardTitle>
              <CardDescription>
                Configure your realtor portal settings and what information to display
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RealtorPortalSettings
                config={portalConfig}
                organizationId={organizationId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Registered Agents</CardTitle>
              <CardDescription>
                Manage real estate agents who have access to your portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RealtorList
                realtors={realtors}
                portalId={portalConfig?.id || null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Portal Preview</CardTitle>
                  <CardDescription>
                    Preview what agents see when they access your portal
                  </CardDescription>
                </div>
                {portalConfig?.portalUrl && (
                  <a
                    href={portalConfig.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    Open Portal
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <PortalPreview
                organization={organization}
                config={portalConfig}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
