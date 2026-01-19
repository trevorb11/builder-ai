"use client";

import { useState } from "react";
import {
  Building2,
  MapPin,
  Home,
  DollarSign,
  Link2,
  Globe,
  Target,
  GraduationCap,
  Users,
  FileEdit,
  Rocket,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OnboardingProgress {
  companyName: boolean;
  contacts: boolean;
  websiteUrl: boolean;
  tagline: boolean;
  buyerPersonas: boolean;
  marketsServed: boolean;
  differentiators: boolean;
  brandAssets: boolean;
  communitiesAdded: boolean;
  floorplansAdded: boolean;
  incentivesAdded: boolean;
  coopCommission: boolean;
  preferredLender: boolean;
  pricingContacts: boolean;
  inventoryAdded: boolean;
  crmConnected: boolean;
  leadFlowSetup: boolean;
  salesTeamAdded: boolean;
  websiteAccess: boolean;
  analyticsAccess: boolean;
  chatbotPlacement: boolean;
  competitorsAdded: boolean;
  salesAgentsAdded: boolean;
  trainingAssets: boolean;
  realtorDatabase: boolean;
  realtorAssets: boolean;
  socialHandles: boolean;
  emailPlatform: boolean;
  contentPrefs: boolean;
  approvalContacts: boolean;
  launchDate: boolean;
  overallProgress: number;
}

interface OnboardingChecklistProps {
  organizationId: string;
  organizationName: string;
  initialProgress: OnboardingProgress;
}

interface ChecklistItem {
  key: keyof OnboardingProgress;
  label: string;
  description: string;
  required?: boolean;
  link?: string;
  linkLabel?: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  description: string;
  items: ChecklistItem[];
  optional?: boolean;
}

// Auto-detected keys that update based on database state
const autoDetectedKeys = new Set([
  "companyName", "contacts", "websiteUrl", "marketsServed", "brandAssets",
  "communitiesAdded", "floorplansAdded", "incentivesAdded", "inventoryAdded",
  "crmConnected", "chatbotPlacement", "competitorsAdded", "realtorDatabase", "socialHandles"
]);

const sections: ChecklistSection[] = [
  {
    id: "company",
    title: "Company & Brand Basics",
    icon: Building2,
    color: "text-blue-500",
    description: "Set up your company profile and brand identity",
    items: [
      { key: "companyName", label: "Company name", description: "Your builder company name", required: true, link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "contacts", label: "Primary contacts", description: "Name, email, phone for main contacts", link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "websiteUrl", label: "Website URL", description: "Your company website address", required: true, link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "tagline", label: "Tagline / slogan", description: "Your brand tagline or slogan", link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "buyerPersonas", label: "Target buyer personas", description: "Who are your ideal home buyers?", link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "marketsServed", label: "Geographic markets", description: "Cities and regions you build in", required: true, link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "differentiators", label: "Key differentiators", description: "What makes you different from competitors?", link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "brandAssets", label: "Brand assets", description: "Logo, colors, fonts, voice/tone guidance", link: "/dashboard/settings/organization", linkLabel: "Upload" },
    ],
  },
  {
    id: "communities",
    title: "Community Info",
    icon: MapPin,
    color: "text-green-500",
    description: "Add all your active and upcoming communities",
    items: [
      { key: "communitiesAdded", label: "Communities added", description: "Add all your communities with details, amenities, school info, etc.", required: true, link: "/dashboard/communities", linkLabel: "Manage Communities" },
    ],
  },
  {
    id: "floorplans",
    title: "Floorplan Data",
    icon: Home,
    color: "text-purple-500",
    description: "Upload your floorplan catalog with specs and pricing",
    items: [
      { key: "floorplansAdded", label: "Floorplans added", description: "Name, sqft, beds/baths, base price, features, elevations", required: true, link: "/dashboard/floorplans", linkLabel: "Manage Floorplans" },
    ],
  },
  {
    id: "pricing",
    title: "Pricing & Incentives",
    icon: DollarSign,
    color: "text-amber-500",
    description: "Configure incentives, commissions, and inventory homes",
    items: [
      { key: "incentivesAdded", label: "Current incentives", description: "Active promotions, closing cost specials, upgrade packages", required: true, link: "/dashboard/communities", linkLabel: "Manage Incentives" },
      { key: "coopCommission", label: "Co-op commission structure", description: "Realtor commission rates and terms", required: true, link: "/dashboard/realtors", linkLabel: "Configure" },
      { key: "preferredLender", label: "Preferred lender info", description: "Lender name and contact details", link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "pricingContacts", label: "Pricing update contacts", description: "Who to contact for pricing changes", required: true, link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "inventoryAdded", label: "Quick move-in inventory", description: "Available inventory homes with pricing and move-in dates", link: "/dashboard/inventory", linkLabel: "Manage Inventory" },
    ],
  },
  {
    id: "crm",
    title: "CRM + Systems Access",
    icon: Link2,
    color: "text-cyan-500",
    description: "Connect your CRM and set up lead workflows",
    items: [
      { key: "crmConnected", label: "CRM connected", description: "HubSpot, Salesforce, or GoHighLevel", required: true, link: "/dashboard/crm", linkLabel: "Connect CRM" },
      { key: "leadFlowSetup", label: "Lead flow configured", description: "How leads should flow from AI to your team", link: "/dashboard/crm", linkLabel: "Configure" },
      { key: "salesTeamAdded", label: "Sales team contacts", description: "List of sales agents with contact info", link: "/dashboard/settings/organization", linkLabel: "Edit" },
    ],
  },
  {
    id: "website",
    title: "Website + Technical Access",
    icon: Globe,
    color: "text-teal-500",
    description: "Provide access for chatbot installation and analytics",
    items: [
      { key: "websiteAccess", label: "Website admin access", description: "Login or invite for website management", required: true, link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "analyticsAccess", label: "Analytics access", description: "Google Analytics, GTM, Search Console access", link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "chatbotPlacement", label: "Chatbot configured", description: "Configure and deploy your website chatbot", link: "/dashboard/assistant", linkLabel: "Configure Chatbot" },
    ],
  },
  {
    id: "competitive",
    title: "Competitive Intelligence",
    icon: Target,
    color: "text-red-500",
    description: "Track your competitors and market positioning",
    items: [
      { key: "competitorsAdded", label: "Competitors added", description: "Names and websites of key competitors", link: "/dashboard/research/competitors", linkLabel: "Add Competitors" },
    ],
  },
  {
    id: "sales",
    title: "Sales Training AI",
    icon: GraduationCap,
    color: "text-pink-500",
    description: "Set up AI-powered sales training and coaching",
    optional: true,
    items: [
      { key: "salesAgentsAdded", label: "Sales agents registered", description: "Number of agents who will use training", link: "/dashboard/training", linkLabel: "Start Training" },
      { key: "trainingAssets", label: "Training assets uploaded", description: "Call recordings, scripts, objection handling docs", link: "/dashboard/training", linkLabel: "Upload" },
    ],
  },
  {
    id: "realtor",
    title: "Realtor Portal",
    icon: Users,
    color: "text-indigo-500",
    description: "Configure the realtor-facing portal and resources",
    optional: true,
    items: [
      { key: "realtorDatabase", label: "Realtor database", description: "List of realtors with contact info", link: "/dashboard/realtors", linkLabel: "Manage Realtors" },
      { key: "realtorAssets", label: "Realtor assets", description: "Co-op flyers, materials, event info", link: "/dashboard/realtors", linkLabel: "Upload" },
    ],
  },
  {
    id: "marketing",
    title: "Content + Marketing",
    icon: FileEdit,
    color: "text-violet-500",
    description: "Set up AI-powered content generation preferences",
    items: [
      { key: "socialHandles", label: "Social media handles", description: "Facebook, Instagram, LinkedIn URLs", link: "/dashboard/research/footprint", linkLabel: "Configure" },
      { key: "emailPlatform", label: "Email platform", description: "Mailchimp, Constant Contact, etc.", link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "contentPrefs", label: "Content preferences", description: "Posting frequency, style examples", link: "/dashboard/marketing", linkLabel: "Set Preferences" },
    ],
  },
  {
    id: "launch",
    title: "Approvals + Launch",
    icon: Rocket,
    color: "text-orange-500",
    description: "Define approval workflow and target launch date",
    items: [
      { key: "approvalContacts", label: "Approval contacts", description: "Who approves chatbot and marketing content?", required: true, link: "/dashboard/settings/organization", linkLabel: "Edit" },
      { key: "launchDate", label: "Target launch date", description: "When do you want to go live?", link: "/dashboard/settings/organization", linkLabel: "Set Date" },
    ],
  },
];

export function OnboardingChecklist({ organizationId, organizationName, initialProgress }: OnboardingChecklistProps) {
  const [progress, setProgress] = useState<OnboardingProgress>(initialProgress);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["company"]));
  const [saving, setSaving] = useState(false);

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const toggleItem = async (key: keyof OnboardingProgress) => {
    if (key === "overallProgress") return;

    // Don't allow toggling auto-detected items - they sync automatically
    if (autoDetectedKeys.has(key)) {
      return;
    }

    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);

    setSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, ...newProgress }),
      });
    } catch (error) {
      console.error("Failed to save progress:", error);
    } finally {
      setSaving(false);
    }
  };

  const isAutoDetected = (key: keyof OnboardingProgress) => autoDetectedKeys.has(key);

  const calculateSectionProgress = (section: ChecklistSection) => {
    const completed = section.items.filter(item => progress[item.key]).length;
    return { completed, total: section.items.length };
  };

  const calculateOverallProgress = () => {
    let completed = 0;
    let total = 0;
    sections.forEach(section => {
      section.items.forEach(item => {
        total++;
        if (progress[item.key]) completed++;
      });
    });
    return Math.round((completed / total) * 100);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Overall Progress</h2>
            <p className="text-sm text-gray-500">{organizationName}</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-gray-900">{overallProgress}%</span>
            <p className="text-sm text-gray-500">Complete</p>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        {saving && (
          <p className="text-xs text-gray-400 mt-2">Saving...</p>
        )}
      </div>

      <div className="space-y-4">
        {sections.map((section) => {
          const { completed, total } = calculateSectionProgress(section);
          const isExpanded = expandedSections.has(section.id);
          const isComplete = completed === total;

          return (
            <div
              key={section.id}
              className={cn(
                "rounded-xl border bg-white overflow-hidden transition-all",
                isComplete ? "border-green-200" : "border-gray-200"
              )}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className={cn("p-2 rounded-lg", isComplete ? "bg-green-100" : "bg-gray-100")}>
                  <section.icon className={cn("h-5 w-5", isComplete ? "text-green-600" : section.color)} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{section.title}</h3>
                    {section.optional && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Optional</span>
                    )}
                    {isComplete && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-sm font-medium",
                    isComplete ? "text-green-600" : "text-gray-500"
                  )}>
                    {completed}/{total}
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                  {section.items.map((item) => {
                    const isChecked = progress[item.key];
                    const isAuto = isAutoDetected(item.key);

                    return (
                      <div
                        key={item.key}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg transition-colors",
                          isChecked ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                        )}
                      >
                        <button
                          onClick={() => toggleItem(item.key)}
                          disabled={isAuto}
                          className={cn(
                            "mt-0.5 flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                            isChecked
                              ? "bg-green-500 border-green-500"
                              : "border-gray-300",
                            !isAuto && !isChecked && "hover:border-gray-400 cursor-pointer",
                            isAuto && "cursor-default"
                          )}
                          title={isAuto ? "Auto-detected from your data" : "Click to mark complete"}
                        >
                          {isChecked && <Check className="h-3 w-3 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium",
                              isChecked ? "text-green-700" : "text-gray-900"
                            )}>
                              {item.label}
                            </span>
                            {item.required && (
                              <span className="text-xs text-red-500 font-medium">Required</span>
                            )}
                            {isAuto && (
                              <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                Auto-sync
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        {item.link && (
                          <Link href={item.link}>
                            <Button
                              variant={isChecked ? "outline" : "default"}
                              size="sm"
                              className={cn(!isChecked && "bg-blue-600 hover:bg-blue-700")}
                            >
                              {item.linkLabel || "Go"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Need help?</h3>
            <p className="text-sm text-blue-700 mt-1">
              Items marked with * are required for the AI tools to work effectively. 
              Click the links next to each item to quickly navigate to the relevant section and add your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
