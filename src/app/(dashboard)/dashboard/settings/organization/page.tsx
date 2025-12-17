import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationSettingsForm } from "@/components/settings/organization-settings-form";
import {
  Building2,
  Globe,
  Palette,
  MessageSquare,
} from "lucide-react";

async function getOrganization(organizationId: string) {
  return prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      digitalFootprintConfig: true,
    },
  });
}

export default async function OrganizationSettingsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              You need to be part of an organization to access these settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const organization = await getOrganization(organizationId);

  if (!organization) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">Organization not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 p-2">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Organization Settings
            </h1>
            <p className="text-gray-600">
              Manage your company profile and branding
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Stats */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {organization.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{organization.name}</p>
                  <p className="text-sm text-gray-500">{organization.slug}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Online Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {organization.website ? (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline block truncate"
                >
                  {organization.website}
                </a>
              ) : (
                <p className="text-sm text-gray-400">No website configured</p>
              )}
              {organization.digitalFootprintConfig?.facebookUrl && (
                <p className="text-xs text-gray-500 truncate">
                  Facebook connected
                </p>
              )}
              {organization.digitalFootprintConfig?.instagramUrl && (
                <p className="text-xs text-gray-500 truncate">
                  Instagram connected
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Brand Voice
              </CardTitle>
            </CardHeader>
            <CardContent>
              {organization.brandVoice ? (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {organization.brandVoice}
                </p>
              ) : (
                <p className="text-sm text-gray-400">
                  No brand voice defined yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Update your organization details. These settings affect how your
                AI tools generate content and interact with buyers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrganizationSettingsForm organization={organization} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
