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
  Lightbulb,
  BarChart3,
  HelpCircle,
  ChevronRight,
  Zap,
  Package,
  Gift,
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
  defaultOpen?: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
  badgeColor?: string;
  color?: string;
  isNew?: boolean;
}

const navSections: NavSection[] = [
  {
    title: "Overview",
    defaultOpen: true,
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutGrid,
        description: "Your command center",
      },
    ],
  },
  {
    title: "Deep Research",
    defaultOpen: true,
    items: [
      {
        name: "Digital Footprint",
        href: "/dashboard/research/footprint",
        icon: Globe,
        description: "Analyze your online presence",
        badge: "AI",
        badgeColor: "from-teal-500 to-cyan-500",
        color: "text-teal-500",
      },
      {
        name: "Competitor Intel",
        href: "/dashboard/research/competitors",
        icon: Target,
        description: "Deep competitor analysis",
        badge: "AI",
        badgeColor: "from-amber-500 to-orange-500",
        color: "text-amber-500",
      },
      {
        name: "Content Strategy",
        href: "/dashboard/research/content",
        icon: Lightbulb,
        description: "Topic recommendations",
        badge: "AI",
        badgeColor: "from-purple-500 to-pink-500",
        color: "text-purple-500",
      },
    ],
  },
  {
    title: "AI Tools",
    defaultOpen: true,
    items: [
      {
        name: "Website Assistant",
        href: "/dashboard/assistant",
        icon: MessageSquare,
        description: "24/7 AI chatbot",
        color: "text-blue-500",
      },
      {
        name: "Marketing",
        href: "/dashboard/marketing",
        icon: FileEdit,
        description: "Content generator",
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
        description: "AI roleplay practice",
        color: "text-pink-500",
      },
    ],
  },
  {
    title: "Integrations",
    defaultOpen: false,
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
    title: "Data Management",
    defaultOpen: false,
    items: [
      {
        name: "Communities",
        href: "/dashboard/communities",
        icon: Building2,
        description: "Manage your communities",
      },
      {
        name: "Floorplans",
        href: "/dashboard/floorplans",
        icon: Home,
        description: "Your floorplan catalog",
      },
      {
        name: "Inventory Homes",
        href: "/dashboard/inventory",
        icon: Package,
        description: "Move-in ready homes",
        isNew: true,
        color: "text-orange-500",
      },
      {
        name: "Incentives",
        href: "/dashboard/incentives",
        icon: Gift,
        description: "Promotions & offers",
        isNew: true,
        color: "text-pink-500",
      },
      {
        name: "Leads",
        href: "/dashboard/leads",
        icon: Users,
        description: "Lead management",
      },
      {
        name: "Competitors",
        href: "/dashboard/competitors",
        icon: Target,
        description: "Track competitors",
      },
    ],
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(() => {
    // Start with sections that are not defaultOpen collapsed
    const collapsed = new Set<string>();
    navSections.forEach((section) => {
      if (!section.defaultOpen) {
        collapsed.add(section.title);
      }
    });
    return collapsed;
  });

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
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Builder AI
          </span>
          <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
            AI-Powered Tools
          </p>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-4 pb-2">
        <Link href="/dashboard/research/footprint">
          <Button className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 text-sm h-10">
            <Zap className="h-4 w-4" />
            Start AI Research
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {navSections.map((section, sectionIndex) => {
          const isCollapsed = collapsedSections.has(section.title);

          return (
            <div key={section.title} className={cn(sectionIndex > 0 && "mt-4")}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
              >
                {section.title}
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    !isCollapsed && "rotate-90"
                  )}
                />
              </button>

              <div
                className={cn(
                  "mt-1 space-y-0.5 overflow-hidden transition-all duration-200",
                  isCollapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
                )}
              >
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                        isActive
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150",
                          isActive
                            ? "bg-blue-100"
                            : "bg-gray-100 group-hover:bg-gray-200"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 transition-colors",
                            isActive
                              ? "text-blue-600"
                              : item.color || "text-gray-500 group-hover:text-gray-700"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium truncate",
                            isActive ? "text-blue-700" : "text-gray-700"
                          )}>
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className={cn(
                              "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white bg-gradient-to-r",
                              item.badgeColor || "from-blue-500 to-purple-500"
                            )}>
                              {item.badge}
                            </span>
                          )}
                          {item.isNew && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                              NEW
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <span
                            className={cn(
                              "text-[11px] truncate block leading-tight mt-0.5",
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
            </div>
          );
        })}
      </nav>

      {/* Help & Support */}
      <div className="border-t border-gray-100 px-3 py-2">
        <Link
          href="/dashboard/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help & Support</span>
        </Link>
      </div>

      {/* User Menu */}
      <div className="border-t border-gray-200 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2 py-5 hover:bg-gray-50 rounded-lg"
            >
              <Avatar className="h-9 w-9 border-2 border-gray-100 shadow-sm">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="text-sm font-semibold text-gray-900 truncate max-w-[140px]">
                  {user?.name || "User"}
                </span>
                <span className="text-[11px] text-gray-400 truncate max-w-[140px]">
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
                Account Settings
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
