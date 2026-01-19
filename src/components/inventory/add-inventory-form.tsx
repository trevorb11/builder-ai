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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, Plus, Home } from "lucide-react";

interface Community {
  id: string;
  name: string;
}

interface Floorplan {
  id: string;
  name: string;
  basePrice: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  communityId: string | null;
}

interface AddInventoryFormProps {
  communities: Community[];
  floorplans: Floorplan[];
  onSuccess?: () => void;
}

export function AddInventoryForm({ communities, floorplans, onSuccess }: AddInventoryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [selectedFloorplan, setSelectedFloorplan] = useState<string>("");

  // Filter floorplans based on selected community
  const filteredFloorplans = selectedCommunity
    ? floorplans.filter(
        (fp) => !fp.communityId || fp.communityId === selectedCommunity
      )
    : floorplans;

  // Get suggested price from selected floorplan
  const suggestedPrice = selectedFloorplan
    ? floorplans.find((fp) => fp.id === selectedFloorplan)?.basePrice
    : undefined;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: formData.get("communityId"),
          floorplanId: formData.get("floorplanId"),
          lot: formData.get("lot") || null,
          block: formData.get("block") || null,
          address: formData.get("address") || null,
          price: parseFloat(formData.get("price") as string),
          status: formData.get("status"),
          moveInDate: formData.get("moveInDate") || null,
          completionDate: formData.get("completionDate") || null,
          mlsNumber: formData.get("mlsNumber") || null,
          virtualTourUrl: formData.get("virtualTourUrl") || null,
          features: formData.get("features") || null,
          specialNotes: formData.get("specialNotes") || null,
        }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Inventory home added successfully!");
        (e.target as HTMLFormElement).reset();
        setSelectedCommunity("");
        setSelectedFloorplan("");
        setTimeout(() => {
          setIsOpen(false);
          setStatus("idle");
          onSuccess?.();
        }, 1500);
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.error || "Failed to add inventory home");
      }
    } catch {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setStatus("idle");
      setMessage("");
      setSelectedCommunity("");
      setSelectedFloorplan("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Inventory Home
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Add Inventory Home
          </DialogTitle>
          <DialogDescription>
            Add a new quick move-in home or spec home to your inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Location Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2">Location & Type</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="communityId">Community *</Label>
                <Select
                  name="communityId"
                  value={selectedCommunity}
                  onValueChange={setSelectedCommunity}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select community" />
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

              <div>
                <Label htmlFor="floorplanId">Floorplan *</Label>
                <Select
                  name="floorplanId"
                  value={selectedFloorplan}
                  onValueChange={setSelectedFloorplan}
                  required
                  disabled={!selectedCommunity}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedCommunity ? "Select floorplan" : "Select community first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredFloorplans.map((floorplan) => (
                      <SelectItem key={floorplan.id} value={floorplan.id}>
                        {floorplan.name} ({floorplan.bedrooms}bd/{floorplan.bathrooms}ba, {floorplan.squareFeet.toLocaleString()} sqft)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="lot">Lot #</Label>
                <Input
                  id="lot"
                  name="lot"
                  placeholder="e.g., 42"
                />
              </div>

              <div>
                <Label htmlFor="block">Block</Label>
                <Input
                  id="block"
                  name="block"
                  placeholder="e.g., A"
                />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
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
            </div>

            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="e.g., 123 Oak Street"
              />
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2">Pricing & Dates</h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder={suggestedPrice ? suggestedPrice.toString() : "e.g., 425000"}
                  defaultValue={suggestedPrice}
                  required
                />
                {suggestedPrice && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Base price: ${suggestedPrice.toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="moveInDate">Move-In Date</Label>
                <Input
                  id="moveInDate"
                  name="moveInDate"
                  type="date"
                />
              </div>

              <div>
                <Label htmlFor="completionDate">Completion Date</Label>
                <Input
                  id="completionDate"
                  name="completionDate"
                  type="date"
                />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2">Details & Features</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="mlsNumber">MLS Number</Label>
                <Input
                  id="mlsNumber"
                  name="mlsNumber"
                  placeholder="e.g., MLS123456"
                />
              </div>

              <div>
                <Label htmlFor="virtualTourUrl">Virtual Tour URL</Label>
                <Input
                  id="virtualTourUrl"
                  name="virtualTourUrl"
                  type="url"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="features">Included Features & Upgrades</Label>
              <Textarea
                id="features"
                name="features"
                placeholder="Hardwood floors, Granite countertops, Smart home package, Extended patio..."
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate features with commas
              </p>
            </div>

            <div>
              <Label htmlFor="specialNotes">Special Notes</Label>
              <Textarea
                id="specialNotes"
                name="specialNotes"
                placeholder="Any special notes about this home..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Inventory Home"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
