"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Clock, DollarSign, Calendar } from "lucide-react";

interface InventoryStatsProps {
  stats: {
    total: number;
    available: number;
    pending: number;
    sold: number;
    model: number;
    averagePrice: number;
    upcomingMoveIns: number;
  };
}

export function InventoryStats({ stats }: InventoryStatsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Inventory</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {stats.available} available, {stats.pending} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Available</CardTitle>
          <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-green-500" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.available}</div>
          <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
              {stats.pending} pending
            </span>
            <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
              {stats.sold} sold
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Avg. Price</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-lg sm:text-2xl font-bold truncate">
            {stats.averagePrice ? formatPrice(stats.averagePrice) : "N/A"}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Across all inventory
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Move-ins</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground hidden sm:block" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">{stats.upcomingMoveIns}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Ready within 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
