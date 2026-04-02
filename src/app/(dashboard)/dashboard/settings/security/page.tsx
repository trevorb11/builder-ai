import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { SecuritySettingsForm } from "@/components/settings/security-settings-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default async function SecuritySettingsPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please sign in to access security settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Breadcrumb
        items={[
          { label: "Settings", href: "/dashboard/settings" },
          { label: "Security" },
        ]}
        className="mb-4"
      />
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Manage your account security and password
        </p>
      </div>

      <SecuritySettingsForm
        userEmail={session.user.email}
      />
    </div>
  );
}
