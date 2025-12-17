import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { IncentiveList } from "@/components/incentives/incentive-list";
import { AddIncentiveForm } from "@/components/incentives/add-incentive-form";
import {
  Gift,
  Plus,
  DollarSign,
  Percent,
  Tag,
  Users,
  TrendingUp,
} from "lucide-react";

async function getIncentiveData(organizationId: string) {
  const [incentives, communities] = await Promise.all([
    prisma.incentive.findMany({
      where: {
        community: { organizationId },
      },
      include: {
        community: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    }),
    prisma.community.findMany({
      where: { organizationId, status: "active" },
      select: { id: true, name: true },
    }),
  ]);

  return { incentives, communities };
}

const typeIcons: Record<string, React.ReactNode> = {
  financing: <Percent className="h-4 w-4" />,
  closing_costs: <DollarSign className="h-4 w-4" />,
  upgrade: <Tag className="h-4 w-4" />,
  price_reduction: <TrendingUp className="h-4 w-4" />,
  realtor_bonus: <Users className="h-4 w-4" />,
};

export default async function IncentivesPage() {
  const session = await auth();
  const organizationId = session?.user?.organizationId;

  if (!organizationId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">
              Please complete your organization setup to manage incentives.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { incentives, communities } = await getIncentiveData(organizationId);

  const activeIncentives = incentives.filter(i => i.isActive);
  const inactiveIncentives = incentives.filter(i => !i.isActive);

  // Group by type
  const byType = {
    financing: incentives.filter(i => i.type === "financing" && i.isActive),
    closing_costs: incentives.filter(i => i.type === "closing_costs" && i.isActive),
    upgrade: incentives.filter(i => i.type === "upgrade" && i.isActive),
    price_reduction: incentives.filter(i => i.type === "price_reduction" && i.isActive),
    realtor_bonus: incentives.filter(i => i.type === "realtor_bonus" && i.isActive),
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 p-2">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Incentives & Promotions
            </h1>
            <p className="text-gray-600">
              Manage buyer incentives, promotions, and realtor bonuses
            </p>
          </div>
        </div>
      </div>

      {/* Stats by Type */}
      <div className="mb-8 grid gap-4 md:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Percent className="h-4 w-4 text-blue-500" />
              Financing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{byType.financing.length}</div>
            <p className="text-xs text-gray-500">Active offers</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Closing Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{byType.closing_costs.length}</div>
            <p className="text-xs text-gray-500">Active offers</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-500" />
              Upgrades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{byType.upgrade.length}</div>
            <p className="text-xs text-gray-500">Active offers</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Price Reductions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{byType.price_reduction.length}</div>
            <p className="text-xs text-gray-500">Active offers</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              Realtor Bonuses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{byType.realtor_bonus.length}</div>
            <p className="text-xs text-gray-500">Active offers</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Incentives Alert */}
      {activeIncentives.length > 0 && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">
                  {activeIncentives.length} active incentive{activeIncentives.length !== 1 ? 's' : ''} across {new Set(activeIncentives.map(i => i.community.id)).size} communities
                </p>
                <p className="text-sm text-green-700">
                  Make sure to highlight these in your marketing materials and chatbot responses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Gift className="h-4 w-4" />
            Active ({activeIncentives.length})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="gap-2">
            Inactive ({inactiveIncentives.length})
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Incentive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Incentives</CardTitle>
              <CardDescription>
                Currently running promotions and offers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IncentiveList incentives={activeIncentives} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Incentives</CardTitle>
              <CardDescription>
                Expired or paused promotions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IncentiveList incentives={inactiveIncentives} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Incentive</CardTitle>
              <CardDescription>
                Create a new promotion or incentive offer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddIncentiveForm
                organizationId={organizationId}
                communities={communities}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
