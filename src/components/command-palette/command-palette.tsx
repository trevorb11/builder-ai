"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  LayoutGrid,
  Building2,
  Home,
  Package,
  Users,
  BarChart3,
  MessageSquare,
  FileEdit,
  GraduationCap,
  Globe,
  Target,
  Lightbulb,
  Search,
  Link2,
  Settings,
  HelpCircle,
  Plus,
  ClipboardCheck,
  Sparkles,
  LogOut,
} from "lucide-react";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const navigationItems = [
  {
    group: "Getting Started",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutGrid, keywords: ["home", "overview"] },
      { name: "Setup Checklist", href: "/dashboard/onboarding", icon: ClipboardCheck, keywords: ["setup", "onboard", "getting started"] },
    ],
  },
  {
    group: "Your Business",
    items: [
      { name: "Communities", href: "/dashboard/communities", icon: Building2, keywords: ["neighborhoods", "locations"] },
      { name: "Floorplans", href: "/dashboard/floorplans", icon: Home, keywords: ["plans", "layouts", "designs"] },
      { name: "Inventory", href: "/dashboard/inventory", icon: Package, keywords: ["homes", "quick move-in", "spec", "available"] },
      { name: "Leads", href: "/dashboard/leads", icon: Users, keywords: ["prospects", "customers", "contacts"] },
      { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, keywords: ["metrics", "reports", "data"] },
    ],
  },
  {
    group: "AI Assistants",
    items: [
      { name: "Website Chatbot", href: "/dashboard/assistant", icon: MessageSquare, keywords: ["chat", "ai", "bot", "visitor"] },
      { name: "Marketing Writer", href: "/dashboard/marketing", icon: FileEdit, keywords: ["content", "copy", "blog", "social"] },
      { name: "Sales Coach", href: "/dashboard/training", icon: GraduationCap, keywords: ["training", "practice", "role play"] },
    ],
  },
  {
    group: "Research & SEO",
    items: [
      { name: "Online Presence", href: "/dashboard/research/footprint", icon: Globe, keywords: ["footprint", "reputation", "reviews"] },
      { name: "Competitor Watch", href: "/dashboard/research/competitors", icon: Target, keywords: ["competition", "market"] },
      { name: "Content Ideas", href: "/dashboard/research/content", icon: Lightbulb, keywords: ["topics", "blog ideas", "inspiration"] },
      { name: "SEO Tools", href: "/dashboard/seo", icon: Search, keywords: ["google", "search", "keywords", "ranking"] },
    ],
  },
  {
    group: "Connections",
    items: [
      { name: "CRM Sync", href: "/dashboard/crm", icon: Link2, keywords: ["hubspot", "salesforce", "integration"] },
      { name: "Realtor Portal", href: "/dashboard/realtors", icon: Users, keywords: ["agents", "brokers", "partners"] },
    ],
  },
  {
    group: "Settings",
    items: [
      { name: "Settings", href: "/dashboard/settings", icon: Settings, keywords: ["preferences", "account", "profile"] },
      { name: "Help & Support", href: "/dashboard/help", icon: HelpCircle, keywords: ["faq", "documentation", "contact"] },
    ],
  },
];

const quickActions = [
  { name: "Add New Community", href: "/dashboard/communities?action=new", icon: Building2, shortcut: "C" },
  { name: "Add New Floorplan", href: "/dashboard/floorplans?action=new", icon: Home, shortcut: "F" },
  { name: "Add Inventory Home", href: "/dashboard/inventory?action=new", icon: Package, shortcut: "I" },
  { name: "Add New Lead", href: "/dashboard/leads?action=new", icon: Users, shortcut: "L" },
  { name: "Generate Marketing Content", href: "/dashboard/marketing", icon: Sparkles, shortcut: "M" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, setOpen]);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, [setOpen]);

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
            <CommandItem
              key={action.name}
              value={action.name}
              onSelect={() => runCommand(() => router.push(action.href))}
            >
              <Plus className="mr-2 h-4 w-4" />
              <action.icon className="mr-2 h-4 w-4 text-gray-500" />
              <span>{action.name}</span>
              <CommandShortcut>⌘{action.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation Sections */}
        {navigationItems.map((group) => (
          <CommandGroup key={group.group} heading={group.group}>
            {group.items.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.name} ${item.keywords?.join(" ")}`}
                onSelect={() => runCommand(() => router.push(item.href))}
              >
                <item.icon className="mr-2 h-4 w-4 text-gray-500" />
                <span>{item.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />

        {/* Account Actions */}
        <CommandGroup heading="Account">
          <CommandItem
            value="sign out logout"
            onSelect={() => runCommand(() => router.push("/signout"))}
          >
            <LogOut className="mr-2 h-4 w-4 text-gray-500" />
            <span>Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
