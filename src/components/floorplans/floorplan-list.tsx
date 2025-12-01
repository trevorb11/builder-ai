"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Home,
  Bed,
  Bath,
  Maximize,
  DollarSign,
  Edit,
  Trash2,
  Building2,
  Car,
  Layers,
} from "lucide-react";

interface Floorplan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bedrooms: number;
  bathrooms: number;
  halfBaths: number;
  squareFeet: number;
  stories: number;
  garageSpaces: number;
  basePrice: number;
  status: string;
  features: string | null;
  community: { id: string; name: string } | null;
  inventory: { id: string; status: string }[];
  leads: { id: string }[];
}

interface Community {
  id: string;
  name: string;
}

interface FloorplanListProps {
  floorplans: Floorplan[];
  communities: Community[];
}

export function FloorplanList({ floorplans, communities }: FloorplanListProps) {
  const [editFloorplan, setEditFloorplan] = useState<Floorplan | null>(null);
  const [deleteFloorplan, setDeleteFloorplan] = useState<Floorplan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editFloorplan) return;

    setIsEditing(true);
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/floorplans/${editFloorplan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          bedrooms: parseInt(formData.get("bedrooms") as string),
          bathrooms: parseFloat(formData.get("bathrooms") as string),
          squareFeet: parseInt(formData.get("squareFeet") as string),
          basePrice: parseFloat(formData.get("basePrice") as string),
          status: formData.get("status"),
          communityId: formData.get("communityId") || null,
        }),
      });

      if (response.ok) {
        setEditFloorplan(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update floorplan:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteFloorplan) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/floorplans/${deleteFloorplan.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteFloorplan(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to delete floorplan:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "coming_soon":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (floorplans.length === 0) {
    return (
      <div className="text-center py-12">
        <Home className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No floorplans yet</h3>
        <p className="mt-2 text-gray-500">
          Get started by adding your first floorplan.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {floorplans.map((floorplan) => (
          <div
            key={floorplan.id}
            className="border rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{floorplan.name}</h3>
                {floorplan.community && (
                  <p className="text-sm text-gray-500">{floorplan.community.name}</p>
                )}
              </div>
              <Badge className={getStatusColor(floorplan.status)}>
                {floorplan.status}
              </Badge>
            </div>

            <div className="text-2xl font-bold text-primary mb-3">
              {formatPrice(floorplan.basePrice)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{floorplan.bedrooms} beds</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{floorplan.bathrooms} baths</span>
              </div>
              <div className="flex items-center gap-1">
                <Maximize className="h-4 w-4" />
                <span>{floorplan.squareFeet.toLocaleString()} sq ft</span>
              </div>
              <div className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                <span>{floorplan.stories} {floorplan.stories === 1 ? "story" : "stories"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                <span>{floorplan.garageSpaces} car garage</span>
              </div>
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>
                  {floorplan.inventory.filter(i => i.status === "available").length} available
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setEditFloorplan(floorplan)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => setDeleteFloorplan(floorplan)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editFloorplan} onOpenChange={() => setEditFloorplan(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Floorplan</DialogTitle>
            <DialogDescription>
              Update the floorplan information
            </DialogDescription>
          </DialogHeader>
          {editFloorplan && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="name">Floorplan Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editFloorplan.name}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editFloorplan.description || ""}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="communityId">Community</Label>
                <Select name="communityId" defaultValue={editFloorplan.community?.id || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select community" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No community</SelectItem>
                    {communities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    defaultValue={editFloorplan.bedrooms}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    step="0.5"
                    defaultValue={editFloorplan.bathrooms}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="squareFeet">Square Feet</Label>
                  <Input
                    id="squareFeet"
                    name="squareFeet"
                    type="number"
                    defaultValue={editFloorplan.squareFeet}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="basePrice">Base Price</Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    defaultValue={editFloorplan.basePrice}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editFloorplan.status}>
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

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditFloorplan(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isEditing}>
                  {isEditing ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteFloorplan} onOpenChange={() => setDeleteFloorplan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Floorplan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteFloorplan?.name}&quot;? This will also delete all associated inventory homes. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteFloorplan(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Floorplan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
