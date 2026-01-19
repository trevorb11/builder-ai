import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { InventoryStats } from "@/components/inventory/inventory-stats";
import { InventoryList } from "@/components/inventory/inventory-list";
import { AddInventoryForm } from "@/components/inventory/add-inventory-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Grid3X3, Calendar, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

async function getInventoryData(organizationId: string) {
  const [inventory, communities, floorplans] = await Promise.all([
    prisma.inventoryHome.findMany({
      where: {
        community: {
          organizationId,
        },
      },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
        floorplan: {
          select: {
            id: true,
            name: true,
            bedrooms: true,
            bathrooms: true,
            squareFeet: true,
            basePrice: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
    }),
    prisma.community.findMany({
      where: { organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.floorplan.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        basePrice: true,
        bedrooms: true,
        bathrooms: true,
        squareFeet: true,
        communityId: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Calculate stats
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const stats = {
    total: inventory.length,
    available: inventory.filter((h) => h.status === "available").length,
    pending: inventory.filter((h) => h.status === "pending").length,
    sold: inventory.filter((h) => h.status === "sold").length,
    model: inventory.filter((h) => h.status === "model").length,
    averagePrice:
      inventory.length > 0
        ? inventory.reduce((acc, h) => acc + h.price, 0) / inventory.length
        : 0,
    upcomingMoveIns: inventory.filter((h) => {
      if (!h.moveInDate) return false;
      const moveIn = new Date(h.moveInDate);
      return moveIn >= now && moveIn <= thirtyDaysFromNow && h.status === "available";
    }).length,
  };

  // Group by community for summary view
  const byCommunity = communities.map((community) => {
    const communityInventory = inventory.filter((h) => h.community.id === community.id);
    return {
      ...community,
      total: communityInventory.length,
      available: communityInventory.filter((h) => h.status === "available").length,
      pending: communityInventory.filter((h) => h.status === "pending").length,
    };
  });

  return { inventory, communities, floorplans, stats, byCommunity };
}

export default async function InventoryPage() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  const { inventory, communities, floorplans, stats, byCommunity } = await getInventoryData(
    session.user.organizationId
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory Homes</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Manage your quick move-in homes, spec homes, and model homes.
          </p>
        </div>
        <AddInventoryForm
          communities={communities}
          floorplans={floorplans}
          onSuccess={() => {}}
        />
      </div>

      {/* Stats */}
      <InventoryStats stats={stats} />

      {/* Main Content */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="list" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <Grid3X3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">All Inventory</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="by-community" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">By Community</span>
            <span className="sm:hidden">By Area</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Move-In Calendar</span>
            <span className="sm:hidden">Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Inventory Homes</CardTitle>
              <CardDescription>
                View and manage all inventory homes across all communities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryList
                inventory={inventory}
                communities={communities}
                floorplans={floorplans}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-community">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {byCommunity.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-gray-500">
                  <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No communities yet. Add a community first.</p>
                </CardContent>
              </Card>
            ) : (
              byCommunity.map((community) => (
                <Card key={community.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{community.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Total Homes</span>
                        <span className="font-semibold">{community.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Available</span>
                        <span className="font-semibold text-green-600">
                          {community.available}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Pending</span>
                        <span className="font-semibold text-yellow-600">
                          {community.pending}
                        </span>
                      </div>
                      <div className="pt-2 border-t mt-2">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          {community.total > 0 && (
                            <div className="h-full flex">
                              <div
                                className="bg-green-500"
                                style={{
                                  width: `${(community.available / community.total) * 100}%`,
                                }}
                              />
                              <div
                                className="bg-yellow-500"
                                style={{
                                  width: `${(community.pending / community.total) * 100}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Move-In Dates</CardTitle>
              <CardDescription>
                Inventory homes with scheduled move-in dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const homesWithDates = inventory
                  .filter((h) => h.moveInDate && h.status === "available")
                  .sort((a, b) => {
                    const dateA = new Date(a.moveInDate!);
                    const dateB = new Date(b.moveInDate!);
                    return dateA.getTime() - dateB.getTime();
                  });

                if (homesWithDates.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No upcoming move-in dates scheduled.</p>
                      <p className="text-sm mt-1">
                        Add move-in dates to your inventory homes to see them here.
                      </p>
                    </div>
                  );
                }

                // Group by month
                const byMonth: Record<string, typeof homesWithDates> = {};
                homesWithDates.forEach((home) => {
                  const date = new Date(home.moveInDate!);
                  const monthKey = date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  });
                  if (!byMonth[monthKey]) {
                    byMonth[monthKey] = [];
                  }
                  byMonth[monthKey].push(home);
                });

                return (
                  <div className="space-y-6">
                    {Object.entries(byMonth).map(([month, homes]) => (
                      <div key={month}>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {month}
                        </h3>
                        <div className="space-y-2">
                          {homes.map((home) => (
                            <div
                              key={home.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{home.floorplan.name}</p>
                                <p className="text-sm text-gray-500">
                                  {home.community.name}
                                  {home.lot && ` - Lot ${home.lot}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600">
                                  {formatPrice(home.price)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(home.moveInDate!).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
