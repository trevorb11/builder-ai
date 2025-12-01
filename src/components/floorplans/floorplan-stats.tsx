"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Home,
  DollarSign,
  Maximize,
  Bed,
  TrendingUp,
} from "lucide-react";

interface Floorplan {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  basePrice: number;
  status: string;
  community: { id: string; name: string } | null;
  inventory: { id: string; status: string }[];
  leads: { id: string }[];
}

interface FloorplanStatsProps {
  floorplans: Floorplan[];
}

export function FloorplanStats({ floorplans }: FloorplanStatsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (floorplans.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No data yet</h3>
        <p className="mt-2 text-gray-500">
          Add floorplans to see analytics and insights.
        </p>
      </div>
    );
  }

  // Calculate stats
  const prices = floorplans.map(f => f.basePrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  const sizes = floorplans.map(f => f.squareFeet);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  const avgSize = Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);

  // Bedroom distribution
  const bedroomCounts = floorplans.reduce((acc, f) => {
    acc[f.bedrooms] = (acc[f.bedrooms] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  // Price per sq ft analysis
  const pricePerSqFt = floorplans.map(f => ({
    name: f.name,
    value: Math.round(f.basePrice / f.squareFeet),
  }));
  const avgPricePerSqFt = Math.round(
    pricePerSqFt.reduce((a, b) => a + b.value, 0) / pricePerSqFt.length
  );

  // Sort floorplans by price for ranking
  const sortedByPrice = [...floorplans].sort((a, b) => a.basePrice - b.basePrice);
  const sortedBySize = [...floorplans].sort((a, b) => b.squareFeet - a.squareFeet);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Price Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatPrice(minPrice)} - {formatPrice(maxPrice)}
            </div>
            <p className="text-sm text-gray-500">
              Avg: {formatPrice(avgPrice)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Maximize className="h-4 w-4" />
              Size Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {minSize.toLocaleString()} - {maxSize.toLocaleString()} sq ft
            </div>
            <p className="text-sm text-gray-500">
              Avg: {avgSize.toLocaleString()} sq ft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Price/Sq Ft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${avgPricePerSqFt}</div>
            <p className="text-sm text-gray-500">average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Bedroom Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {Object.entries(bedroomCounts)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([beds, count]) => (
                  <Badge key={beds} variant="outline">
                    {beds} bed ({count})
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floorplan Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Floorplan Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium">Floorplan</th>
                  <th className="text-left py-3 font-medium">Community</th>
                  <th className="text-right py-3 font-medium">Beds</th>
                  <th className="text-right py-3 font-medium">Baths</th>
                  <th className="text-right py-3 font-medium">Sq Ft</th>
                  <th className="text-right py-3 font-medium">Price</th>
                  <th className="text-right py-3 font-medium">$/Sq Ft</th>
                  <th className="text-right py-3 font-medium">Available</th>
                  <th className="text-right py-3 font-medium">Leads</th>
                </tr>
              </thead>
              <tbody>
                {floorplans.map((fp) => (
                  <tr key={fp.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{fp.name}</td>
                    <td className="py-3 text-gray-500">
                      {fp.community?.name || "-"}
                    </td>
                    <td className="py-3 text-right">{fp.bedrooms}</td>
                    <td className="py-3 text-right">{fp.bathrooms}</td>
                    <td className="py-3 text-right">
                      {fp.squareFeet.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">{formatPrice(fp.basePrice)}</td>
                    <td className="py-3 text-right">
                      ${Math.round(fp.basePrice / fp.squareFeet)}
                    </td>
                    <td className="py-3 text-right">
                      {fp.inventory.filter(i => i.status === "available").length}
                    </td>
                    <td className="py-3 text-right">{fp.leads.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Most Affordable Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedByPrice.slice(0, 5).map((fp, index) => (
                <div
                  key={fp.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{fp.name}</span>
                  </div>
                  <span className="font-semibold">{formatPrice(fp.basePrice)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Maximize className="h-5 w-5" />
              Largest Floorplans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedBySize.slice(0, 5).map((fp, index) => (
                <div
                  key={fp.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{fp.name}</span>
                  </div>
                  <span className="font-semibold">
                    {fp.squareFeet.toLocaleString()} sq ft
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
