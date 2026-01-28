"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  FileText,
  Download,
  ArrowLeft,
  Building2,
  Home,
  TrendingUp,
  Target,
  Users,
  MapPin,
  DollarSign,
  BarChart3,
  MessageSquare,
  Shield,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface DeepDiveData {
  id: string;
  generatedAt: string;
  yourCompany: string;
  competitorName: string;
  executiveSummary: string;
  marketPositioning: {
    yourPosition: string;
    theirPosition: string;
    overlap: string;
    differentiationOpportunities: string[];
  };
  pricingAnalysis: {
    summary: string;
    yourPriceRange: string;
    theirPriceRange: string;
    valueProposition: string;
    recommendations: string[];
  };
  productComparison: {
    summary: string;
    yourStrengths: string[];
    theirStrengths: string[];
    gapAnalysis: string;
    productRecommendations: string[];
  };
  communityAnalysis: {
    summary: string;
    locationComparison: string;
    amenitiesComparison: string;
    targetDemographics: string;
  };
  salesStrategy: {
    keyObjections: { objection: string; response: string }[];
    winningScenarios: string[];
    competitiveAdvantages: string[];
    warningSignals: string[];
  };
  marketingRecommendations: {
    messagingGuidelines: string[];
    contentIdeas: string[];
    differentiatorHighlights: string[];
  };
  actionItems: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

interface CompetitorDeepDiveProps {
  analysisId: string;
  onBack: () => void;
}

export function CompetitorDeepDive({ analysisId, onBack }: CompetitorDeepDiveProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [deepDive, setDeepDive] = useState<DeepDiveData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeepDive() {
      try {
        const response = await fetch(`/api/competitors/deep-dive/${analysisId}`);
        if (response.ok) {
          const data = await response.json();
          setDeepDive(data);
        } else {
          setError("Failed to load analysis");
        }
      } catch (err) {
        setError("Failed to load analysis");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDeepDive();
  }, [analysisId]);

  function handleDownload() {
    if (!deepDive) return;

    const content = generateTextReport(deepDive);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `competitor-analysis-${deepDive.competitorName.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function generateTextReport(data: DeepDiveData): string {
    let report = `COMPETITIVE ANALYSIS REPORT\n`;
    report += `${"=".repeat(50)}\n\n`;
    report += `${data.yourCompany} vs ${data.competitorName}\n`;
    report += `Generated: ${formatDateTime(new Date(data.generatedAt))}\n\n`;

    report += `EXECUTIVE SUMMARY\n${"-".repeat(30)}\n${data.executiveSummary}\n\n`;

    report += `MARKET POSITIONING\n${"-".repeat(30)}\n`;
    report += `Your Position: ${data.marketPositioning.yourPosition}\n`;
    report += `Their Position: ${data.marketPositioning.theirPosition}\n`;
    report += `Market Overlap: ${data.marketPositioning.overlap}\n\n`;
    report += `Differentiation Opportunities:\n`;
    data.marketPositioning.differentiationOpportunities.forEach((opp, i) => {
      report += `  ${i + 1}. ${opp}\n`;
    });
    report += `\n`;

    report += `PRICING ANALYSIS\n${"-".repeat(30)}\n`;
    report += `${data.pricingAnalysis.summary}\n`;
    report += `Your Price Range: ${data.pricingAnalysis.yourPriceRange}\n`;
    report += `Their Price Range: ${data.pricingAnalysis.theirPriceRange}\n`;
    report += `Value Proposition: ${data.pricingAnalysis.valueProposition}\n\n`;

    report += `PRODUCT COMPARISON\n${"-".repeat(30)}\n`;
    report += `${data.productComparison.summary}\n\n`;
    report += `Your Strengths:\n`;
    data.productComparison.yourStrengths.forEach((s) => {
      report += `  - ${s}\n`;
    });
    report += `\nTheir Strengths:\n`;
    data.productComparison.theirStrengths.forEach((s) => {
      report += `  - ${s}\n`;
    });
    report += `\nGap Analysis: ${data.productComparison.gapAnalysis}\n\n`;

    report += `SALES STRATEGY\n${"-".repeat(30)}\n`;
    report += `\nKey Objections & Responses:\n`;
    data.salesStrategy.keyObjections.forEach((obj, i) => {
      report += `  ${i + 1}. Objection: ${obj.objection}\n`;
      report += `     Response: ${obj.response}\n\n`;
    });

    report += `Competitive Advantages:\n`;
    data.salesStrategy.competitiveAdvantages.forEach((adv) => {
      report += `  - ${adv}\n`;
    });

    report += `\nACTION ITEMS\n${"-".repeat(30)}\n`;
    report += `\nImmediate (This Week):\n`;
    data.actionItems.immediate.forEach((item) => {
      report += `  [ ] ${item}\n`;
    });
    report += `\nShort-Term (This Month):\n`;
    data.actionItems.shortTerm.forEach((item) => {
      report += `  [ ] ${item}\n`;
    });
    report += `\nLong-Term (This Quarter):\n`;
    data.actionItems.longTerm.forEach((item) => {
      report += `  [ ] ${item}\n`;
    });

    return report;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="mt-4 text-gray-500">Loading in-depth analysis...</p>
      </div>
    );
  }

  if (error || !deepDive) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <p className="mt-4 text-gray-600">{error || "Analysis not found"}</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Battle Cards
        </Button>
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 via-white to-blue-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-2">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-lg font-bold text-blue-700">{deepDive.yourCompany}</span>
            </div>
            <span className="text-2xl font-light text-gray-300">vs</span>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-orange-100 p-2">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-lg font-bold text-orange-700">{deepDive.competitorName}</span>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatDateTime(new Date(deepDive.generatedAt))}
          </Badge>
        </div>
      </div>

      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-white">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <FileText className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-gray-700 leading-relaxed">{deepDive.executiveSummary}</p>
        </CardContent>
      </Card>

      <Accordion type="multiple" className="space-y-4" defaultValue={["market", "pricing", "sales"]}>
        <AccordionItem value="market" className="rounded-lg border-2">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" />
              <span className="font-semibold">Market Positioning Analysis</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-700">Your Position</h4>
                <p className="text-sm text-gray-700">{deepDive.marketPositioning.yourPosition}</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4">
                <h4 className="mb-2 font-semibold text-orange-700">Their Position</h4>
                <p className="text-sm text-gray-700">{deepDive.marketPositioning.theirPosition}</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-semibold text-gray-700">Market Overlap</h4>
              <p className="text-sm text-gray-700">{deepDive.marketPositioning.overlap}</p>
            </div>
            <div className="mt-4">
              <h4 className="mb-2 font-semibold text-green-700">Differentiation Opportunities</h4>
              <div className="grid gap-2 md:grid-cols-2">
                {deepDive.marketPositioning.differentiationOpportunities.map((opp, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
                    <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <span className="text-sm text-gray-700">{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="pricing" className="rounded-lg border-2">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Pricing Analysis</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="mb-4 text-gray-700">{deepDive.pricingAnalysis.summary}</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <p className="text-sm text-gray-500">Your Price Range</p>
                <p className="mt-1 text-lg font-bold text-blue-700">
                  {deepDive.pricingAnalysis.yourPriceRange}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <p className="text-sm text-gray-500">Their Price Range</p>
                <p className="mt-1 text-lg font-bold text-orange-700">
                  {deepDive.pricingAnalysis.theirPriceRange}
                </p>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 text-center">
                <p className="text-sm text-gray-500">Value Proposition</p>
                <p className="mt-1 text-sm font-medium text-purple-700">
                  {deepDive.pricingAnalysis.valueProposition}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="mb-2 font-semibold text-gray-700">Pricing Recommendations</h4>
              <ul className="space-y-2">
                {deepDive.pricingAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="product" className="rounded-lg border-2">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Product Comparison</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="mb-4 text-gray-700">{deepDive.productComparison.summary}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-semibold text-blue-700">Your Strengths</h4>
                <ul className="space-y-1">
                  {deepDive.productComparison.yourStrengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h4 className="mb-2 font-semibold text-orange-700">Their Strengths</h4>
                <ul className="space-y-1">
                  {deepDive.productComparison.theirStrengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-amber-50 p-4">
              <h4 className="mb-2 font-semibold text-amber-700">Gap Analysis</h4>
              <p className="text-sm text-gray-700">{deepDive.productComparison.gapAnalysis}</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="community" className="rounded-lg border-2">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <span className="font-semibold">Community Analysis</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="mb-4 text-gray-700">{deepDive.communityAnalysis.summary}</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-500">Location Comparison</h4>
                <p className="text-sm text-gray-700">{deepDive.communityAnalysis.locationComparison}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-500">Amenities</h4>
                <p className="text-sm text-gray-700">{deepDive.communityAnalysis.amenitiesComparison}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-500">Target Demographics</h4>
                <p className="text-sm text-gray-700">{deepDive.communityAnalysis.targetDemographics}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sales" className="rounded-lg border-2 border-green-200">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <span className="font-semibold">Sales Strategy & Objection Handling</span>
              <Badge className="ml-2 bg-green-500">Key Section</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 font-semibold text-gray-700">Key Objections & Responses</h4>
                <div className="space-y-3">
                  {deepDive.salesStrategy.keyObjections.map((obj, i) => (
                    <div key={i} className="rounded-lg border bg-white p-4">
                      <div className="mb-2 flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                        <span className="font-medium text-gray-800">
                          Objection: &quot;{obj.objection}&quot;
                        </span>
                      </div>
                      <div className="ml-6 flex items-start gap-2 rounded-lg bg-green-50 p-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700">{obj.response}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-green-50 p-4">
                  <h4 className="mb-2 font-semibold text-green-700">Competitive Advantages</h4>
                  <ul className="space-y-2">
                    {deepDive.salesStrategy.competitiveAdvantages.map((adv, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                        {adv}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-amber-50 p-4">
                  <h4 className="mb-2 font-semibold text-amber-700">Warning Signals</h4>
                  <ul className="space-y-2">
                    {deepDive.salesStrategy.warningSignals.map((sig, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                        {sig}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="marketing" className="rounded-lg border-2">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <span className="font-semibold">Marketing Recommendations</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-semibold text-gray-700">Messaging Guidelines</h4>
                <ul className="space-y-2">
                  {deepDive.marketingRecommendations.messagingGuidelines.map((msg, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-lg bg-purple-50 p-3 text-sm">
                      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs text-white">
                        {i + 1}
                      </span>
                      {msg}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-gray-700">Content Ideas</h4>
                <div className="flex flex-wrap gap-2">
                  {deepDive.marketingRecommendations.contentIdeas.map((idea, i) => (
                    <Badge key={i} variant="outline" className="border-purple-200 bg-purple-50">
                      {idea}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="actions" className="rounded-lg border-2 border-blue-200">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              <span className="font-semibold">Action Items</span>
              <Badge className="ml-2 bg-blue-500">Prioritized</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-red-700">
                  <Clock className="h-4 w-4" />
                  Immediate (This Week)
                </h4>
                <ul className="space-y-2">
                  {deepDive.actionItems.immediate.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-2 border-red-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-amber-700">
                  <Clock className="h-4 w-4" />
                  Short-Term (This Month)
                </h4>
                <ul className="space-y-2">
                  {deepDive.actionItems.shortTerm.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-2 border-amber-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-green-700">
                  <Clock className="h-4 w-4" />
                  Long-Term (This Quarter)
                </h4>
                <ul className="space-y-2">
                  {deepDive.actionItems.longTerm.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-2 border-green-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-center gap-4 pt-4">
        <Button onClick={handleDownload} className="gap-2 bg-gradient-to-r from-orange-500 to-red-500">
          <Download className="h-4 w-4" />
          Download Full Report
        </Button>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Battle Cards
        </Button>
      </div>
    </div>
  );
}
