"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Target,
  Loader2,
  Search,
  Plus,
  X,
  Building2,
  DollarSign,
  Users,
  Star,
  TrendingUp,
} from "lucide-react";

interface Competitor {
  id: string;
  name: string;
  website?: string | null;
}

interface CompetitorResearchFormProps {
  existingCompetitors?: Competitor[];
}

const researchCriteria = [
  {
    id: "pricing",
    label: "Pricing & Value",
    description: "Price points and value propositions",
    icon: DollarSign,
  },
  {
    id: "products",
    label: "Product Offerings",
    description: "Floorplans, features, and options",
    icon: Building2,
  },
  {
    id: "marketing",
    label: "Marketing Strategy",
    description: "Advertising, social media, and content",
    icon: TrendingUp,
  },
  {
    id: "reputation",
    label: "Customer Reviews",
    description: "Ratings, reviews, and reputation",
    icon: Star,
  },
  {
    id: "positioning",
    label: "Market Position",
    description: "Target audience and positioning",
    icon: Users,
  },
];

export function CompetitorResearchForm({
  existingCompetitors = [],
}: CompetitorResearchFormProps) {
  const [isResearching, setIsResearching] = useState(false);
  const [competitorName, setCompetitorName] = useState("");
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([
    "pricing",
    "products",
    "marketing",
  ]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const handleCriteriaChange = (criteriaId: string, checked: boolean) => {
    if (checked) {
      setSelectedCriteria([...selectedCriteria, criteriaId]);
    } else {
      setSelectedCriteria(selectedCriteria.filter((c) => c !== criteriaId));
    }
  };

  const handleResearch = async () => {
    if (!competitorName.trim()) return;

    setIsResearching(true);
    try {
      const criteriaLabels = researchCriteria
        .filter((c) => selectedCriteria.includes(c.id))
        .map((c) => c.label);

      const response = await fetch("/api/research/competitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitorName: competitorName.trim(),
          criteria: criteriaLabels,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start research");
      }

      // Add to recent searches
      setRecentSearches((prev) => {
        const newSearches = [competitorName, ...prev.filter((s) => s !== competitorName)];
        return newSearches.slice(0, 5);
      });

      // Clear form and refresh
      setCompetitorName("");
      window.location.reload();
    } catch (error) {
      console.error("Research error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Research failed: ${errorMessage}. Please check your OpenAI API key and try again.`);
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-amber-500" />
          Research a Competitor
        </CardTitle>
        <CardDescription>
          Enter a competitor name and select research criteria
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Competitor Name Input */}
        <div className="space-y-2">
          <Label htmlFor="competitorName">Competitor Name *</Label>
          <div className="relative">
            <Input
              id="competitorName"
              placeholder="e.g., Lennar, Taylor Morrison"
              value={competitorName}
              onChange={(e) => setCompetitorName(e.target.value)}
              className="pr-10"
            />
            {competitorName && (
              <button
                onClick={() => setCompetitorName("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Select from Existing */}
        {existingCompetitors.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              {existingCompetitors.slice(0, 5).map((competitor) => (
                <button
                  key={competitor.id}
                  onClick={() => setCompetitorName(competitor.name)}
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                >
                  {competitor.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Research Criteria */}
        <div className="border-t border-gray-100 pt-4">
          <Label className="mb-3 block">Research Focus Areas</Label>
          <div className="space-y-3">
            {researchCriteria.map((criteria) => (
              <label
                key={criteria.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  checked={selectedCriteria.includes(criteria.id)}
                  onCheckedChange={(checked) =>
                    handleCriteriaChange(criteria.id, checked as boolean)
                  }
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <criteria.icon className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-gray-900 text-sm">
                      {criteria.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {criteria.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Button
          onClick={handleResearch}
          disabled={!competitorName.trim() || selectedCriteria.length === 0 || isResearching}
          className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          {isResearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              Start Deep Research
            </>
          )}
        </Button>

        {isResearching && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mt-4">
            <p className="text-sm text-amber-700">
              <strong>Deep research in progress...</strong>
            </p>
            <p className="text-xs text-amber-600 mt-1">
              This may take 1-2 minutes as we gather comprehensive intelligence on this competitor.
            </p>
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <Label className="text-xs text-gray-500 mb-2 block">Recent Searches</Label>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => setCompetitorName(search)}
                  className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
