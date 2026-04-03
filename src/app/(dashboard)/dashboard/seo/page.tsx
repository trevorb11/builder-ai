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
              SEO & AI Discoverability
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Get found on Google and AI tools like ChatGPT, Gemini, and Perplexity
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
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
      <Tabs defaultValue="monitor" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto h-auto gap-1 p-1">
          <TabsTrigger value="monitor" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">AI Monitoring</span>
            <span className="sm:hidden">Monitor</span>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">FAQ Library</span>
            <span className="sm:hidden">FAQs</span>
            {totalFaqs > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{totalFaqs}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="generator" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Generate FAQs</span>
            <span className="sm:hidden">Generate</span>
          </TabsTrigger>
          <TabsTrigger value="schema" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <Code className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Schema Markup</span>
            <span className="sm:hidden">Schema</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor">
          <Card>
            <CardHeader>
              <CardTitle>AI Search Monitoring</CardTitle>
              <CardDescription>
                Track how ChatGPT, Gemini, and Perplexity mention your builder in their responses
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

        <TabsContent value="faqs">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Library</CardTitle>
              <CardDescription>
                FAQs help both Google and AI tools understand your business. Q&A format content is more likely to be cited by AI search.
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
                Auto-generate FAQs from your community and floorplan data. Q&A content improves both traditional SEO and AI discoverability.
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
              <CardTitle>Schema Markup</CardTitle>
              <CardDescription>
                Structured data helps Google and AI tools understand your content. Add this to your website for better visibility.
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
      </Tabs>
    </div>
  );
}
