"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Gift,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  DollarSign,
  Percent,
  Tag,
  Users,
  TrendingUp,
  Calendar,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Incentive {
  id: string;
  title: string;
  description: string;
  type: string;
  value: string | null;
  terms: string | null;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  community: {
    id: string;
    name: string;
  };
}

interface IncentiveListProps {
  incentives: Incentive[];
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  financing: { label: "Financing", icon: Percent, color: "text-blue-700", bgColor: "bg-blue-100" },
  closing_costs: { label: "Closing Costs", icon: DollarSign, color: "text-green-700", bgColor: "bg-green-100" },
  upgrade: { label: "Upgrade", icon: Tag, color: "text-purple-700", bgColor: "bg-purple-100" },
  price_reduction: { label: "Price Reduction", icon: TrendingUp, color: "text-orange-700", bgColor: "bg-orange-100" },
  realtor_bonus: { label: "Realtor Bonus", icon: Users, color: "text-indigo-700", bgColor: "bg-indigo-100" },
};

export function IncentiveList({ incentives }: IncentiveListProps) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (incentives.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Gift className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-1">No incentives</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Add your first incentive to start attracting buyers with special offers.
        </p>
      </div>
    );
  }

  async function toggleActive(id: string, currentState: boolean) {
    setUpdatingId(id);
    try {
      await fetch(`/api/incentives/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update incentive:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {incentives.map((incentive) => {
        const config = typeConfig[incentive.type] || typeConfig.upgrade;
        const Icon = config.icon;

        return (
          <div
            key={incentive.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${config.color}`} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{incentive.title}</h3>
                    <Badge className={`${config.bgColor} ${config.color}`}>
                      {config.label}
                    </Badge>
                    {!incentive.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{incentive.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 pt-1">
                    {incentive.value && (
                      <span className="flex items-center gap-1 font-medium text-green-600">
                        <DollarSign className="h-3.5 w-3.5" />
                        {incentive.value}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {incentive.community.name}
                    </span>
                    {incentive.endDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Expires: {new Date(incentive.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {incentive.terms && (
                    <p className="text-xs text-gray-400 pt-1">
                      Terms: {incentive.terms}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Active</span>
                  <Switch
                    checked={incentive.isActive}
                    onCheckedChange={() => toggleActive(incentive.id, incentive.isActive)}
                    disabled={updatingId === incentive.id}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Incentive
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
