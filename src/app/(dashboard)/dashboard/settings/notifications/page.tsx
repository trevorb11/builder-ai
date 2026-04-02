import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default async function NotificationSettingsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to access notification settings.
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
          { label: "Notifications" },
        ]}
        className="mb-4"
      />
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notification Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Configure how and when you receive notifications
        </p>
      </div>

      <NotificationSettingsForm />
    </div>
  );
}
