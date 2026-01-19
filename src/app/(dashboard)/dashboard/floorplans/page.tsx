import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloorplanList } from "@/components/floorplans/floorplan-list";
import { AddFloorplanForm } from "@/components/floorplans/add-floorplan-form";
import { FloorplanStats } from "@/components/floorplans/floorplan-stats";
import {
  Home,
  LayoutGrid,
  Plus,
  BarChart3,
  DollarSign,
  Maximize,
} from "lucide-react";

async function getFloorplanData(organizationId: string) {
  const [floorplans, communities] = await Promise.all([
    prisma.floorplan.findMany({
      where: { organizationId },
      include: {
        community: {
          select: { id: true, name: true },
        },
        inventory: {
          select: { id: true, status: true },
        },
        leads: {
          select: { id: true },
        },
      },
      orderBy: [{ name: "asc" }],
    }),
    prisma.community.findMany({
      where: { organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { floorplans, communities };
}

export default async function FloorplansPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to manage floorplans.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { floorplans, communities } = await getFloorplanData(organizationId);

  const activeFloorplans = floorplans.filter(f => f.status === "active").length;
  const totalInventory = floorplans.reduce((acc, f) => acc + f.inventory.length, 0);

  const avgPrice = floorplans.length > 0
    ? floorplans.reduce((acc, f) => acc + f.basePrice, 0) / floorplans.length
    : 0;

  const avgSqFt = floorplans.length > 0
    ? Math.round(floorplans.reduce((acc, f) => acc + f.squareFeet, 0) / floorplans.length)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start sm:items-center gap-3">
          <div className="rounded-lg bg-violet-500 p-2 flex-shrink-0">
            <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Floorplan Management
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your floorplans, pricing, and features
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Floorplans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFloorplans}</div>
            <p className="text-xs text-gray-500">{floorplans.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Average Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(avgPrice)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Average Sq. Ft.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSqFt.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Inventory Homes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInventory}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="floorplans" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="floorplans" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Floorplans</span>
            <span className="sm:hidden">Plans</span>
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Add Floorplan</span>
            <span className="sm:hidden">Add</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="floorplans">
          <Card>
            <CardHeader>
              <CardTitle>Your Floorplans</CardTitle>
              <CardDescription>
                View and manage all your floorplans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FloorplanList floorplans={floorplans} communities={communities} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Floorplan</CardTitle>
              <CardDescription>
                Create a new floorplan for your communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddFloorplanForm
                organizationId={organizationId}
                communities={communities}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Floorplan Analytics</CardTitle>
              <CardDescription>
                Performance metrics and comparisons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FloorplanStats floorplans={floorplans} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
