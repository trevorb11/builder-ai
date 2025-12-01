"use client";

import { useState } from "react";
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
import { CheckCircle, AlertCircle } from "lucide-react";

interface Community {
  id: string;
  name: string;
}

interface AddFloorplanFormProps {
  organizationId: string;
  communities: Community[];
}

export function AddFloorplanForm({ organizationId, communities }: AddFloorplanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/floorplans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          bedrooms: parseInt(formData.get("bedrooms") as string),
          bathrooms: parseFloat(formData.get("bathrooms") as string),
          halfBaths: parseInt(formData.get("halfBaths") as string) || 0,
          squareFeet: parseInt(formData.get("squareFeet") as string),
          stories: parseInt(formData.get("stories") as string) || 1,
          garageSpaces: parseInt(formData.get("garageSpaces") as string) || 2,
          basePrice: parseFloat(formData.get("basePrice") as string),
          status: formData.get("status"),
          communityId: formData.get("communityId") || null,
          features: formData.get("features"),
          organizationId,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Floorplan created successfully!");
        (e.target as HTMLFormElement).reset();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.error || "Failed to create floorplan");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {status !== "idle" && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            status === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {status === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message}</span>
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Floorplan Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., The Austin"
              required
            />
          </div>

          <div>
            <Label htmlFor="communityId">Community</Label>
            <Select name="communityId">
              <SelectTrigger>
                <SelectValue placeholder="Select community (optional)" />
              </SelectTrigger>
              <SelectContent>
                {communities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the floorplan, its highlights, and key features..."
              rows={3}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Specifications</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="1"
                placeholder="3"
                required
              />
            </div>

            <div>
              <Label htmlFor="bathrooms">Full Bathrooms *</Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                step="0.5"
                min="1"
                placeholder="2"
                required
              />
            </div>

            <div>
              <Label htmlFor="halfBaths">Half Baths</Label>
              <Input
                id="halfBaths"
                name="halfBaths"
                type="number"
                min="0"
                defaultValue="0"
              />
            </div>

            <div>
              <Label htmlFor="squareFeet">Square Feet *</Label>
              <Input
                id="squareFeet"
                name="squareFeet"
                type="number"
                min="500"
                placeholder="2500"
                required
              />
            </div>

            <div>
              <Label htmlFor="stories">Stories</Label>
              <Select name="stories" defaultValue="1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Story</SelectItem>
                  <SelectItem value="2">2 Stories</SelectItem>
                  <SelectItem value="3">3 Stories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="garageSpaces">Garage Spaces</Label>
              <Select name="garageSpaces" defaultValue="2">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No Garage</SelectItem>
                  <SelectItem value="1">1 Car</SelectItem>
                  <SelectItem value="2">2 Car</SelectItem>
                  <SelectItem value="3">3 Car</SelectItem>
                  <SelectItem value="4">4 Car</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Pricing & Status</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="basePrice">Base Price *</Label>
              <Input
                id="basePrice"
                name="basePrice"
                type="number"
                min="0"
                placeholder="450000"
                required
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="active">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Features</h3>
          <div>
            <Label htmlFor="features">Key Features</Label>
            <Textarea
              id="features"
              name="features"
              placeholder="Open concept layout, Gourmet kitchen, Master suite with walk-in closet, Covered patio..."
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate features with commas
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => (document.querySelector("form") as HTMLFormElement)?.reset()}
        >
          Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Floorplan"}
        </Button>
      </div>
    </form>
  );
}
