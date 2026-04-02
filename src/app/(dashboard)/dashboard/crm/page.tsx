import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CRMConnections } from "@/components/crm/crm-connections";
import { CRMSettings } from "@/components/crm/crm-settings";
import { SyncHistory } from "@/components/crm/sync-history";
import {
  Link2,
  Plug,
  Settings,
  History,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

async function getCRMData(organizationId: string) {
  const [integrations, syncLogs] = await Promise.all([
    prisma.cRMIntegration.findMany({
      where: { organizationId },
      include: {
        webhooks: true,
        syncLogs: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    }),
    prisma.cRMSyncLog.findMany({
      where: { integration: { organizationId } },
      include: { integration: { select: { provider: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return { integrations, syncLogs };
}

export default async function CRMPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to access CRM Integrations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { integrations, syncLogs } = await getCRMData(organizationId);

  const activeIntegrations = integrations.filter((i) => i.isActive);
  const recentErrors = syncLogs.filter((l) => l.status === "error").length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex-shrink-0 rounded-lg bg-cyan-500 p-2">
            <Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">CRM Integration</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Connect HubSpot, Salesforce, and GoHighLevel
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Connected CRMs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{activeIntegrations.length}</div>
              {activeIntegrations.length > 0 && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Syncs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncLogs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {syncLogs.filter((l) => l.status === "success").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div
                className={`text-2xl font-bold ${
                  recentErrors > 0 ? "text-red-600" : "text-gray-900"
                }`}
              >
                {recentErrors}
              </div>
              {recentErrors > 0 && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="connections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="connections" className="gap-2">
            <Plug className="h-4 w-4" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Sync History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>CRM Connections</CardTitle>
              <CardDescription>
                Connect your CRM to automatically sync leads and conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CRMConnections
                integrations={integrations}
                organizationId={organizationId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Configure how data syncs between Builder AI and your CRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CRMSettings
                integrations={integrations}
                organizationId={organizationId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                View recent synchronization activity and errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SyncHistory syncLogs={syncLogs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
