import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  HelpCircle,
  MessageSquare,
  FileEdit,
  Search,
  Target,
  GraduationCap,
  Building2,
  Home,
  Gift,
  Package,
  Users,
  Globe,
  Lightbulb,
  PlayCircle,
  BookOpen,
  Mail,
  ExternalLink,
  ChevronRight,
  Zap,
} from "lucide-react";

const featureGuides = [
  {
    title: "AI Website Assistant",
    description: "Configure a 24/7 chatbot to capture leads and answer buyer questions",
    icon: MessageSquare,
    href: "/dashboard/assistant",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    steps: [
      "Navigate to Website Assistant",
      "Customize your chatbot appearance and welcome message",
      "Configure lead capture settings",
      "Copy the embed code to your website",
    ],
  },
  {
    title: "Deep Research",
    description: "Analyze your digital presence, competitors, and content opportunities",
    icon: Globe,
    href: "/dashboard/research/footprint",
    color: "text-teal-500",
    bgColor: "bg-teal-50",
    steps: [
      "Start with Digital Footprint analysis",
      "Add your website and social media URLs",
      "Run competitor research on key competitors",
      "Use Content Strategy for topic ideas",
    ],
  },
  {
    title: "Marketing Generator",
    description: "Create social posts, emails, and listings with AI",
    icon: FileEdit,
    href: "/dashboard/marketing",
    color: "text-violet-500",
    bgColor: "bg-violet-50",
    steps: [
      "Choose content type (social, email, blog, etc.)",
      "Select the community or floorplan to feature",
      "Generate and customize the content",
      "Save to your content library",
    ],
  },
  {
    title: "Sales Training",
    description: "Practice objection handling with AI roleplay",
    icon: GraduationCap,
    href: "/dashboard/training",
    color: "text-pink-500",
    bgColor: "bg-pink-50",
    steps: [
      "Choose a training scenario",
      "Select difficulty level",
      "Practice handling objections",
      "Review performance metrics",
    ],
  },
  {
    title: "Community Management",
    description: "Manage your communities, floorplans, and inventory",
    icon: Building2,
    href: "/dashboard/communities",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    steps: [
      "Add your active communities",
      "Add floorplans with specs and pricing",
      "Track inventory/move-in ready homes",
      "Manage incentives and promotions",
    ],
  },
  {
    title: "Lead Management",
    description: "Track and manage leads from your AI assistant",
    icon: Users,
    href: "/dashboard/leads",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    steps: [
      "View leads captured by AI",
      "Update lead status and notes",
      "Track lead scores",
      "Sync with your CRM",
    ],
  },
];

const quickLinks = [
  {
    title: "Add Your First Community",
    href: "/dashboard/communities",
    icon: Building2,
  },
  {
    title: "Configure AI Chatbot",
    href: "/dashboard/assistant",
    icon: MessageSquare,
  },
  {
    title: "Run Digital Footprint Analysis",
    href: "/dashboard/research/footprint",
    icon: Globe,
  },
  {
    title: "Generate Marketing Content",
    href: "/dashboard/marketing",
    icon: FileEdit,
  },
];

export default function HelpPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 p-2">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Help & Documentation
            </h1>
            <p className="text-gray-600">
              Learn how to use Builder AI to grow your home building business
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Section */}
      <Card className="mb-8 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Start Guide</h2>
              <p className="text-gray-600 mb-4">
                Get started in minutes by following these steps:
              </p>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span><strong>Add your communities</strong> - Enter your active communities with location and pricing info</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span><strong>Add floorplans</strong> - Include specs, features, and base pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span><strong>Configure AI Chatbot</strong> - Set up your website assistant to start capturing leads</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                  <span><strong>Run your first research</strong> - Analyze your digital footprint to find opportunities</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Icon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">{link.title}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Feature Guides */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Guides</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <Card key={guide.href} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-lg ${guide.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-5 w-5 ${guide.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{guide.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {guide.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-1.5 text-xs text-gray-600 mb-4">
                    {guide.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-400">{index + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <Link href={guide.href}>
                    <Button variant="outline" size="sm" className="w-full">
                      Go to {guide.title.split(" ")[0]}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tips for Home Builders */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Tips for Home Builders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Keep Inventory Updated</p>
                  <p className="text-xs text-gray-500">
                    Update move-in ready homes regularly. The AI chatbot uses this data to help buyers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Gift className="h-4 w-4 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Update Incentives Promptly</p>
                  <p className="text-xs text-gray-500">
                    Add new promotions as they launch. The AI highlights active incentives to buyers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Define Your Brand Voice</p>
                  <p className="text-xs text-gray-500">
                    Set brand voice guidelines in settings. The AI uses this for consistent content.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Track Competitors</p>
                  <p className="text-xs text-gray-500">
                    Add competitors to benchmark pricing and features against your offerings.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Search className="h-4 w-4 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Run Monthly Research</p>
                  <p className="text-xs text-gray-500">
                    Regular digital footprint analysis helps track your online presence growth.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Train Your Sales Team</p>
                  <p className="text-xs text-gray-500">
                    Have agents practice objection handling with AI roleplay before floor time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
          <CardDescription>
            Our team is here to help you get the most out of Builder AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="outline" className="gap-2">
              <PlayCircle className="h-4 w-4" />
              Watch Tutorials
            </Button>
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              View Documentation
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
