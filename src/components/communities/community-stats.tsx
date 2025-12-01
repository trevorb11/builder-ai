"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Home,
  DollarSign,
  Users,
  Building2,
} from "lucide-react";

interface Community {
  id: string;
  name: string;
  status: string;
  startingPrice: number | null;
  floorplans: { id: string; name: string; basePrice: number }[];
  inventory: { id: string; status: string }[];
  leads: { id: string }[];
  incentives: { id: string; title: string }[];
}

interface CommunityStatsProps {
  communities: Community[];
}

export function CommunityStats({ communities }: CommunityStatsProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate overall stats
  const totalFloorplans = communities.reduce((acc, c) => acc + c.floorplans.length, 0);
  const totalInventory = communities.reduce((acc, c) => acc + c.inventory.length, 0);
  const availableInventory = communities.reduce(
    (acc, c) => acc + c.inventory.filter(i => i.status === "available").length,
    0
  );
  const totalLeads = communities.reduce((acc, c) => acc + c.leads.length, 0);

  // Calculate price stats
  const allPrices = communities
    .filter(c => c.startingPrice)
    .map(c => c.startingPrice as number);
  const avgPrice = allPrices.length > 0
    ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length
    : 0;
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

  // Status breakdown
  const statusCounts = communities.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (communities.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No data yet</h3>
        <p className="mt-2 text-gray-500">
          Add communities to see analytics and insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Communities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communities.length}</div>
            <div className="flex gap-2 mt-2">
              {statusCounts.active && (
                <Badge className="bg-green-100 text-green-800">
                  {statusCounts.active} active
                </Badge>
              )}
              {statusCounts.coming_soon && (
                <Badge className="bg-blue-100 text-blue-800">
                  {statusCounts.coming_soon} coming
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableInventory}</div>
            <p className="text-sm text-gray-500">
              {totalInventory} total homes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Avg. Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(avgPrice)}</div>
            <p className="text-sm text-gray-500">
              {formatPrice(minPrice)} - {formatPrice(maxPrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-sm text-gray-500">
              across all communities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Community Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Community Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Community</th>
                  <th className="text-left py-3 font-medium">Status</th>
                  <th className="text-right py-3 font-medium">Starting Price</th>
                  <th className="text-right py-3 font-medium">Floorplans</th>
                  <th className="text-right py-3 font-medium">Available</th>
                  <th className="text-right py-3 font-medium">Leads</th>
                  <th className="text-right py-3 font-medium">Incentives</th>
                </tr>
              </thead>
              <tbody>
                {communities.map((community) => (
                  <tr key={community.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{community.name}</td>
                    <td className="py-3">
                      <Badge
                        className={
                          community.status === "active"
                            ? "bg-green-100 text-green-800"
                            : community.status === "coming_soon"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {community.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      {formatPrice(community.startingPrice)}
                    </td>
                    <td className="py-3 text-right">
                      {community.floorplans.length}
                    </td>
                    <td className="py-3 text-right">
                      {community.inventory.filter(i => i.status === "available").length}
                    </td>
                    <td className="py-3 text-right">
                      {community.leads.length}
                    </td>
                    <td className="py-3 text-right">
                      {community.incentives.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Active Incentives */}
      {communities.some(c => c.incentives.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Incentives by Community</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {communities
                .filter(c => c.incentives.length > 0)
                .map((community) => (
                  <div key={community.id}>
                    <h4 className="font-medium mb-2">{community.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {community.incentives.map((incentive) => (
                        <Badge key={incentive.id} variant="outline">
                          {incentive.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
