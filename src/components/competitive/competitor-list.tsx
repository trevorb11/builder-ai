"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Building2, Home, ExternalLink, DollarSign, Radio } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CompetitorMonitorDialog } from "./competitor-monitor-dialog";

interface CompetitorFloorplan {
  id: string;
  name: string;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  price: number | null;
}

interface CompetitorCommunity {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  startingPrice: number | null;
  floorplans: CompetitorFloorplan[];
}

interface Competitor {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  communities: CompetitorCommunity[];
}

interface CompetitorListProps {
  competitors: Competitor[];
}

export function CompetitorList({ competitors }: CompetitorListProps) {
  const [monitorDialog, setMonitorDialog] = useState<{
    open: boolean;
    competitorId: string;
    competitorName: string;
    competitorWebsite: string | null;
  }>({
    open: false,
    competitorId: "",
    competitorName: "",
    competitorWebsite: null,
  });

  if (competitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building2 className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No competitors tracked yet
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Add competitors to start tracking their communities and floorplans.
        </p>
      </div>
    );
  }

  return (
    <>
      <Accordion type="multiple" className="space-y-4">
        {competitors.map((competitor) => (
          <AccordionItem
            key={competitor.id}
            value={competitor.id}
            className="rounded-lg border px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-orange-100 p-2">
                  <Building2 className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">{competitor.name}</h3>
                  <p className="text-sm text-gray-500">
                    {competitor.communities.length} communities,{" "}
                    {competitor.communities.reduce(
                      (acc, c) => acc + c.floorplans.length,
                      0
                    )}{" "}
                    floorplans
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pb-4">
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {competitor.website && (
                    <a
                      href={competitor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {competitor.website}
                    </a>
                  )}
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMonitorDialog({
                        open: true,
                        competitorId: competitor.id,
                        competitorName: competitor.name,
                        competitorWebsite: competitor.website,
                      });
                    }}
                    className="gap-1.5 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                  >
                    <Radio className="h-3.5 w-3.5" />
                    Monitor
                  </Button>
                </div>

                {competitor.description && (
                  <p className="text-sm text-gray-600">{competitor.description}</p>
                )}

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Communities</h4>
                  {competitor.communities.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No community data added yet.
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {competitor.communities.map((community) => (
                        <div
                          key={community.id}
                          className="rounded-lg border bg-gray-50 p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">
                                {community.name}
                              </h5>
                              {community.city && community.state && (
                                <p className="text-sm text-gray-500">
                                  {community.city}, {community.state}
                                </p>
                              )}
                            </div>
                            {community.startingPrice && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                From {formatCurrency(community.startingPrice)}
                              </Badge>
                            )}
                          </div>

                          {community.floorplans.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-medium text-gray-500">
                                Floorplans ({community.floorplans.length})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {community.floorplans.map((plan) => (
                                  <div
                                    key={plan.id}
                                    className="flex items-center gap-2 rounded bg-white px-2 py-1 text-xs"
                                  >
                                    <Home className="h-3 w-3 text-gray-400" />
                                    <span>{plan.name}</span>
                                    {plan.bedrooms && (
                                      <span className="text-gray-400">
                                        {plan.bedrooms}bd
                                      </span>
                                    )}
                                    {plan.price && (
                                      <span className="text-gray-500">
                                        {formatCurrency(plan.price)}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Monitor Dialog */}
      <CompetitorMonitorDialog
        open={monitorDialog.open}
        onOpenChange={(open) => setMonitorDialog((prev) => ({ ...prev, open }))}
        competitorId={monitorDialog.competitorId}
        competitorName={monitorDialog.competitorName}
        competitorWebsite={monitorDialog.competitorWebsite}
      />
    </>
  );
}
