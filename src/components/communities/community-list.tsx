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
  MapPin,
  Home,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Building2,
  Tag,
} from "lucide-react";

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  status: string;
  startingPrice: number | null;
  priceRange: string | null;
  amenities: string | null;
  floorplans: { id: string; name: string; basePrice: number }[];
  inventory: { id: string; status: string }[];
  leads: { id: string }[];
  incentives: { id: string; title: string }[];
}

interface CommunityListProps {
  communities: Community[];
}

export function CommunityList({ communities }: CommunityListProps) {
  const [editCommunity, setEditCommunity] = useState<Community | null>(null);
  const [deleteCommunity, setDeleteCommunity] = useState<Community | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editCommunity) return;

    setIsEditing(true);
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/communities/${editCommunity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          city: formData.get("city"),
          state: formData.get("state"),
          zipCode: formData.get("zipCode"),
          status: formData.get("status"),
          startingPrice: formData.get("startingPrice") ? parseFloat(formData.get("startingPrice") as string) : null,
        }),
      });

      if (response.ok) {
        setEditCommunity(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update community:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCommunity) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/communities/${deleteCommunity.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteCommunity(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to delete community:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "coming_soon":
        return "bg-blue-100 text-blue-800";
      case "sold_out":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (communities.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No communities yet</h3>
        <p className="mt-2 text-gray-500">
          Get started by adding your first community.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {communities.map((community) => (
          <div
            key={community.id}
            className="border rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{community.name}</h3>
                  <Badge className={getStatusColor(community.status)}>
                    {community.status.replace("_", " ")}
                  </Badge>
                </div>

                {community.description && (
                  <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                    {community.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                  {(community.city || community.state) && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {[community.city, community.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}

                  {community.startingPrice && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span>From {formatPrice(community.startingPrice)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span>{community.floorplans.length} floorplans</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>
                      {community.inventory.filter(i => i.status === "available").length} available homes
                    </span>
                  </div>

                  {community.incentives.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      <span>{community.incentives.length} active incentives</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditCommunity(community)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => setDeleteCommunity(community)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editCommunity} onOpenChange={() => setEditCommunity(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Community</DialogTitle>
            <DialogDescription>
              Update the community information
            </DialogDescription>
          </DialogHeader>
          {editCommunity && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editCommunity.name}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editCommunity.description || ""}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={editCommunity.city || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={editCommunity.state || ""}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    defaultValue={editCommunity.zipCode || ""}
                  />
                </div>
                <div>
                  <Label htmlFor="startingPrice">Starting Price</Label>
                  <Input
                    id="startingPrice"
                    name="startingPrice"
                    type="number"
                    defaultValue={editCommunity.startingPrice || ""}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={editCommunity.status}>
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

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditCommunity(null)}
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
      <Dialog open={!!deleteCommunity} onOpenChange={() => setDeleteCommunity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Community</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteCommunity?.name}&quot;? This will also delete all associated floorplans, inventory homes, and leads. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteCommunity(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Community"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
