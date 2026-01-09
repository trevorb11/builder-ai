import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OrganizationSettingsForm } from "@/components/settings/organization-form";

export default async function OrganizationSettingsPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Please sign in to manage organization settings.</p>
      </div>
    );
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-gray-600">Manage your company profile and brand information</p>
      </div>

      <OrganizationSettingsForm organization={organization} />
    </div>
  );
}
