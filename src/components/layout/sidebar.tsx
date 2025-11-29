"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  FileEdit,
  Search,
  Target,
  GraduationCap,
  Link2,
  Users,
  Home,
  Building2,
  LayoutGrid,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string;
    image?: string | null;
    organizationName?: string;
  };
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
  },
  {
    name: "AI Assistant",
    href: "/dashboard/assistant",
    icon: MessageSquare,
    description: "Website chatbot",
  },
  {
    name: "Marketing",
    href: "/dashboard/marketing",
    icon: FileEdit,
    description: "Content generation",
  },
  {
    name: "SEO & AI Search",
    href: "/dashboard/seo",
    icon: Search,
    description: "Optimization tools",
  },
  {
    name: "Competitors",
    href: "/dashboard/competitors",
    icon: Target,
    description: "Intelligence reports",
  },
  {
    name: "Sales Training",
    href: "/dashboard/training",
    icon: GraduationCap,
    description: "AI roleplay coach",
  },
  {
    name: "CRM Integration",
    href: "/dashboard/crm",
    icon: Link2,
    description: "HubSpot, Salesforce, GHL",
  },
  {
    name: "Realtor Portal",
    href: "/dashboard/realtors",
    icon: Users,
    description: "Agent resources",
  },
];

const dataNavigation = [
  {
    name: "Communities",
    href: "/dashboard/communities",
    icon: Building2,
  },
  {
    name: "Floorplans",
    href: "/dashboard/floorplans",
    icon: Home,
  },
  {
    name: "Leads",
    href: "/dashboard/leads",
    icon: Users,
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
          B
        </div>
        <span className="text-lg font-semibold text-gray-900">Builder AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  {item.description && (
                    <span className={cn(
                      "text-xs",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )}>
                      {item.description}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Data
          </h3>
          <div className="mt-2 space-y-1">
            {dataNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Menu */}
      <div className="border-t border-gray-200 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback>
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="text-sm font-medium text-gray-900">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.organizationName || "Organization"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/api/auth/signout" className="flex items-center gap-2 text-red-600">
                <LogOut className="h-4 w-4" />
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
