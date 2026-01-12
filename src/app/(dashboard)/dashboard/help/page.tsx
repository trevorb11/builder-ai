import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Mail,
  Phone,
  BookOpen,
  Video,
  HelpCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const helpTopics = [
  {
    title: "Getting Started",
    description: "Learn the basics of setting up your Builder AI account",
    icon: BookOpen,
    href: "/dashboard/onboarding",
  },
  {
    title: "AI Chatbot Setup",
    description: "Configure your website chatbot to engage visitors",
    icon: MessageSquare,
    href: "/dashboard/assistant",
  },
  {
    title: "Adding Communities",
    description: "Add and manage your communities and floorplans",
    icon: Sparkles,
    href: "/dashboard/communities",
  },
];

const faqs = [
  {
    question: "How do I add a new community?",
    answer: "Go to Communities in the sidebar, then click 'Add Community'. Fill in your community details including name, location, and pricing.",
  },
  {
    question: "How does the AI chatbot work?",
    answer: "The AI chatbot uses your community and floorplan data to answer visitor questions on your website. Go to Website Chatbot to configure it.",
  },
  {
    question: "Can I connect my CRM?",
    answer: "Yes! We support HubSpot, Salesforce, and GoHighLevel. Go to CRM Sync in the sidebar to connect your account.",
  },
  {
    question: "How do I track competitor activity?",
    answer: "Use Competitor Watch in the Research & SEO section. Add your competitors and we'll help you monitor their activity.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
          <p className="mt-1 text-gray-500">
            Get help with Builder AI features and find answers to common questions
          </p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          {helpTopics.map((topic) => (
            <Link key={topic.title} href={topic.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <topic.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <h4 className="font-medium text-gray-900">{faq.question}</h4>
                  <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email Support</p>
                  <p className="text-sm text-gray-500">support@builderai.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Phone Support</p>
                  <p className="text-sm text-gray-500">(727) 555-1234</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
