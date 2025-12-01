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
  Sparkles,
  Globe,
  TrendingUp,
  Lightbulb,
  BarChart3,
  HelpCircle,
  ChevronRight,
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
import { useState } from "react";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string;
    image?: string | null;
    organizationName?: string;
  };
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
  color?: string;
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutGrid,
        description: "Overview & metrics",
      },
    ],
  },
  {
    title: "Deep Research",
    items: [
      {
        name: "Digital Footprint",
        href: "/dashboard/research/footprint",
        icon: Globe,
        description: "Analyze your presence",
        badge: "AI",
        color: "text-teal-500",
      },
      {
        name: "Competitor Intel",
        href: "/dashboard/research/competitors",
        icon: Target,
        description: "Deep competitor analysis",
        badge: "AI",
        color: "text-amber-500",
      },
      {
        name: "Content Strategy",
        href: "/dashboard/research/content",
        icon: Lightbulb,
        description: "Topic recommendations",
        badge: "AI",
        color: "text-purple-500",
      },
    ],
  },
  {
    title: "AI Tools",
    items: [
      {
        name: "Website Assistant",
        href: "/dashboard/assistant",
        icon: MessageSquare,
        description: "AI chatbot",
        color: "text-blue-500",
      },
      {
        name: "Marketing",
        href: "/dashboard/marketing",
        icon: FileEdit,
        description: "Content generation",
        color: "text-violet-500",
      },
      {
        name: "SEO & AI Search",
        href: "/dashboard/seo",
        icon: Search,
        description: "Optimization tools",
        color: "text-emerald-500",
      },
      {
        name: "Sales Training",
        href: "/dashboard/training",
        icon: GraduationCap,
        description: "AI roleplay coach",
        color: "text-pink-500",
      },
    ],
  },
  {
    title: "Integrations",
    items: [
      {
        name: "CRM",
        href: "/dashboard/crm",
        icon: Link2,
        description: "HubSpot, Salesforce, GHL",
        color: "text-cyan-500",
      },
      {
        name: "Realtor Portal",
        href: "/dashboard/realtors",
        icon: Users,
        description: "Agent resources",
        color: "text-indigo-500",
      },
    ],
  },
  {
    title: "Data",
    items: [
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
      {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
    ],
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (title: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(title)) {
      newCollapsed.delete(title);
    } else {
      newCollapsed.add(title);
    }
    setCollapsedSections(newCollapsed);
  };

  return (
    <div className="flex h-full w-72 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-gray-900">Builder AI</span>
          <p className="text-xs text-gray-500">AI-Powered Home Builder Tools</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section, sectionIndex) => {
          const isCollapsed = collapsedSections.has(section.title);

          return (
            <div key={section.title} className={cn(sectionIndex > 0 && "mt-6")}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600"
              >
                {section.title}
                <ChevronRight
                  className={cn(
                    "h-3 w-3 transition-transform",
                    !isCollapsed && "rotate-90"
                  )}
                />
              </button>

              {!isCollapsed && (
                <div className="mt-1 space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                          isActive
                            ? "bg-blue-50 text-blue-700 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 flex-shrink-0 transition-colors",
                            isActive ? "text-blue-600" : item.color || "text-gray-400 group-hover:text-gray-600"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{item.name}</span>
                            {item.badge && (
                              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <span
                              className={cn(
                                "text-xs truncate block",
                                isActive ? "text-blue-600/70" : "text-gray-400"
                              )}
                            >
                              {item.description}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Help & Support */}
      <div className="border-t border-gray-100 px-3 py-3">
        <Link
          href="/dashboard/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <HelpCircle className="h-5 w-5 text-gray-400" />
          <span>Help & Support</span>
        </Link>
      </div>

      {/* User Menu */}
      <div className="border-t border-gray-200 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2 py-6 hover:bg-gray-50"
            >
              <Avatar className="h-9 w-9 border-2 border-gray-100">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="text-sm font-semibold text-gray-900">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-[140px]">
                  {user?.organizationName || "Organization"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard/settings/organization"
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Organization
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/api/auth/signout"
                className="flex items-center gap-2 text-red-600"
              >
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
