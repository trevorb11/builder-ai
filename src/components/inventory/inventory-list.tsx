"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MapPin,
  Home,
  DollarSign,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  ExternalLink,
  Tag,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Bed,
  Bath,
  Square,
  Filter,
  X,
} from "lucide-react";

interface InventoryHome {
  id: string;
  lot: string | null;
  block: string | null;
  address: string | null;
  price: number;
  status: string;
  moveInDate: string | null;
  completionDate: string | null;
  features: string | null;
  mlsNumber: string | null;
  virtualTourUrl: string | null;
  specialNotes: string | null;
  community: {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  };
  floorplan: {
    id: string;
    name: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    basePrice: number;
  };
}

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

interface InventoryListProps {
  inventory: InventoryHome[];
  communities: Community[];
  floorplans: Floorplan[];
}

export function InventoryList({ inventory, communities, floorplans }: InventoryListProps) {
  const [items, setItems] = useState(inventory);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editItem, setEditItem] = useState<InventoryHome | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryHome | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Filters
  const [communityFilter, setCommunityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Apply filters
  const filteredItems = items.filter((item) => {
    if (communityFilter !== "all" && item.community.id !== communityFilter) {
      return false;
    }
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredItems.map((item) => item.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIds.size === 0) return;

    setIsBulkUpdating(true);
    try {
      const response = await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Update local state
        setItems((prev) =>
          prev.map((item) =>
            selectedIds.has(item.id) ? { ...item, status: newStatus } : item
          )
        );
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error("Failed to bulk update:", error);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;

    setIsEditing(true);
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/inventory/${editItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          communityId: formData.get("communityId"),
          floorplanId: formData.get("floorplanId"),
        }),
      });

      if (response.ok) {
        setEditItem(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update inventory:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/inventory/${deleteItem.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));
        setDeleteItem(null);
      }
    } catch (error) {
      console.error("Failed to delete inventory:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      available: {
        label: "Available",
        className: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock className="h-3 w-3" />,
      },
      sold: {
        label: "Sold",
        className: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <XCircle className="h-3 w-3" />,
      },
      model: {
        label: "Model",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Home className="h-3 w-3" />,
      },
    };

    const config = statusConfig[status] || statusConfig.available;

    return (
      <Badge className={`${config.className} flex items-center gap-1 font-medium`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const parseFeatures = (featuresJson: string | null): string[] => {
    if (!featuresJson) return [];
    try {
      return JSON.parse(featuresJson);
    } catch {
      return [];
    }
  };

  const clearFilters = () => {
    setCommunityFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters = communityFilter !== "all" || statusFilter !== "all";

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
        <Home className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No inventory homes yet</h3>
        <p className="mt-2 text-gray-500">
          Add your first quick move-in or spec home to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filters & Bulk Actions Bar */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? "border-blue-500 text-blue-600" : ""}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                {(communityFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.size} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" disabled={isBulkUpdating}>
                  {isBulkUpdating ? "Updating..." : "Change Status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate("available")}>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                  Mark as Available
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate("pending")}>
                  <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate("sold")}>
                  <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                  Mark as Sold
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate("model")}>
                  <Home className="h-4 w-4 mr-2 text-blue-600" />
                  Mark as Model
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds(new Set())}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Community</Label>
              <Select value={communityFilter} onValueChange={setCommunityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All communities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Communities</SelectItem>
                  {communities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="model">Model</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Select All */}
      <div className="mb-2 flex items-center gap-2 px-2">
        <Checkbox
          id="select-all"
          checked={selectedIds.size === filteredItems.length && filteredItems.length > 0}
          onCheckedChange={handleSelectAll}
        />
        <Label htmlFor="select-all" className="text-sm text-gray-500 cursor-pointer">
          Select all ({filteredItems.length})
        </Label>
      </div>

      {/* Inventory List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`border rounded-lg p-4 transition-all ${
              selectedIds.has(item.id)
                ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                : "hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-4">
              <Checkbox
                checked={selectedIds.has(item.id)}
                onCheckedChange={(checked) => handleSelectOne(item.id, !!checked)}
                className="mt-1"
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">
                    {item.floorplan.name}
                  </h3>
                  {getStatusBadge(item.status)}
                  {item.mlsNumber && (
                    <Badge variant="outline" className="text-xs">
                      MLS: {item.mlsNumber}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>{item.community.name}</span>
                  </div>
                  {item.lot && (
                    <span className="text-gray-500">
                      Lot {item.lot}{item.block && `, Block ${item.block}`}
                    </span>
                  )}
                  {item.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{item.address}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 font-semibold text-green-700">
                    <DollarSign className="h-4 w-4" />
                    {formatPrice(item.price)}
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Bed className="h-4 w-4" />
                    <span>{item.floorplan.bedrooms} bed</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Bath className="h-4 w-4" />
                    <span>{item.floorplan.bathrooms} bath</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Square className="h-4 w-4" />
                    <span>{item.floorplan.squareFeet.toLocaleString()} sqft</span>
                  </div>
                  {item.moveInDate && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Move-in: {formatDate(item.moveInDate)}</span>
                    </div>
                  )}
                </div>

                {parseFeatures(item.features).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {parseFeatures(item.features).slice(0, 4).map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {feature}
                      </Badge>
                    ))}
                    {parseFeatures(item.features).length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{parseFeatures(item.features).length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {item.virtualTourUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={item.virtualTourUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditItem(item)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteItem(item)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && items.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No inventory homes match your filters.
          <Button variant="link" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Home</DialogTitle>
            <DialogDescription>
              Update the details for this inventory home.
            </DialogDescription>
          </DialogHeader>
          {editItem && (
            <form onSubmit={handleEdit} className="space-y-6">
              {/* Location Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Location & Type</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-communityId">Community</Label>
                    <Select name="communityId" defaultValue={editItem.community.id}>
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label htmlFor="edit-floorplanId">Floorplan</Label>
                    <Select name="floorplanId" defaultValue={editItem.floorplan.id}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {floorplans.map((floorplan) => (
                          <SelectItem key={floorplan.id} value={floorplan.id}>
                            {floorplan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="edit-lot">Lot #</Label>
                    <Input
                      id="edit-lot"
                      name="lot"
                      defaultValue={editItem.lot || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-block">Block</Label>
                    <Input
                      id="edit-block"
                      name="block"
                      defaultValue={editItem.block || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select name="status" defaultValue={editItem.status}>
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
                  <Label htmlFor="edit-address">Street Address</Label>
                  <Input
                    id="edit-address"
                    name="address"
                    defaultValue={editItem.address || ""}
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Pricing & Dates</h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="edit-price">Price *</Label>
                    <Input
                      id="edit-price"
                      name="price"
                      type="number"
                      min="0"
                      step="1000"
                      defaultValue={editItem.price}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-moveInDate">Move-In Date</Label>
                    <Input
                      id="edit-moveInDate"
                      name="moveInDate"
                      type="date"
                      defaultValue={editItem.moveInDate || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-completionDate">Completion Date</Label>
                    <Input
                      id="edit-completionDate"
                      name="completionDate"
                      type="date"
                      defaultValue={editItem.completionDate || ""}
                    />
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Details & Features</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="edit-mlsNumber">MLS Number</Label>
                    <Input
                      id="edit-mlsNumber"
                      name="mlsNumber"
                      defaultValue={editItem.mlsNumber || ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-virtualTourUrl">Virtual Tour URL</Label>
                    <Input
                      id="edit-virtualTourUrl"
                      name="virtualTourUrl"
                      type="url"
                      defaultValue={editItem.virtualTourUrl || ""}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-features">Included Features & Upgrades</Label>
                  <Textarea
                    id="edit-features"
                    name="features"
                    defaultValue={parseFeatures(editItem.features).join(", ")}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate features with commas
                  </p>
                </div>

                <div>
                  <Label htmlFor="edit-specialNotes">Special Notes</Label>
                  <Textarea
                    id="edit-specialNotes"
                    name="specialNotes"
                    defaultValue={editItem.specialNotes || ""}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditItem(null)}
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
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Inventory Home</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inventory home?
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{deleteItem?.floorplan.name}</p>
                <p className="text-sm text-gray-600">
                  {deleteItem?.community.name}
                  {deleteItem?.lot && ` - Lot ${deleteItem.lot}`}
                </p>
              </div>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteItem(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
