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
  ChevronLeft,
  ChevronRight,
  Instagram,
  Mail,
  Megaphone,
  Users,
  FileEdit,
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
    icon: Sparkles,
    contentType: "social_post",
    platform: "facebook",
    context: "Announce a new community opening with emphasis on lifestyle, amenities, and location benefits. Include a call to action for early interest registration.",
    description: "Social post announcing a new community",
  },
  {
    id: "qmi_spotlight",
    name: "Quick Move-In Spotlight",
    icon: FileEdit,
    contentType: "listing",
    platform: "qmi",
    context: "Highlight a specific quick move-in home with focus on immediate availability, included upgrades, and the benefits of moving in quickly.",
    description: "Listing for a move-in ready home",
  },
  {
    id: "open_house_invite",
    name: "Open House Invitation",
    icon: Instagram,
    contentType: "social_post",
    platform: "instagram",
    context: "Create an engaging open house invitation with event details, what visitors can expect, and incentives for attending.",
    description: "Instagram post for an open house event",
  },
  {
    id: "monthly_incentive",
    name: "Monthly Incentive",
    icon: Mail,
    contentType: "email",
    platform: "announcement",
    context: "Promote current monthly incentives including rate buy-downs, closing cost assistance, or upgrade credits. Create urgency with limited time offer.",
    description: "Email promoting current buyer incentives",
  },
  {
    id: "realtor_co_op",
    name: "Realtor Co-Op Update",
    icon: Users,
    contentType: "realtor_email",
    platform: "co_op_announcement",
    context: "Update real estate agents about new co-op commission rates, available homes, and upcoming agent events.",
    description: "Email to agents about co-op updates",
  },
  {
    id: "community_blog",
    name: "Community Spotlight Blog",
    icon: FileText,
    contentType: "blog",
    platform: "community_spotlight",
    context: "Write an SEO-friendly blog post highlighting a community's unique features, local attractions, schools, and lifestyle benefits.",
    description: "SEO blog post about a community",
  },
  {
    id: "google_ad",
    name: "Google Search Ad",
    icon: Megaphone,
    contentType: "ad_copy",
    platform: "google",
    context: "Create a concise, high-converting Google Ads headline and description targeting homebuyers searching for new construction homes in the area.",
    description: "Short ad copy for Google Ads",
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

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

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
  const [error, setError] = useState("");
  const [variationCount, setVariationCount] = useState(1);
  const [currentVariation, setCurrentVariation] = useState(0);
  const [variations, setVariations] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState("");
  const [activeTemplate, setActiveTemplate] = useState("");

  const characterLimit = characterLimits[platform] || 0;
  const isOverLimit = characterLimit > 0 && generatedContent.length > characterLimit;

  function handleTemplateSelect(templateId: string) {
    const template = quickTemplates.find((t) => t.id === templateId);
    if (template) {
      setContentType(template.contentType);
      setPlatform(template.platform);
      setAdditionalContext(template.context);
      setActiveTemplate(templateId);
    }
  }

  async function handleGenerate() {
    if (!contentType) return;

    setIsLoading(true);
    setGeneratedContent("");
    setSaved(false);
    setError("");
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

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error || "Failed to generate content. Please try again.");
        return;
      }

      const data = await response.json();
      if (Array.isArray(data.variations) && data.variations.length > 1) {
        setVariations(data.variations);
        setGeneratedContent(data.variations[0] || "");
        setCurrentVariation(0);
      } else {
        setGeneratedContent(data.content);
        setVariations([data.content]);
      }
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleNextVariation() {
    if (currentVariation < variations.length - 1) {
      const next = currentVariation + 1;
      setCurrentVariation(next);
      setGeneratedContent(variations[next]);
      setSaved(false);
    }
  }

  function handlePrevVariation() {
    if (currentVariation > 0) {
      const prev = currentVariation - 1;
      setCurrentVariation(prev);
      setGeneratedContent(variations[prev]);
      setSaved(false);
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
          title: customTitle || `${contentTypes.find((t) => t.id === contentType)?.name} - ${new Date().toLocaleDateString()}`,
        }),
      });

      if (response.ok) {
        setSaved(true);
      }
    } catch {
      setError("Failed to save content. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Templates */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Wand2 className="h-4 w-4 text-purple-500" />
          Quick Templates
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickTemplates.map((template) => {
            const Icon = template.icon;
            const isActive = activeTemplate === template.id;
            return (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:bg-gray-50 ${
                  isActive ? "border-purple-300 bg-purple-50 ring-1 ring-purple-200" : "border-gray-200"
                }`}
              >
                <div className={`rounded-md p-1.5 flex-shrink-0 ${isActive ? "bg-purple-100" : "bg-gray-100"}`}>
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-purple-600" : "text-gray-500"}`} />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${isActive ? "text-purple-900" : "text-gray-900"}`}>
                    {template.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{template.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Type & Platform */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Content Type *</Label>
          <Select value={contentType} onValueChange={(v) => { setContentType(v); setPlatform(""); setActiveTemplate(""); }}>
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
          Include specifics like current incentives, event dates, or key selling points for better results.
        </p>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!contentType || isLoading}
        className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating{variationCount > 1 ? ` ${variationCount} variations` : ""}...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Content
          </>
        )}
      </Button>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Generation failed</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              className="mt-2 text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Generated Content */}
      {generatedContent && (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <Label className="font-semibold text-gray-900">Generated Content</Label>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{wordCount(generatedContent)} words</span>
                  {characterLimit > 0 && (
                    <span className={`text-xs ${isOverLimit ? "text-red-600 font-medium" : "text-gray-500"}`}>
                      {isOverLimit && <AlertCircle className="h-3 w-3 inline mr-0.5" />}
                      {generatedContent.length}/{characterLimit} chars
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {variations.length > 1 && (
                <div className="flex items-center gap-1 mr-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrevVariation}
                    disabled={currentVariation === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs font-medium text-gray-600 min-w-[3rem] text-center">
                    {currentVariation + 1} of {variations.length}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNextVariation}
                    disabled={currentVariation === variations.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleGenerate}
                disabled={isLoading}
                className="h-8 gap-1.5 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>
          </div>

          {/* Content Editor */}
          <div className="px-4 sm:px-5">
            <Textarea
              value={generatedContent}
              onChange={(e) => {
                setGeneratedContent(e.target.value);
                setSaved(false);
              }}
              rows={12}
              className="bg-gray-50 text-sm leading-relaxed border-gray-200 focus:bg-white transition-colors"
            />
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3 sm:px-5">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder={`Title: ${contentTypes.find((t) => t.id === contentType)?.name} - ${new Date().toLocaleDateString()}`}
                  className="text-sm bg-white h-9"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopy} className="gap-1.5 h-9 text-sm">
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
                <Button onClick={handleSave} disabled={saved} className="gap-1.5 h-9 text-sm">
                  {saved ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Save to Library
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
