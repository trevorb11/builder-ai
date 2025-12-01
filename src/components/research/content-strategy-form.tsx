"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Lightbulb,
  Loader2,
  Search,
  Plus,
  X,
  MapPin,
  Users,
} from "lucide-react";

interface ContentStrategyFormProps {
  config?: {
    markets?: string | null;
    targetAudience?: string | null;
    brandVoice?: string | null;
  } | null;
  defaultMarkets?: string[];
}

export function ContentStrategyForm({
  config,
  defaultMarkets = [],
}: ContentStrategyFormProps) {
  const [isResearching, setIsResearching] = useState(false);
  const [markets, setMarkets] = useState<string[]>(
    config?.markets ? JSON.parse(config.markets) : defaultMarkets
  );
  const [newMarket, setNewMarket] = useState("");
  const [targetAudience, setTargetAudience] = useState(
    config?.targetAudience || "First-time homebuyers and growing families looking for new construction homes"
  );

  const addMarket = () => {
    if (newMarket.trim() && !markets.includes(newMarket.trim())) {
      setMarkets([...markets, newMarket.trim()]);
      setNewMarket("");
    }
  };

  const removeMarket = (market: string) => {
    setMarkets(markets.filter((m) => m !== market));
  };

  const handleResearch = async () => {
    if (markets.length === 0) {
      alert("Please add at least one market");
      return;
    }

    setIsResearching(true);
    try {
      const response = await fetch("/api/research/content-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markets,
          targetAudience,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to start research");
      }

      // Refresh the page to show new results
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
          <Search className="h-5 w-5 text-purple-500" />
          Research Content Topics
        </CardTitle>
        <CardDescription>
          Define your markets and audience to get tailored content recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Target Markets */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            Target Markets *
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Austin, TX"
              value={newMarket}
              onChange={(e) => setNewMarket(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addMarket()}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="icon" onClick={addMarket}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {markets.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {markets.map((market) => (
                <span
                  key={market}
                  className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700"
                >
                  <MapPin className="h-3 w-3" />
                  {market}
                  <button
                    onClick={() => removeMarket(market)}
                    className="ml-1 hover:text-purple-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {markets.length === 0 && (
            <p className="text-xs text-gray-500">
              Add the cities/markets where you build homes
            </p>
          )}
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <Label htmlFor="targetAudience" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            Target Audience
          </Label>
          <Textarea
            id="targetAudience"
            placeholder="Describe your target homebuyers..."
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            Who are you trying to reach with your content?
          </p>
        </div>

        {/* What We'll Research */}
        <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
          <h4 className="font-semibold text-purple-900 text-sm mb-2">
            What we'll research:
          </h4>
          <ul className="text-xs text-purple-700 space-y-1">
            <li>• Trending topics in home building</li>
            <li>• Local market news and developments</li>
            <li>• Buyer education content ideas</li>
            <li>• SEO keyword opportunities</li>
            <li>• Social media content ideas</li>
            <li>• AI search optimization topics</li>
          </ul>
        </div>

        <Button
          onClick={handleResearch}
          disabled={markets.length === 0 || isResearching}
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          {isResearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Find Content Topics
            </>
          )}
        </Button>

        {isResearching && (
          <div className="rounded-lg bg-purple-50 border border-purple-200 p-4 mt-4">
            <p className="text-sm text-purple-700">
              <strong>Deep research in progress...</strong>
            </p>
            <p className="text-xs text-purple-600 mt-1">
              This may take 1-2 minutes as we analyze trends, local news, and SEO opportunities.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
