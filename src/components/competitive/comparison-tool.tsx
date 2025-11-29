"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";

interface Floorplan {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  basePrice: number;
}

interface CompetitorFloorplan {
  id: string;
  name: string;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  price: number | null;
}

interface Competitor {
  id: string;
  name: string;
  communities: {
    id: string;
    name: string;
    floorplans: CompetitorFloorplan[];
  }[];
}

interface ComparisonToolProps {
  myFloorplans: Floorplan[];
  competitors: Competitor[];
  organizationId: string;
}

export function ComparisonTool({
  myFloorplans,
  competitors,
  organizationId,
}: ComparisonToolProps) {
  const [selectedFloorplan, setSelectedFloorplan] = useState("");
  const [selectedCompetitor, setSelectedCompetitor] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const allCompetitorFloorplans = competitors.flatMap((c) =>
    c.communities.flatMap((cm) =>
      cm.floorplans.map((fp) => ({
        ...fp,
        competitorName: c.name,
        communityName: cm.name,
      }))
    )
  );

  const myPlan = myFloorplans.find((p) => p.id === selectedFloorplan);

  async function handleAnalyze() {
    if (!selectedFloorplan) return;

    setIsLoading(true);
    setAnalysis("");

    try {
      const response = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          floorplanId: selectedFloorplan,
          competitorId: selectedCompetitor || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Error analyzing:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Your Floorplan</Label>
          <Select value={selectedFloorplan} onValueChange={setSelectedFloorplan}>
            <SelectTrigger>
              <SelectValue placeholder="Select floorplan..." />
            </SelectTrigger>
            <SelectContent>
              {myFloorplans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} ({plan.bedrooms}bd/{plan.bathrooms}ba)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Compare Against</Label>
          <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
            <SelectTrigger>
              <SelectValue placeholder="All competitors..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Competitors</SelectItem>
              {competitors.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            onClick={handleAnalyze}
            disabled={!selectedFloorplan || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </div>

      {myPlan && (
        <div className="rounded-lg border bg-blue-50 p-4">
          <h3 className="font-medium text-blue-900">Selected: {myPlan.name}</h3>
          <div className="mt-2 flex flex-wrap gap-3">
            <Badge variant="outline">
              {myPlan.bedrooms} bed / {myPlan.bathrooms} bath
            </Badge>
            <Badge variant="outline">{myPlan.squareFeet.toLocaleString()} sq ft</Badge>
            <Badge variant="outline">{formatCurrency(myPlan.basePrice)}</Badge>
            <Badge variant="outline">
              {formatCurrency(Math.round(myPlan.basePrice / myPlan.squareFeet))}/sq ft
            </Badge>
          </div>
        </div>
      )}

      {/* Comparable Competitor Floorplans */}
      {myPlan && allCompetitorFloorplans.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Similar Competitor Floorplans</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {allCompetitorFloorplans
              .filter((fp) => {
                if (!fp.bedrooms) return false;
                return Math.abs(fp.bedrooms - myPlan.bedrooms) <= 1;
              })
              .slice(0, 6)
              .map((fp) => (
                <div
                  key={fp.id}
                  className="rounded-lg border bg-gray-50 p-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{fp.name}</p>
                      <p className="text-sm text-gray-500">{fp.competitorName}</p>
                    </div>
                    {fp.price && (
                      <Badge
                        variant={
                          fp.price < myPlan.basePrice ? "destructive" : "success"
                        }
                      >
                        {formatCurrency(fp.price)}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2 text-xs text-gray-500">
                    {fp.bedrooms && <span>{fp.bedrooms}bd</span>}
                    {fp.bathrooms && <span>{fp.bathrooms}ba</span>}
                    {fp.squareFeet && <span>{fp.squareFeet.toLocaleString()} sf</span>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {analysis && (
        <div className="rounded-lg border bg-gray-50 p-4">
          <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-900">
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI Competitive Analysis
          </h3>
          <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
}
