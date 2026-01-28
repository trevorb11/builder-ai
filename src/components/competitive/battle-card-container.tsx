"use client";

import { useState } from "react";
import { BattleCardComparison } from "./battle-card-comparison";
import { CompetitorDeepDive } from "./competitor-deep-dive";

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

interface BattleCardContainerProps {
  competitors: Competitor[];
  organization: Organization;
  organizationId: string;
}

export function BattleCardContainer({
  competitors,
  organization,
  organizationId,
}: BattleCardContainerProps) {
  const [view, setView] = useState<"battle-cards" | "deep-dive">("battle-cards");
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  function handleViewDeepDive(analysisId: string) {
    setSelectedAnalysisId(analysisId);
    setView("deep-dive");
  }

  function handleBack() {
    setView("battle-cards");
    setSelectedAnalysisId(null);
  }

  if (view === "deep-dive" && selectedAnalysisId) {
    return (
      <CompetitorDeepDive
        analysisId={selectedAnalysisId}
        onBack={handleBack}
      />
    );
  }

  return (
    <BattleCardComparison
      competitors={competitors}
      organization={organization}
      organizationId={organizationId}
      onViewDeepDive={handleViewDeepDive}
    />
  );
}
