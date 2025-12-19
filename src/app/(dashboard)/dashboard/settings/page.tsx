import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Building2, User, Bell, Shield } from "lucide-react";

async function getSettingsData(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  return { organization };
}

export default async function SettingsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to access settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { organization } = await getSettingsData(organizationId);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gray-700 p-2">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">
              Manage your account and organization settings
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle>Organization</CardTitle>
                <CardDescription>Manage your organization details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Organization Name</label>
              <p className="text-gray-900">{organization?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Website</label>
              <p className="text-gray-900">{organization?.website || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Brand Voice</label>
              <p className="text-gray-900 text-sm">{organization?.brandVoice || 'Not configured'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-purple-500" />
              <div>
                <CardTitle>Account</CardTitle>
                <CardDescription>Your personal account settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{session?.user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-gray-900">{session?.user?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <p className="text-gray-900 capitalize">{session?.user?.role || 'User'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Notification settings coming soon.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Security and privacy settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Security settings coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
