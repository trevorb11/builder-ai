import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InventoryList } from "@/components/inventory/inventory-list";
import { AddInventoryForm } from "@/components/inventory/add-inventory-form";
import {
  Home,
  Plus,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle,
  Building2,
  TrendingUp,
} from "lucide-react";

async function getInventoryData(organizationId: string) {
  const [inventoryHomes, communities, floorplans] = await Promise.all([
    prisma.inventoryHome.findMany({
      where: {
        community: { organizationId },
      },
      include: {
        community: {
          select: { id: true, name: true, city: true, state: true },
        },
        floorplan: {
          select: { id: true, name: true, bedrooms: true, bathrooms: true, squareFeet: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.community.findMany({
      where: { organizationId, status: "active" },
      select: { id: true, name: true },
    }),
    prisma.floorplan.findMany({
      where: { organizationId, status: "active" },
      select: { id: true, name: true, communityId: true },
    }),
  ]);

  return { inventoryHomes, communities, floorplans };
}

export default async function InventoryPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to manage inventory homes.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { inventoryHomes, communities, floorplans } = await getInventoryData(organizationId);

  const availableHomes = inventoryHomes.filter(h => h.status === "available");
  const pendingHomes = inventoryHomes.filter(h => h.status === "pending");
  const modelHomes = inventoryHomes.filter(h => h.status === "model");
  const soldHomes = inventoryHomes.filter(h => h.status === "sold");

  const totalValue = availableHomes.reduce((acc, h) => acc + h.price, 0);
  const avgPrice = availableHomes.length > 0 ? totalValue / availableHomes.length : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 p-2">
              <Home className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Move-In Ready Homes
              </h1>
              <p className="text-gray-600">
                Manage your quick move-in inventory and spec homes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-5">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableHomes.length}</div>
            <p className="text-xs text-gray-500">Ready to sell</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingHomes.length}</div>
            <p className="text-xs text-gray-500">Under contract</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-500" />
              Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{modelHomes.length}</div>
            <p className="text-xs text-gray-500">Model homes</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{soldHomes.length}</div>
            <p className="text-xs text-gray-500">This period</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Avg. Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-gray-500">Available homes</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Alert for Available Inventory */}
      {availableHomes.length > 0 && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-900">
                    {availableHomes.length} home{availableHomes.length !== 1 ? 's' : ''} ready for immediate sale
                  </p>
                  <p className="text-sm text-green-700">
                    Total inventory value: ${totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                Export Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Home className="h-4 w-4" />
            All Homes ({inventoryHomes.length})
          </TabsTrigger>
          <TabsTrigger value="available" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Available ({availableHomes.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingHomes.length})
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Home
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Inventory Homes</CardTitle>
              <CardDescription>
                Complete list of move-in ready and spec homes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryList inventoryHomes={inventoryHomes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available">
          <Card>
            <CardHeader>
              <CardTitle>Available Homes</CardTitle>
              <CardDescription>
                Homes ready for immediate sale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryList inventoryHomes={availableHomes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Homes</CardTitle>
              <CardDescription>
                Homes currently under contract
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryList inventoryHomes={pendingHomes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Inventory Home</CardTitle>
              <CardDescription>
                Add a new move-in ready or spec home to your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddInventoryForm
                organizationId={organizationId}
                communities={communities}
                floorplans={floorplans}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
