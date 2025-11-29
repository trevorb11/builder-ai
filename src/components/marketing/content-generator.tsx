"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Copy, Check, Save } from "lucide-react";

interface ContentType {
  id: string;
  name: string;
  description: string;
}

interface Community {
  id: string;
  name: string;
}

interface Floorplan {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
}

interface MarketingContentGeneratorProps {
  organizationId: string;
  communities: Community[];
  floorplans: Floorplan[];
  contentTypes: ContentType[];
}

export function MarketingContentGenerator({
  organizationId,
  communities,
  floorplans,
  contentTypes,
}: MarketingContentGeneratorProps) {
  const [contentType, setContentType] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedFloorplan, setSelectedFloorplan] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [platform, setPlatform] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const platformOptions = {
    social_post: ["facebook", "instagram", "linkedin"],
    email: ["nurture", "announcement", "follow_up", "re_engagement"],
    blog: ["seo_article", "community_spotlight", "market_update"],
    listing: ["qmi", "inventory", "mls"],
    ad_copy: ["facebook", "google", "instagram"],
    realtor_email: ["co_op_announcement", "inventory_update", "event_invite"],
  };

  async function handleGenerate() {
    if (!contentType) return;

    setIsLoading(true);
    setGeneratedContent("");
    setSaved(false);

    try {
      const response = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          contentType,
          platform,
          communityId: selectedCommunity,
          floorplanId: selectedFloorplan,
          additionalContext,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
      }
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSave() {
    try {
      const response = await fetch("/api/marketing/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          type: contentType,
          platform,
          content: generatedContent,
          title: `${contentTypes.find((t) => t.id === contentType)?.name} - ${new Date().toLocaleDateString()}`,
        }),
      });

      if (response.ok) {
        setSaved(true);
      }
    } catch (error) {
      console.error("Error saving content:", error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Content Type</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type..." />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {contentType && platformOptions[contentType as keyof typeof platformOptions] && (
          <div className="space-y-2">
            <Label>Platform / Style</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform..." />
              </SelectTrigger>
              <SelectContent>
                {platformOptions[contentType as keyof typeof platformOptions].map(
                  (p) => (
                    <SelectItem key={p} value={p}>
                      {p.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Community (Optional)</Label>
          <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
            <SelectTrigger>
              <SelectValue placeholder="Select community..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Communities</SelectItem>
              {communities.map((community) => (
                <SelectItem key={community.id} value={community.id}>
                  {community.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Floorplan (Optional)</Label>
          <Select value={selectedFloorplan} onValueChange={setSelectedFloorplan}>
            <SelectTrigger>
              <SelectValue placeholder="Select floorplan..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Floorplans</SelectItem>
              {floorplans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} ({plan.bedrooms}bd/{plan.bathrooms}ba)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Additional Context (Optional)</Label>
        <Textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="Add any specific details, promotions, or focus areas you want to include..."
          rows={3}
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!contentType || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Content"
        )}
      </Button>

      {generatedContent && (
        <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <Label>Generated Content</Label>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={handleSave} disabled={saved}>
                {saved ? (
                  <>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
          <Textarea
            value={generatedContent}
            onChange={(e) => setGeneratedContent(e.target.value)}
            rows={10}
            className="bg-white"
          />
        </div>
      )}
    </div>
  );
}
