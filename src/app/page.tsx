import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  FileEdit,
  Search,
  Target,
  GraduationCap,
  Link2,
  Users,
  ArrowRight,
  Building2,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Website AI Assistant",
    description:
      "Custom AI chatbot trained on your floorplans, communities, and incentives. Captures leads 24/7.",
  },
  {
    icon: FileEdit,
    title: "Marketing Assistant",
    description:
      "Generate social posts, emails, listings, and ad copy using your actual product data.",
  },
  {
    icon: Search,
    title: "AI Search Optimization",
    description:
      "Restructure content for ChatGPT, Gemini, and Perplexity discoverability.",
  },
  {
    icon: Target,
    title: "Competitive Intelligence",
    description:
      "Track competitor pricing, floorplans, and incentives with AI-powered analysis.",
  },
  {
    icon: GraduationCap,
    title: "Sales Trainer AI",
    description:
      "Practice objection handling with AI roleplay trained on your products.",
  },
  {
    icon: Link2,
    title: "CRM Integration",
    description:
      "Deep integration with HubSpot, Salesforce, and GoHighLevel.",
  },
  {
    icon: Users,
    title: "Realtor Portal",
    description:
      "Searchable tool for agents to find inventory, compare communities, and check incentives.",
  },
];

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              B
            </div>
            <span className="text-lg font-semibold text-gray-900">Builder AI</span>
          </div>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            AI-Powered Tools for
            <span className="text-blue-600"> Home Builders</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Convert more buyers, train your sales team, outsmart competition, and
            integrate seamlessly with your CRM. Custom AI that understands
            floorplans, elevations, incentives, and how builder sales actually work.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Complete Suite of AI Tools
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
          Everything you need to leverage AI for your homebuilding business
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Ready to Transform Your Builder Business?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            Join builders who are already using AI to sell more homes, create
            content faster, and work smarter.
          </p>
          <div className="mt-10">
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 bg-white text-blue-600 hover:bg-blue-50"
              >
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">
                Builder AI
              </span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; 2025 Builder AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
