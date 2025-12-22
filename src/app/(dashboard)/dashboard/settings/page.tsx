import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountSettingsForm } from "@/components/settings/account-settings-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  User,
  Building2,
  Key,
  Shield,
  Bell,
  ChevronRight,
} from "lucide-react";

async function getUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: {
        select: { id: true, name: true },
      },
    },
  });
}

export default async function AccountSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please log in to access account settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = await getUserData(session.user.id);

  if (!user) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">User not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const settingsSections = [
    {
      title: "Organization Settings",
      description: "Manage company profile and branding",
      href: "/dashboard/settings/organization",
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Security",
      description: "Update password and security settings",
      href: "/dashboard/settings/security",
      icon: Shield,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Notifications",
      description: "Configure notification preferences",
      href: "/dashboard/settings/notifications",
      icon: Bell,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      comingSoon: true,
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 p-2">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Account Settings
            </h1>
            <p className="text-gray-600">
              Manage your personal account and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name || "User"}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 capitalize mt-1">
                    {user.role.replace("_", " ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Link
                    key={section.href}
                    href={section.comingSoon ? "#" : section.href}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      section.comingSoon
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {section.title}
                        {section.comingSoon && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{section.description}</p>
                    </div>
                    {!section.comingSoon && (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Organization Info */}
          {user.organization && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Organization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.organization.name}</p>
                    <Link
                      href="/dashboard/settings/organization"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Manage organization
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Account Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettingsForm user={user} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
