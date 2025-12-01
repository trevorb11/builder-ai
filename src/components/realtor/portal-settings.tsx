"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import type { RealtorPortalConfig } from "@/generated/prisma/client";

interface RealtorPortalSettingsProps {
  config: RealtorPortalConfig | null;
  organizationId: string;
}

export function RealtorPortalSettings({
  config,
  organizationId,
}: RealtorPortalSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    isActive: config?.isActive ?? true,
    welcomeMessage:
      config?.welcomeMessage ||
      "Welcome to our Realtor Portal! Find inventory, incentives, and resources to help your clients.",
    showPricing: config?.showPricing ?? true,
    showIncentives: config?.showIncentives ?? true,
    showInventory: config?.showInventory ?? true,
    showFloorplans: config?.showFloorplans ?? true,
    requireLogin: config?.requireLogin ?? false,
    coopCommission: config?.coopCommission || "3%",
    contactEmail: config?.contactEmail || "",
    contactPhone: config?.contactPhone || "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/realtor-portal/config", {
        method: config ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organizationId,
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving config:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
        <div>
          <Label htmlFor="isActive">Portal Active</Label>
          <p className="text-sm text-gray-600">
            Enable or disable the realtor portal
          </p>
        </div>
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isActive: checked })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="welcomeMessage">Welcome Message</Label>
        <Textarea
          id="welcomeMessage"
          value={formData.welcomeMessage}
          onChange={(e) =>
            setFormData({ ...formData, welcomeMessage: e.target.value })
          }
          placeholder="Welcome message for agents..."
          rows={3}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="coopCommission">Co-op Commission</Label>
          <Input
            id="coopCommission"
            value={formData.coopCommission}
            onChange={(e) =>
              setFormData({ ...formData, coopCommission: e.target.value })
            }
            placeholder="e.g., 3%, $10,000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({ ...formData, contactEmail: e.target.value })
            }
            placeholder="realtors@builder.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input
          id="contactPhone"
          type="tel"
          value={formData.contactPhone}
          onChange={(e) =>
            setFormData({ ...formData, contactPhone: e.target.value })
          }
          placeholder="(555) 555-5555"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Display Options</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="showPricing">Show Pricing</Label>
              <p className="text-sm text-gray-500">Display price information</p>
            </div>
            <Switch
              id="showPricing"
              checked={formData.showPricing}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showPricing: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="showIncentives">Show Incentives</Label>
              <p className="text-sm text-gray-500">Display current incentives</p>
            </div>
            <Switch
              id="showIncentives"
              checked={formData.showIncentives}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showIncentives: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="showInventory">Show Inventory</Label>
              <p className="text-sm text-gray-500">Display QMI homes</p>
            </div>
            <Switch
              id="showInventory"
              checked={formData.showInventory}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showInventory: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="showFloorplans">Show Floorplans</Label>
              <p className="text-sm text-gray-500">Display floorplan details</p>
            </div>
            <Switch
              id="showFloorplans"
              checked={formData.showFloorplans}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, showFloorplans: checked })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label htmlFor="requireLogin">Require Login</Label>
          <p className="text-sm text-gray-500">
            Agents must register to access the portal
          </p>
        </div>
        <Switch
          id="requireLogin"
          checked={formData.requireLogin}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, requireLogin: checked })
          }
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </form>
  );
}
