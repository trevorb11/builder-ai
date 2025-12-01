"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface LeadFiltersProps {
  communities: { id: string; name: string }[];
  floorplans: { id: string; name: string }[];
}

export function LeadFilters({ communities, floorplans }: LeadFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("?");
  };

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name or email..."
          className="pl-9"
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => handleFilter("search", e.target.value)}
        />
      </div>

      <Select
        defaultValue={searchParams.get("status") || "all"}
        onValueChange={(value) => handleFilter("status", value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="qualified">Qualified</SelectItem>
          <SelectItem value="nurturing">Nurturing</SelectItem>
          <SelectItem value="closed_won">Won</SelectItem>
          <SelectItem value="closed_lost">Lost</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("source") || "all"}
        onValueChange={(value) => handleFilter("source", value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="website_chat">Website Chat</SelectItem>
          <SelectItem value="realtor_portal">Realtor Portal</SelectItem>
          <SelectItem value="direct">Direct</SelectItem>
        </SelectContent>
      </Select>

      {communities.length > 0 && (
        <Select
          defaultValue={searchParams.get("community") || "all"}
          onValueChange={(value) => handleFilter("community", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Community" />
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
      )}

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
