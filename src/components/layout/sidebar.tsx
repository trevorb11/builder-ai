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
  ClipboardCheck,
  Menu,
  X,
  Plus,
  UserPlus,
  Package,
  Bot,
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
    title: "Getting Started",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutGrid,
        description: "Your home base",
      },
      {
        name: "Setup Checklist",
        href: "/dashboard/onboarding",
        icon: ClipboardCheck,
        description: "Complete your setup",
        color: "text-green-500",
      },
    ],
  },
  {
    title: "Your Business",
    items: [
      {
        name: "Communities",
        href: "/dashboard/communities",
        icon: Building2,
        description: "Manage neighborhoods",
      },
      {
        name: "Floorplans",
        href: "/dashboard/floorplans",
        icon: Home,
        description: "Home designs",
      },
      {
        name: "Inventory",
        href: "/dashboard/inventory",
        icon: Package,
        description: "Quick move-in homes",
        color: "text-orange-500",
      },
      {
        name: "Leads",
        href: "/dashboard/leads",
        icon: Users,
        description: "Potential buyers",
      },
      {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        description: "Performance insights",
      },
    ],
  },
  {
    title: "AI Assistants",
    items: [
      {
        name: "Website Chatbot",
        href: "/dashboard/assistant",
        icon: MessageSquare,
        description: "Chat with visitors",
        badge: "AI",
        color: "text-blue-500",
      },
      {
        name: "Marketing Writer",
        href: "/dashboard/marketing",
        icon: FileEdit,
        description: "Create content",
        badge: "AI",
        color: "text-violet-500",
      },
      {
        name: "Sales Coach",
        href: "/dashboard/training",
        icon: GraduationCap,
        description: "Practice selling",
        badge: "AI",
        color: "text-pink-500",
      },
    ],
  },
  {
    title: "Research & SEO",
    items: [
      {
        name: "Online Presence",
        href: "/dashboard/research/footprint",
        icon: Globe,
        description: "Your digital footprint",
        badge: "AI",
        color: "text-teal-500",
      },
      {
        name: "AI Readiness",
        href: "/dashboard/research/ai-readiness",
        icon: Bot,
        description: "ChatGPT & AI visibility",
        badge: "AI",
        color: "text-purple-500",
      },
      {
        name: "Competitor Watch",
        href: "/dashboard/research/competitors",
        icon: Target,
        description: "Track competitors",
        badge: "AI",
        color: "text-amber-500",
      },
      {
        name: "Content Ideas",
        href: "/dashboard/research/content",
        icon: Lightbulb,
        description: "What to write about",
        badge: "AI",
        color: "text-purple-500",
      },
      {
        name: "SEO Tools",
        href: "/dashboard/seo",
        icon: Search,
        description: "Get found on Google",
        color: "text-emerald-500",
      },
    ],
  },
  {
    title: "Connections",
    items: [
      {
        name: "CRM Sync",
        href: "/dashboard/crm",
        icon: Link2,
        description: "HubSpot, Salesforce",
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
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSection = (title: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(title)) {
      newCollapsed.delete(title);
    } else {
      newCollapsed.add(title);
    }
    setCollapsedSections(newCollapsed);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-md">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-gray-900">Builder AI</span>
          <p className="text-xs text-gray-500">For Home Builders</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-gray-100">
        {/* Command Palette Hint */}
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", {
              key: "k",
              metaKey: true,
              bubbles: true,
            });
            document.dispatchEvent(event);
          }}
          className="w-full mb-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Quick search...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-300 bg-white px-1.5 text-[10px] font-medium text-gray-500">
            ⌘K
          </kbd>
        </button>
        <div className="flex gap-2">
          <Link href="/dashboard/communities/new" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Community
            </Button>
          </Link>
          <Link href="/dashboard/inventory" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
              <Package className="h-3.5 w-3.5" />
              Inventory
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navSections.map((section, sectionIndex) => {
          const isCollapsed = collapsedSections.has(section.title);

          return (
            <div key={section.title} className={cn(sectionIndex > 0 && "mt-5")}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors"
              >
                {section.title}
                <ChevronRight
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    !isCollapsed && "rotate-90"
                  )}
                />
              </button>

              {!isCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                          isActive
                            ? "bg-blue-50 text-blue-700 font-medium"
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
                            <span className="truncate">{item.name}</span>
                            {item.badge && (
                              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                {item.badge}
                              </span>
                            )}
                          </div>
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

      {/* Help & Settings */}
      <div className="border-t border-gray-100 px-3 py-2">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="h-5 w-5 text-gray-400" />
          <span>Settings</span>
        </Link>
        <Link
          href="/dashboard/help"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
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
                Company Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/signout"
                className="flex items-center gap-2 text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Builder AI</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed top-14 left-0 bottom-0 z-40 w-72 bg-white border-r border-gray-200 transform transition-transform duration-200",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full w-72 flex-col border-r border-gray-200 bg-white">
        <SidebarContent />
      </div>
    </>
  );
}
