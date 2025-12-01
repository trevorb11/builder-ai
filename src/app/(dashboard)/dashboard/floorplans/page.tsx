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
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-500 p-2">
            <LayoutGrid className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Floorplan Management
            </h1>
            <p className="text-gray-600">
              Manage your floorplans, pricing, and features
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
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
      <Tabs defaultValue="floorplans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="floorplans" className="gap-2">
            <Home className="h-4 w-4" />
            Floorplans
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Floorplan
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
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
