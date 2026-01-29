"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Copy,
  Check,
  Save,
  RefreshCw,
  Sparkles,
  Wand2,
  FileText,
  AlertCircle,
} from "lucide-react";

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

const tones = [
  { id: "professional", name: "Professional", description: "Polished and business-like" },
  { id: "friendly", name: "Friendly", description: "Warm and approachable" },
  { id: "enthusiastic", name: "Enthusiastic", description: "Energetic and exciting" },
  { id: "informative", name: "Informative", description: "Educational and helpful" },
  { id: "luxury", name: "Luxury", description: "Elegant and sophisticated" },
];

const quickTemplates = [
  {
    id: "new_community_launch",
    name: "New Community Launch",
    contentType: "social_post",
    platform: "facebook",
    context: "Announce a new community opening with emphasis on lifestyle, amenities, and location benefits. Include a call to action for early interest registration.",
  },
  {
    id: "qmi_spotlight",
    name: "Quick Move-In Spotlight",
    contentType: "listing",
    platform: "qmi",
    context: "Highlight a specific quick move-in home with focus on immediate availability, included upgrades, and the benefits of moving in quickly.",
  },
  {
    id: "open_house_invite",
    name: "Open House Invitation",
    contentType: "social_post",
    platform: "instagram",
    context: "Create an engaging open house invitation with event details, what visitors can expect, and incentives for attending.",
  },
  {
    id: "monthly_incentive",
    name: "Monthly Incentive",
    contentType: "email",
    platform: "announcement",
    context: "Promote current monthly incentives including rate buy-downs, closing cost assistance, or upgrade credits. Create urgency with limited time offer.",
  },
  {
    id: "realtor_co_op",
    name: "Realtor Co-Op Update",
    contentType: "realtor_email",
    platform: "co_op_announcement",
    context: "Update real estate agents about new co-op commission rates, available homes, and upcoming agent events.",
  },
  {
    id: "community_blog",
    name: "Community Spotlight Blog",
    contentType: "blog",
    platform: "community_spotlight",
    context: "Write an SEO-friendly blog post highlighting a community's unique features, local attractions, schools, and lifestyle benefits.",
  },
];

const platformOptions: Record<string, string[]> = {
  social_post: ["facebook", "instagram", "linkedin"],
  email: ["nurture", "announcement", "follow_up", "re_engagement"],
  blog: ["seo_article", "community_spotlight", "market_update"],
  listing: ["qmi", "inventory", "mls"],
  ad_copy: ["facebook", "google", "instagram"],
  realtor_email: ["co_op_announcement", "inventory_update", "event_invite"],
};

const characterLimits: Record<string, number> = {
  facebook: 500,
  instagram: 2200,
  linkedin: 3000,
  google: 90,
};

export function MarketingContentGenerator({
  organizationId,
  communities,
  floorplans,
  contentTypes,
}: MarketingContentGeneratorProps) {
  const [contentType, setContentType] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("all");
  const [selectedFloorplan, setSelectedFloorplan] = useState("all");
  const [additionalContext, setAdditionalContext] = useState("");
  const [platform, setPlatform] = useState("");
  const [tone, setTone] = useState("professional");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [variationCount, setVariationCount] = useState(1);
  const [currentVariation, setCurrentVariation] = useState(0);
  const [variations, setVariations] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState("");

  const characterLimit = characterLimits[platform] || 0;
  const isOverLimit = characterLimit > 0 && generatedContent.length > characterLimit;

  function handleTemplateSelect(templateId: string) {
    const template = quickTemplates.find((t) => t.id === templateId);
    if (template) {
      setContentType(template.contentType);
      setPlatform(template.platform);
      setAdditionalContext(template.context);
    }
  }

  async function handleGenerate() {
    if (!contentType) return;

    setIsLoading(true);
    setGeneratedContent("");
    setSaved(false);
    setVariations([]);

    try {
      const response = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          contentType,
          platform,
          communityId: selectedCommunity === "all" ? undefined : selectedCommunity,
          floorplanId: selectedFloorplan === "all" ? undefined : selectedFloorplan,
          additionalContext,
          tone,
          variationCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.variations)) {
          setVariations(data.variations);
          setGeneratedContent(data.variations[0] || "");
          setCurrentVariation(0);
        } else {
          setGeneratedContent(data.content);
          setVariations([data.content]);
        }
      }
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNextVariation() {
    if (currentVariation < variations.length - 1) {
      const next = currentVariation + 1;
      setCurrentVariation(next);
      setGeneratedContent(variations[next]);
    }
  }

  function handlePrevVariation() {
    if (currentVariation > 0) {
      const prev = currentVariation - 1;
      setCurrentVariation(prev);
      setGeneratedContent(variations[prev]);
    }
  }

  async function handleRegenerate() {
    await handleGenerate();
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
          title: customTitle || `${contentTypes.find((t) => t.id === contentType)?.name} - ${new Date().toLocaleDateString()}`,
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
      {/* Quick Templates */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-purple-500" />
          Quick Templates
        </Label>
        <div className="flex flex-wrap gap-2">
          {quickTemplates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              size="sm"
              onClick={() => handleTemplateSelect(template.id)}
              className="text-xs"
            >
              {template.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Type & Platform */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Content Type *</Label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select content type..." />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex flex-col">
                    <span>{type.name}</span>
                    <span className="text-xs text-gray-500">{type.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {contentType && platformOptions[contentType] && (
          <div className="space-y-2">
            <Label>Platform / Style</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform..." />
              </SelectTrigger>
              <SelectContent>
                {platformOptions[contentType].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Tone & Variations */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue placeholder="Select tone..." />
            </SelectTrigger>
            <SelectContent>
              {tones.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex flex-col">
                    <span>{t.name}</span>
                    <span className="text-xs text-gray-500">{t.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Variations</Label>
          <Select value={variationCount.toString()} onValueChange={(v) => setVariationCount(parseInt(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 version</SelectItem>
              <SelectItem value="2">2 versions</SelectItem>
              <SelectItem value="3">3 versions</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Community & Floorplan */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Community (Optional)</Label>
          <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
            <SelectTrigger>
              <SelectValue placeholder="Select community..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Communities</SelectItem>
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
              <SelectItem value="all">All Floorplans</SelectItem>
              {floorplans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} ({plan.bedrooms}bd/{plan.bathrooms}ba)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional Context */}
      <div className="space-y-2">
        <Label>Additional Context</Label>
        <Textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="Add specific details, promotions, key messages, or focus areas..."
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-gray-500">
          The more context you provide, the better the generated content will be.
        </p>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!contentType || isLoading}
        className="w-full gap-2"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Content
          </>
        )}
      </Button>

      {/* Generated Content */}
      {generatedContent && (
        <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <Label className="font-semibold">Generated Content</Label>
              {variations.length > 1 && (
                <Badge variant="secondary" className="text-xs">
                  {currentVariation + 1} of {variations.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {variations.length > 1 && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePrevVariation}
                    disabled={currentVariation === 0}
                  >
                    ← Prev
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleNextVariation}
                    disabled={currentVariation === variations.length - 1}
                  >
                    Next →
                  </Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={handleRegenerate} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Character Count */}
          {characterLimit > 0 && (
            <div className={`flex items-center gap-2 text-xs ${isOverLimit ? "text-red-600" : "text-gray-500"}`}>
              {isOverLimit && <AlertCircle className="h-3 w-3" />}
              <span>
                {generatedContent.length} / {characterLimit} characters
                {isOverLimit && " (over limit)"}
              </span>
            </div>
          )}

          {/* Content Editor */}
          <Textarea
            value={generatedContent}
            onChange={(e) => setGeneratedContent(e.target.value)}
            rows={10}
            className="bg-white font-mono text-sm"
          />

          {/* Custom Title for Saving */}
          <div className="space-y-2">
            <Label className="text-xs text-gray-500">Title (for saving)</Label>
            <Input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={`${contentTypes.find((t) => t.id === contentType)?.name} - ${new Date().toLocaleDateString()}`}
              className="text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCopy} className="flex-1 gap-2">
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </>
              )}
            </Button>
            <Button onClick={handleSave} disabled={saved} className="flex-1 gap-2">
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved to Library
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save to Library
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
