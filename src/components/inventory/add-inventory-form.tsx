"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";

interface Community {
  id: string;
  name: string;
}

interface Floorplan {
  id: string;
  name: string;
  communityId: string | null;
}

interface AddInventoryFormProps {
  organizationId: string;
  communities: Community[];
  floorplans: Floorplan[];
}

export function AddInventoryForm({ organizationId, communities, floorplans }: AddInventoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");

  // Filter floorplans by selected community
  const availableFloorplans = selectedCommunity
    ? floorplans.filter(fp => fp.communityId === selectedCommunity || !fp.communityId)
    : floorplans;

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter(f => f !== feature));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      communityId: formData.get("communityId"),
      floorplanId: formData.get("floorplanId"),
      lot: formData.get("lot") || null,
      block: formData.get("block") || null,
      address: formData.get("address") || null,
      price: parseFloat(formData.get("price") as string),
      status: formData.get("status") || "available",
      moveInDate: formData.get("moveInDate") || null,
      completionDate: formData.get("completionDate") || null,
      mlsNumber: formData.get("mlsNumber") || null,
      specialNotes: formData.get("specialNotes") || null,
      features: features.length > 0 ? JSON.stringify(features) : null,
    };

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to add inventory home");
      }

      setSuccess(true);
      router.refresh();
      // Reset form
      (e.target as HTMLFormElement).reset();
      setFeatures([]);
      setSelectedCommunity("");
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
          Inventory home added successfully!
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Community */}
        <div className="space-y-2">
          <Label htmlFor="communityId">Community *</Label>
          <Select
            name="communityId"
            value={selectedCommunity}
            onValueChange={setSelectedCommunity}
            required
          >
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

        {/* Floorplan */}
        <div className="space-y-2">
          <Label htmlFor="floorplanId">Floorplan *</Label>
          <Select name="floorplanId" required disabled={!selectedCommunity}>
            <SelectTrigger>
              <SelectValue placeholder={selectedCommunity ? "Select a floorplan" : "Select community first"} />
            </SelectTrigger>
            <SelectContent>
              {availableFloorplans.map((floorplan) => (
                <SelectItem key={floorplan.id} value={floorplan.id}>
                  {floorplan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            placeholder="1234 Main Street"
          />
        </div>

        {/* Lot & Block */}
        <div className="space-y-2">
          <Label htmlFor="lot">Lot Number</Label>
          <Input
            id="lot"
            name="lot"
            placeholder="12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="block">Block</Label>
          <Input
            id="block"
            name="block"
            placeholder="A"
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            placeholder="450000"
            required
            min={0}
            step={1000}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue="available">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="model">Model Home</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Move-in Date */}
        <div className="space-y-2">
          <Label htmlFor="moveInDate">Move-in Date</Label>
          <Input
            id="moveInDate"
            name="moveInDate"
            placeholder="January 2025"
          />
        </div>

        {/* Completion Date */}
        <div className="space-y-2">
          <Label htmlFor="completionDate">Completion Date</Label>
          <Input
            id="completionDate"
            name="completionDate"
            placeholder="December 2024"
          />
        </div>

        {/* MLS Number */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="mlsNumber">MLS Number</Label>
          <Input
            id="mlsNumber"
            name="mlsNumber"
            placeholder="123456789"
          />
        </div>

        {/* Features */}
        <div className="space-y-2 md:col-span-2">
          <Label>Included Features/Upgrades</Label>
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="e.g., Quartz countertops"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addFeature}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {features.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(feature)}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Special Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="specialNotes">Special Notes</Label>
          <Textarea
            id="specialNotes"
            name="specialNotes"
            placeholder="Any special notes about this home..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Add Inventory Home
        </Button>
      </div>
    </form>
  );
}
