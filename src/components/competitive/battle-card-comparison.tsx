"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  Loader2,
  Sparkles,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  Home,
  DollarSign,
  Ruler,
  Users,
  Shield,
  Zap,
  FileText,
  Download,
  ChevronRight,
} from "lucide-react";

interface Competitor {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  markets: string | null;
  communities: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    priceRange: string | null;
    startingPrice: number | null;
    floorplans: {
      id: string;
      name: string;
      bedrooms: number | null;
      bathrooms: number | null;
      squareFeet: number | null;
      price: number | null;
    }[];
  }[];
}

interface Organization {
  name: string;
  tagline: string | null;
  differentiators: string | null;
}

interface BattleCardComparisonProps {
  competitors: Competitor[];
  organization: Organization;
  organizationId: string;
  onViewDeepDive: (analysisId: string) => void;
}

interface BattleCardData {
  id: string;
  generatedAt: string;
  yourCompany: {
    name: string;
    strengths: string[];
    avgPrice: number;
    avgSqFt: number;
    pricePerSqFt: number;
  };
  competitor: {
    name: string;
    strengths: string[];
    avgPrice: number;
    avgSqFt: number;
    pricePerSqFt: number;
  };
  comparison: {
    priceAdvantage: "you" | "them" | "tie";
    valueAdvantage: "you" | "them" | "tie";
    sizeAdvantage: "you" | "them" | "tie";
  };
  winningPoints: string[];
  watchOutFor: string[];
  recommendedTalkingPoints: string[];
  summary: string;
}

export function BattleCardComparison({
  competitors,
  organization,
  organizationId,
  onViewDeepDive,
}: BattleCardComparisonProps) {
  const [selectedCompetitor, setSelectedCompetitor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [battleCard, setBattleCard] = useState<BattleCardData | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerateBattleCard() {
    if (!selectedCompetitor) return;

    setIsLoading(true);
    setBattleCard(null);
    setError(null);

    try {
      const response = await fetch("/api/competitors/battle-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          competitorId: selectedCompetitor,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setBattleCard(data.battleCard);
        setAnalysisId(data.analysisId);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "Failed to generate battle card. Please try again.");
      }
    } catch (err) {
      console.error("Error generating battle card:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function getAdvantageIcon(advantage: "you" | "them" | "tie") {
    switch (advantage) {
      case "you":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "them":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  }

  function getAdvantageColor(advantage: "you" | "them" | "tie") {
    switch (advantage) {
      case "you":
        return "bg-green-100 text-green-800 border-green-200";
      case "them":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  const selectedComp = competitors.find((c) => c.id === selectedCompetitor);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a competitor to analyze..." />
            </SelectTrigger>
            <SelectContent>
              {competitors.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {c.name}
                    <Badge variant="outline" className="ml-2">
                      {c.communities.length} communities
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleGenerateBattleCard}
          disabled={!selectedCompetitor || isLoading}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Battle Card
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {battleCard && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Home className="h-5 w-5" />
                    {battleCard.yourCompany.name}
                  </CardTitle>
                  <Badge className="bg-blue-500">Your Company</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <DollarSign className="mx-auto h-5 w-5 text-blue-500" />
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {formatCurrency(battleCard.yourCompany.avgPrice)}
                    </p>
                    <p className="text-xs text-gray-500">Avg Price</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <Ruler className="mx-auto h-5 w-5 text-blue-500" />
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {battleCard.yourCompany.avgSqFt.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Avg Sq Ft</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <Zap className="mx-auto h-5 w-5 text-blue-500" />
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      ${battleCard.yourCompany.pricePerSqFt}
                    </p>
                    <p className="text-xs text-gray-500">$/Sq Ft</p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">
                    Key Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {battleCard.yourCompany.strengths.map((strength, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-blue-200 bg-blue-50 text-blue-700"
                      >
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Building2 className="h-5 w-5" />
                    {battleCard.competitor.name}
                  </CardTitle>
                  <Badge variant="outline" className="border-orange-300">
                    Competitor
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <DollarSign className="mx-auto h-5 w-5 text-orange-500" />
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {formatCurrency(battleCard.competitor.avgPrice)}
                    </p>
                    <p className="text-xs text-gray-500">Avg Price</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <Ruler className="mx-auto h-5 w-5 text-orange-500" />
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      {battleCard.competitor.avgSqFt.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Avg Sq Ft</p>
                  </div>
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <Zap className="mx-auto h-5 w-5 text-orange-500" />
                    <p className="mt-1 text-lg font-bold text-gray-900">
                      ${battleCard.competitor.pricePerSqFt}
                    </p>
                    <p className="text-xs text-gray-500">$/Sq Ft</p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">
                    Their Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {battleCard.competitor.strengths.map((strength, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="border-orange-200 bg-orange-50 text-orange-700"
                      >
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 via-white to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Trophy className="h-5 w-5" />
                Head-to-Head Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div
                  className={`rounded-lg border-2 p-4 text-center ${getAdvantageColor(
                    battleCard.comparison.priceAdvantage
                  )}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {getAdvantageIcon(battleCard.comparison.priceAdvantage)}
                  </div>
                  <p className="mt-2 font-semibold">Price Advantage</p>
                  <p className="text-sm">
                    {battleCard.comparison.priceAdvantage === "you"
                      ? "You have better pricing"
                      : battleCard.comparison.priceAdvantage === "them"
                      ? "They have better pricing"
                      : "Similar pricing"}
                  </p>
                </div>
                <div
                  className={`rounded-lg border-2 p-4 text-center ${getAdvantageColor(
                    battleCard.comparison.valueAdvantage
                  )}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-5 w-5" />
                    {getAdvantageIcon(battleCard.comparison.valueAdvantage)}
                  </div>
                  <p className="mt-2 font-semibold">Value ($/sq ft)</p>
                  <p className="text-sm">
                    {battleCard.comparison.valueAdvantage === "you"
                      ? "Better value per sq ft"
                      : battleCard.comparison.valueAdvantage === "them"
                      ? "They offer better value"
                      : "Similar value"}
                  </p>
                </div>
                <div
                  className={`rounded-lg border-2 p-4 text-center ${getAdvantageColor(
                    battleCard.comparison.sizeAdvantage
                  )}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Ruler className="h-5 w-5" />
                    {getAdvantageIcon(battleCard.comparison.sizeAdvantage)}
                  </div>
                  <p className="mt-2 font-semibold">Size Advantage</p>
                  <p className="text-sm">
                    {battleCard.comparison.sizeAdvantage === "you"
                      ? "Larger homes on average"
                      : battleCard.comparison.sizeAdvantage === "them"
                      ? "They have larger homes"
                      : "Similar sizes"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Trophy className="h-5 w-5" />
                  Your Winning Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {battleCard.winningPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                      <span className="text-sm text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-700">
                  <Users className="h-5 w-5" />
                  Watch Out For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {battleCard.watchOutFor.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                      <span className="text-sm text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Sparkles className="h-5 w-5" />
                Recommended Talking Points for Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {battleCard.recommendedTalkingPoints.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg bg-white p-3 shadow-sm"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-700">Quick Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{battleCard.summary}</p>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            {analysisId && (
              <Button
                variant="outline"
                onClick={() => onViewDeepDive(analysisId)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                View Full Deep Dive Analysis
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download as PDF
            </Button>
          </div>
        </div>
      )}

      {!battleCard && !isLoading && selectedComp && (
        <Card className="bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">
              Ready to compare against {selectedComp.name}?
            </h3>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Click &quot;Generate Battle Card&quot; to create a detailed head-to-head
              comparison with actionable insights for your sales team.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
