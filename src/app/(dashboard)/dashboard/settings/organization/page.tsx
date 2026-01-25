import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OrganizationSettingsForm } from "@/components/settings/organization-form";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

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
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700 flex items-center gap-1">
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/dashboard/settings" className="hover:text-gray-700">
          Settings
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900 font-medium">Organization</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-gray-600">Manage your company profile and brand information</p>
      </div>

      <OrganizationSettingsForm organization={organization} />
    </div>
  );
}
