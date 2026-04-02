import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FAQGenerator } from "@/components/seo/faq-generator";
import { FAQList } from "@/components/seo/faq-list";
import { SchemaGenerator } from "@/components/seo/schema-generator";
import { AISearchMonitor } from "@/components/seo/ai-search-monitor";
import {
  Search,
  HelpCircle,
  Code,
  Eye,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

async function getSEOData(organizationId: string) {
  const [faqs, communities, aiMonitor, organization] = await Promise.all([
    prisma.fAQSection.findMany({
      where: { organizationId },
      include: { community: { select: { name: true } } },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.community.findMany({
      where: { organizationId, status: "active" },
      select: { id: true, name: true },
    }),
    prisma.aISearchMonitor.findMany({
      where: { organizationId },
      orderBy: { checkedAt: "desc" },
      take: 20,
    }),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, website: true, description: true },
    }),
  ]);

  const faqsByCategory = faqs.reduce(
    (acc, faq) => {
      const category = faq.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(faq);
      return acc;
    },
    {} as Record<string, typeof faqs>
  );

  return { faqs, faqsByCategory, communities, aiMonitor, organization };
}

export default async function SEOPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to access SEO tools.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { faqs, faqsByCategory, communities, aiMonitor, organization } =
    await getSEOData(organizationId);

  const categories = Object.keys(faqsByCategory);
  const totalFaqs = faqs.length;
  const activeFaqs = faqs.filter((f) => f.isActive).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex-shrink-0 rounded-lg bg-green-500 p-2">
            <Search className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              AI Search Optimization
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Optimize your content for AI tools like ChatGPT, Gemini, and Perplexity
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total FAQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFaqs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active FAQs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{activeFaqs}</div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              AI Mentions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {aiMonitor.filter((m) => m.mentions).length}
              </div>
              <Badge variant="success">Tracked</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="faqs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="faqs" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ Management
          </TabsTrigger>
          <TabsTrigger value="generator" className="gap-2">
            <Search className="h-4 w-4" />
            AI FAQ Generator
          </TabsTrigger>
          <TabsTrigger value="schema" className="gap-2">
            <Code className="h-4 w-4" />
            Schema Markup
          </TabsTrigger>
          <TabsTrigger value="monitor" className="gap-2">
            <Eye className="h-4 w-4" />
            AI Search Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Library</CardTitle>
              <CardDescription>
                Manage your FAQs for AI search optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FAQList
                faqsByCategory={faqsByCategory}
                categories={categories}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator">
          <Card>
            <CardHeader>
              <CardTitle>Generate FAQs with AI</CardTitle>
              <CardDescription>
                Automatically generate comprehensive FAQs based on your builder data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FAQGenerator
                organizationId={organizationId}
                communities={communities}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema">
          <Card>
            <CardHeader>
              <CardTitle>Schema Markup Generator</CardTitle>
              <CardDescription>
                Generate structured data for better AI and search engine understanding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaGenerator
                organization={organization}
                faqs={faqs}
                organizationId={organizationId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitor">
          <Card>
            <CardHeader>
              <CardTitle>AI Search Monitoring</CardTitle>
              <CardDescription>
                Track what AI tools say about your builder in their responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AISearchMonitor
                results={aiMonitor}
                organizationId={organizationId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
