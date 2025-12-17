"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, DollarSign, Percent, Tag, Users, TrendingUp } from "lucide-react";

interface Community {
  id: string;
  name: string;
}

interface AddIncentiveFormProps {
  organizationId: string;
  communities: Community[];
}

const incentiveTypes = [
  { value: "financing", label: "Financing", icon: Percent, description: "Rate buy-downs, special financing offers" },
  { value: "closing_costs", label: "Closing Cost Credit", icon: DollarSign, description: "Credits toward buyer closing costs" },
  { value: "upgrade", label: "Free Upgrades", icon: Tag, description: "Included upgrades or design credits" },
  { value: "price_reduction", label: "Price Reduction", icon: TrendingUp, description: "Direct price reductions or discounts" },
  { value: "realtor_bonus", label: "Realtor Bonus", icon: Users, description: "Special commission or bonus for agents" },
];

export function AddIncentiveForm({ organizationId, communities }: AddIncentiveFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [isActive, setIsActive] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      communityId: formData.get("communityId"),
      title: formData.get("title"),
      description: formData.get("description"),
      type: formData.get("type"),
      value: formData.get("value") || null,
      terms: formData.get("terms") || null,
      startDate: formData.get("startDate") || null,
      endDate: formData.get("endDate") || null,
      isActive,
    };

    try {
      const response = await fetch("/api/incentives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to add incentive");
      }

      setSuccess(true);
      router.refresh();
      // Reset form
      (e.target as HTMLFormElement).reset();
      setSelectedType("");
      setIsActive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">
          Incentive added successfully!
        </div>
      )}

      {/* Incentive Type Selection */}
      <div className="space-y-3">
        <Label>Incentive Type *</Label>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {incentiveTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.value;
            return (
              <label
                key={type.value}
                className={`relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={isSelected}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="sr-only"
                  required
                />
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  isSelected ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  <Icon className={`h-5 w-5 ${isSelected ? "text-blue-600" : "text-gray-500"}`} />
                </div>
                <div>
                  <p className={`font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                    {type.label}
                  </p>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Community */}
        <div className="space-y-2">
          <Label htmlFor="communityId">Community *</Label>
          <Select name="communityId" required>
            <SelectTrigger>
              <SelectValue placeholder="Select a community" />
            </SelectTrigger>
            <SelectContent>
              {communities.map((community) => (
                <SelectItem key={community.id} value={community.id}>
                  {community.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Value */}
        <div className="space-y-2">
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            name="value"
            placeholder="e.g., $15,000 or 3%"
          />
          <p className="text-xs text-gray-500">The monetary value or percentage of the incentive</p>
        </div>

        {/* Title */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            placeholder="e.g., Limited Time Closing Cost Credit"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe the incentive and what buyers will receive..."
            rows={3}
            required
          />
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
          />
        </div>

        {/* Terms */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            name="terms"
            placeholder="Any terms, conditions, or restrictions..."
            rows={2}
          />
        </div>

        {/* Active Toggle */}
        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <Label>Active Incentive</Label>
              <p className="text-sm text-gray-500">
                Active incentives are displayed to buyers and in marketing
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Add Incentive
        </Button>
      </div>
    </form>
  );
}
