"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface AddCompetitorFormProps {
  organizationId: string;
}

interface CommunityInput {
  name: string;
  city: string;
  state: string;
  startingPrice: string;
}

export function AddCompetitorForm({ organizationId }: AddCompetitorFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [communities, setCommunities] = useState<CommunityInput[]>([
    { name: "", city: "", state: "", startingPrice: "" },
  ]);

  function addCommunity() {
    setCommunities([
      ...communities,
      { name: "", city: "", state: "", startingPrice: "" },
    ]);
  }

  function removeCommunity(index: number) {
    setCommunities(communities.filter((_, i) => i !== index));
  }

  function updateCommunity(
    index: number,
    field: keyof CommunityInput,
    value: string
  ) {
    const updated = [...communities];
    updated[index][field] = value;
    setCommunities(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          name,
          website: website || null,
          description: description || null,
          communities: communities
            .filter((c) => c.name.trim())
            .map((c) => ({
              name: c.name,
              city: c.city || null,
              state: c.state || null,
              startingPrice: c.startingPrice
                ? parseFloat(c.startingPrice)
                : null,
            })),
        }),
      });

      if (response.ok) {
        setName("");
        setWebsite("");
        setDescription("");
        setCommunities([{ name: "", city: "", state: "", startingPrice: "" }]);
        router.refresh();
      }
    } catch (error) {
      console.error("Error adding competitor:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Competitor Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Lennar, DR Horton"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Notes</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Any notes about this competitor..."
          rows={2}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Communities (Optional)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addCommunity}>
            <Plus className="mr-2 h-4 w-4" />
            Add Community
          </Button>
        </div>

        {communities.map((community, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-lg border bg-gray-50 p-4 md:grid-cols-5"
          >
            <div className="space-y-2 md:col-span-2">
              <Label>Community Name</Label>
              <Input
                value={community.name}
                onChange={(e) => updateCommunity(index, "name", e.target.value)}
                placeholder="Community name"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={community.city}
                onChange={(e) => updateCommunity(index, "city", e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={community.state}
                onChange={(e) => updateCommunity(index, "state", e.target.value)}
                placeholder="FL"
                maxLength={2}
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-2">
                <Label>Starting Price</Label>
                <Input
                  type="number"
                  value={community.startingPrice}
                  onChange={(e) =>
                    updateCommunity(index, "startingPrice", e.target.value)
                  }
                  placeholder="400000"
                />
              </div>
              {communities.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCommunity(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isLoading || !name.trim()}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add Competitor"
        )}
      </Button>
    </form>
  );
}
