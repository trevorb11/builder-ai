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

interface AddCommunityFormProps {
  organizationId: string;
}

export function AddCommunityForm({ organizationId }: AddCommunityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          address: formData.get("address"),
          city: formData.get("city"),
          state: formData.get("state"),
          zipCode: formData.get("zipCode"),
          status: formData.get("status"),
          startingPrice: formData.get("startingPrice")
            ? parseFloat(formData.get("startingPrice") as string)
            : null,
          priceRange: formData.get("priceRange"),
          hoaFee: formData.get("hoaFee")
            ? parseFloat(formData.get("hoaFee") as string)
            : null,
          amenities: formData.get("amenities"),
          organizationId,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Community created successfully!");
        (e.target as HTMLFormElement).reset();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.error || "Failed to create community");
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
          <div className="md:col-span-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Sunrise Estates"
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the community, its features, and what makes it special..."
              rows={3}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Location</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="Austin"
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                placeholder="TX"
              />
            </div>

            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                placeholder="78701"
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
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  <SelectItem value="sold_out">Sold Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Pricing & Fees</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="startingPrice">Starting Price</Label>
              <Input
                id="startingPrice"
                name="startingPrice"
                type="number"
                placeholder="350000"
              />
            </div>

            <div>
              <Label htmlFor="priceRange">Price Range</Label>
              <Input
                id="priceRange"
                name="priceRange"
                placeholder="$350K - $550K"
              />
            </div>

            <div>
              <Label htmlFor="hoaFee">HOA Fee (Monthly)</Label>
              <Input
                id="hoaFee"
                name="hoaFee"
                type="number"
                placeholder="150"
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Community Features</h3>
          <div>
            <Label htmlFor="amenities">Amenities</Label>
            <Textarea
              id="amenities"
              name="amenities"
              placeholder="Pool, Clubhouse, Walking Trails, Playground, Tennis Courts..."
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate amenities with commas
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
          {isSubmitting ? "Creating..." : "Create Community"}
        </Button>
      </div>
    </form>
  );
}
