"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  Copy,
} from "lucide-react";
import { useState } from "react";

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
  };
}

interface InventoryListProps {
  inventoryHomes: InventoryHome[];
}

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  sold: "bg-blue-100 text-blue-800",
  model: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  pending: "Pending",
  sold: "Sold",
  model: "Model Home",
};

export function InventoryList({ inventoryHomes }: InventoryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const filteredHomes = inventoryHomes.filter((home) => {
    const matchesSearch =
      home.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      home.community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      home.floorplan.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || home.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (inventoryHomes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Home className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="font-medium text-gray-900 mb-1">No inventory homes</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          Add your first move-in ready home to start showcasing available inventory to buyers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by address, community, or floorplan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            All
          </Button>
          <Button
            variant={statusFilter === "available" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("available")}
          >
            Available
          </Button>
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
        </div>
      </div>

      {/* Home Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredHomes.map((home) => {
          const features = home.features ? JSON.parse(home.features) : [];

          return (
            <div
              key={home.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <Badge className={statusColors[home.status]}>
                    {statusLabels[home.status] || home.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Home
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Listing
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

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    ${home.price.toLocaleString()}
                  </span>
                  {home.lot && (
                    <span className="text-sm text-gray-500">
                      Lot {home.lot}{home.block ? `, Block ${home.block}` : ""}
                    </span>
                  )}
                </div>

                {/* Address */}
                {home.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                    <div>
                      <p className="font-medium">{home.address}</p>
                      <p className="text-gray-500">
                        {home.community.city}, {home.community.state}
                      </p>
                    </div>
                  </div>
                )}

                {/* Floorplan & Community */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Floorplan</span>
                    <span className="font-medium text-gray-900">{home.floorplan.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Community</span>
                    <span className="font-medium text-gray-900">{home.community.name}</span>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Bed className="h-4 w-4" />
                    <span>{home.floorplan.bedrooms} beds</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Bath className="h-4 w-4" />
                    <span>{home.floorplan.bathrooms} baths</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Square className="h-4 w-4" />
                    <span>{home.floorplan.squareFeet.toLocaleString()} sqft</span>
                  </div>
                </div>

                {/* Move-in Date */}
                {home.moveInDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">Move-in: </span>
                    <span className="font-medium text-green-700">{home.moveInDate}</span>
                  </div>
                )}

                {/* Features */}
                {features.length > 0 && (
                  <div className="pt-2">
                    <div className="flex flex-wrap gap-1">
                      {features.slice(0, 3).map((feature: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700"
                        >
                          {feature}
                        </span>
                      ))}
                      {features.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* MLS Number */}
                {home.mlsNumber && (
                  <div className="text-xs text-gray-400">
                    MLS: {home.mlsNumber}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <Button variant="outline" className="w-full" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredHomes.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No homes match your search criteria.</p>
        </div>
      )}
    </div>
  );
}
