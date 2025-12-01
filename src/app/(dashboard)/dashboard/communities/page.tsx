import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CommunityList } from "@/components/communities/community-list";
import { AddCommunityForm } from "@/components/communities/add-community-form";
import { CommunityStats } from "@/components/communities/community-stats";
import {
  MapPin,
  Building2,
  Home,
  Plus,
  BarChart3,
} from "lucide-react";

async function getCommunityData(organizationId: string) {
  const [communities, inventoryCount, leadCount] = await Promise.all([
    prisma.community.findMany({
      where: { organizationId },
      include: {
        floorplans: {
          select: { id: true, name: true, basePrice: true },
        },
        inventory: {
          select: { id: true, status: true },
        },
        leads: {
          select: { id: true },
        },
        incentives: {
          where: { isActive: true },
          select: { id: true, title: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.inventoryHome.count({
      where: {
        community: { organizationId },
        status: "available",
      },
    }),
    prisma.lead.count({
      where: { organizationId },
    }),
  ]);

  return { communities, inventoryCount, leadCount };
}

export default async function CommunitiesPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to manage communities.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { communities, inventoryCount, leadCount } = await getCommunityData(organizationId);

  const activeCommunities = communities.filter(c => c.status === "active").length;
  const totalFloorplans = communities.reduce((acc, c) => acc + c.floorplans.length, 0);
  const totalInventory = communities.reduce((acc, c) => acc + c.inventory.length, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500 p-2">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Community Management
            </h1>
            <p className="text-gray-600">
              Manage your communities, floorplans, and inventory
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Communities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCommunities}</div>
            <p className="text-xs text-gray-500">{communities.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Floorplans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFloorplans}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Available Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryCount}</div>
            <p className="text-xs text-gray-500">{totalInventory} total homes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="communities" className="space-y-6">
        <TabsList>
          <TabsTrigger value="communities" className="gap-2">
            <Building2 className="h-4 w-4" />
            Communities
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Community
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="communities">
          <Card>
            <CardHeader>
              <CardTitle>Your Communities</CardTitle>
              <CardDescription>
                View and manage all your communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommunityList communities={communities} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Community</CardTitle>
              <CardDescription>
                Create a new community for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddCommunityForm organizationId={organizationId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Community Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CommunityStats communities={communities} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
