"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Building2, Home, Tag, DollarSign, MapPin } from "lucide-react";

interface Floorplan {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  basePrice: number;
}

interface Incentive {
  id: string;
  title: string;
  value: string | null;
}

interface InventoryHome {
  id: string;
  address: string | null;
  price: number;
  status: string;
}

interface Community {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  startingPrice: number | null;
  floorplans: Floorplan[];
  incentives: Incentive[];
  inventory: InventoryHome[];
}

interface Organization {
  id: string;
  name: string;
  communities: Community[];
}

interface PortalConfig {
  showPricing: boolean;
  showIncentives: boolean;
  showInventory: boolean;
  showFloorplans: boolean;
  coopCommission: string | null;
  welcomeMessage: string | null;
}

interface PortalPreviewProps {
  organization: Organization | null;
  config: PortalConfig | null;
}

export function PortalPreview({ organization, config }: PortalPreviewProps) {
  if (!organization || !config) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
        <Building2 className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No Preview Available
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Configure your portal settings to see a preview.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      {/* Portal Header */}
      <div className="border-b bg-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold">{organization.name}</h2>
        <p className="mt-1 text-indigo-100">Realtor Portal</p>
        {config.welcomeMessage && (
          <p className="mt-4 text-sm text-indigo-200">{config.welcomeMessage}</p>
        )}
        {config.coopCommission && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">Co-op Commission: {config.coopCommission}</span>
          </div>
        )}
      </div>

      {/* Communities */}
      <div className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Communities ({organization.communities.length})
        </h3>

        {organization.communities.length === 0 ? (
          <p className="text-gray-500">No communities available.</p>
        ) : (
          <div className="space-y-6">
            {organization.communities.map((community) => (
              <div key={community.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {community.name}
                    </h4>
                    {(community.city || community.state) && (
                      <p className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        {community.city}, {community.state}
                      </p>
                    )}
                  </div>
                  {config.showPricing && community.startingPrice && (
                    <Badge variant="outline" className="text-lg">
                      From {formatCurrency(community.startingPrice)}
                    </Badge>
                  )}
                </div>

                {/* Incentives */}
                {config.showIncentives && community.incentives.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Tag className="h-4 w-4" />
                      Current Incentives
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {community.incentives.map((incentive) => (
                        <Badge
                          key={incentive.id}
                          variant="success"
                          className="text-xs"
                        >
                          {incentive.title}
                          {incentive.value && ` - ${incentive.value}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Floorplans */}
                {config.showFloorplans && community.floorplans.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Home className="h-4 w-4" />
                      Floorplans ({community.floorplans.length})
                    </h5>
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {community.floorplans.slice(0, 6).map((plan) => (
                        <div
                          key={plan.id}
                          className="rounded border bg-gray-50 p-2 text-sm"
                        >
                          <p className="font-medium">{plan.name}</p>
                          <p className="text-gray-500">
                            {plan.bedrooms}bd / {plan.bathrooms}ba |{" "}
                            {plan.squareFeet.toLocaleString()} sf
                          </p>
                          {config.showPricing && (
                            <p className="font-medium text-gray-900">
                              {formatCurrency(plan.basePrice)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inventory */}
                {config.showInventory && community.inventory.length > 0 && (
                  <div className="mt-4">
                    <h5 className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-700">
                      <Building2 className="h-4 w-4" />
                      Quick Move-In Homes ({community.inventory.length})
                    </h5>
                    <div className="grid gap-2 md:grid-cols-2">
                      {community.inventory.slice(0, 4).map((home) => (
                        <div
                          key={home.id}
                          className="rounded border bg-green-50 p-2 text-sm"
                        >
                          <p className="font-medium">{home.address || "TBD"}</p>
                          {config.showPricing && (
                            <p className="font-bold text-green-700">
                              {formatCurrency(home.price)}
                            </p>
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
  );
}
