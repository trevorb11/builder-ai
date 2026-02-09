"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Loader2,
  Search,
  Star,
  ChevronDown,
  ChevronUp,
  Shield,
  MapPin,
  Building2,
  Sparkles,
} from "lucide-react";

interface DigitalFootprintAnalyzerProps {
  config?: {
    websiteUrl?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    linkedinUrl?: string | null;
    youtubeUrl?: string | null;
    googleBusinessUrl?: string | null;
    tiktokUrl?: string | null;
    pinterestUrl?: string | null;
    yelpUrl?: string | null;
    bbbUrl?: string | null;
    houzzUrl?: string | null;
  } | null;
  websiteUrl?: string;
}

const PROGRESS_STEPS = [
  "Website & UX Analysis",
  "Social Media Audit",
  "Reputation & Reviews",
  "SEO & Local Search",
  "AI Search Visibility",
  "Competitive Benchmarking",
  "Generating Executive Report",
];

export function DigitalFootprintAnalyzer({
  config,
  websiteUrl,
}: DigitalFootprintAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    websiteUrl: config?.websiteUrl || websiteUrl || "",
    facebookUrl: config?.facebookUrl || "",
    instagramUrl: config?.instagramUrl || "",
    linkedinUrl: config?.linkedinUrl || "",
    youtubeUrl: config?.youtubeUrl || "",
    googleBusinessUrl: config?.googleBusinessUrl || "",
    tiktokUrl: config?.tiktokUrl || "",
    pinterestUrl: config?.pinterestUrl || "",
    yelpUrl: config?.yelpUrl || "",
    bbbUrl: config?.bbbUrl || "",
    houzzUrl: config?.houzzUrl || "",
    competitorUrl1: "",
    competitorUrl2: "",
    competitorUrl3: "",
  });

  const handleAnalyze = async () => {
    if (!formData.websiteUrl) return;

    setIsAnalyzing(true);
    try {
      const socialProfiles = [
        formData.facebookUrl,
        formData.instagramUrl,
        formData.linkedinUrl,
        formData.youtubeUrl,
        formData.googleBusinessUrl,
      ].filter(Boolean);

      const competitorUrls = [
        formData.competitorUrl1,
        formData.competitorUrl2,
        formData.competitorUrl3,
      ].filter(Boolean);

      const response = await fetch("/api/research/digital-footprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          socialProfiles,
          tiktokUrl: formData.tiktokUrl || undefined,
          pinterestUrl: formData.pinterestUrl || undefined,
          yelpUrl: formData.yelpUrl || undefined,
          bbbUrl: formData.bbbUrl || undefined,
          houzzUrl: formData.houzzUrl || undefined,
          competitorUrls: competitorUrls.length > 0 ? competitorUrls : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze");
      }

      window.location.reload();
    } catch (error) {
      console.error("Analysis error:", error);
      alert("Failed to start analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-500" />
          Deep Presence Analysis
        </CardTitle>
        <CardDescription>
          Multi-pass AI research across 7 dimensions of your digital presence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Website URL */}
        <div className="space-y-2">
          <Label htmlFor="websiteUrl" className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            Website URL *
          </Label>
          <Input
            id="websiteUrl"
            placeholder="https://yourbuilderwebsite.com"
            value={formData.websiteUrl}
            onChange={(e) =>
              setFormData({ ...formData, websiteUrl: e.target.value })
            }
          />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Social Media Profiles
          </p>

          {/* Facebook */}
          <div className="space-y-2 mb-3">
            <Label htmlFor="facebookUrl" className="flex items-center gap-2 text-sm">
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Label>
            <Input
              id="facebookUrl"
              placeholder="https://facebook.com/yourpage"
              value={formData.facebookUrl}
              onChange={(e) =>
                setFormData({ ...formData, facebookUrl: e.target.value })
              }
              className="text-sm"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2 mb-3">
            <Label htmlFor="instagramUrl" className="flex items-center gap-2 text-sm">
              <Instagram className="h-4 w-4 text-pink-600" />
              Instagram
            </Label>
            <Input
              id="instagramUrl"
              placeholder="https://instagram.com/yourhandle"
              value={formData.instagramUrl}
              onChange={(e) =>
                setFormData({ ...formData, instagramUrl: e.target.value })
              }
              className="text-sm"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2 mb-3">
            <Label htmlFor="linkedinUrl" className="flex items-center gap-2 text-sm">
              <Linkedin className="h-4 w-4 text-blue-700" />
              LinkedIn
            </Label>
            <Input
              id="linkedinUrl"
              placeholder="https://linkedin.com/company/yourcompany"
              value={formData.linkedinUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkedinUrl: e.target.value })
              }
              className="text-sm"
            />
          </div>

          {/* YouTube */}
          <div className="space-y-2 mb-3">
            <Label htmlFor="youtubeUrl" className="flex items-center gap-2 text-sm">
              <Youtube className="h-4 w-4 text-red-600" />
              YouTube
            </Label>
            <Input
              id="youtubeUrl"
              placeholder="https://youtube.com/@yourchannel"
              value={formData.youtubeUrl}
              onChange={(e) =>
                setFormData({ ...formData, youtubeUrl: e.target.value })
              }
              className="text-sm"
            />
          </div>

          {/* Google Business */}
          <div className="space-y-2">
            <Label htmlFor="googleBusinessUrl" className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              Google Business Profile
            </Label>
            <Input
              id="googleBusinessUrl"
              placeholder="Google Business URL or Place ID"
              value={formData.googleBusinessUrl}
              onChange={(e) =>
                setFormData({ ...formData, googleBusinessUrl: e.target.value })
              }
              className="text-sm"
            />
          </div>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium w-full py-2"
          type="button"
        >
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {showAdvanced ? "Hide" : "Show"} additional platforms & competitors
        </button>

        {showAdvanced && (
          <div className="space-y-4 border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Additional Platforms
            </p>

            <div className="space-y-2 mb-3">
              <Label htmlFor="tiktokUrl" className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-gray-800" />
                TikTok
              </Label>
              <Input
                id="tiktokUrl"
                placeholder="https://tiktok.com/@yourhandle"
                value={formData.tiktokUrl}
                onChange={(e) =>
                  setFormData({ ...formData, tiktokUrl: e.target.value })
                }
                className="text-sm"
              />
            </div>

            <div className="space-y-2 mb-3">
              <Label htmlFor="pinterestUrl" className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-red-500" />
                Pinterest
              </Label>
              <Input
                id="pinterestUrl"
                placeholder="https://pinterest.com/yourprofile"
                value={formData.pinterestUrl}
                onChange={(e) =>
                  setFormData({ ...formData, pinterestUrl: e.target.value })
                }
                className="text-sm"
              />
            </div>

            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-4">
              Review Profiles
            </p>

            <div className="space-y-2 mb-3">
              <Label htmlFor="yelpUrl" className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-red-600" />
                Yelp
              </Label>
              <Input
                id="yelpUrl"
                placeholder="https://yelp.com/biz/yourbuilder"
                value={formData.yelpUrl}
                onChange={(e) =>
                  setFormData({ ...formData, yelpUrl: e.target.value })
                }
                className="text-sm"
              />
            </div>

            <div className="space-y-2 mb-3">
              <Label htmlFor="bbbUrl" className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-blue-800" />
                Better Business Bureau
              </Label>
              <Input
                id="bbbUrl"
                placeholder="https://bbb.org/us/your-profile"
                value={formData.bbbUrl}
                onChange={(e) =>
                  setFormData({ ...formData, bbbUrl: e.target.value })
                }
                className="text-sm"
              />
            </div>

            <div className="space-y-2 mb-3">
              <Label htmlFor="houzzUrl" className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-green-600" />
                Houzz
              </Label>
              <Input
                id="houzzUrl"
                placeholder="https://houzz.com/pro/yourprofile"
                value={formData.houzzUrl}
                onChange={(e) =>
                  setFormData({ ...formData, houzzUrl: e.target.value })
                }
                className="text-sm"
              />
            </div>

            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-4">
              Competitor Websites (for benchmarking)
            </p>

            <div className="space-y-2 mb-3">
              <Input
                placeholder="https://competitor1.com"
                value={formData.competitorUrl1}
                onChange={(e) =>
                  setFormData({ ...formData, competitorUrl1: e.target.value })
                }
                className="text-sm"
              />
            </div>
            <div className="space-y-2 mb-3">
              <Input
                placeholder="https://competitor2.com"
                value={formData.competitorUrl2}
                onChange={(e) =>
                  setFormData({ ...formData, competitorUrl2: e.target.value })
                }
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="https://competitor3.com"
                value={formData.competitorUrl3}
                onChange={(e) =>
                  setFormData({ ...formData, competitorUrl3: e.target.value })
                }
                className="text-sm"
              />
            </div>
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!formData.websiteUrl || isAnalyzing}
          className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deep Analysis Running...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Start Deep Analysis
            </>
          )}
        </Button>

        {isAnalyzing && (
          <div className="rounded-lg bg-teal-50 border border-teal-200 p-4 mt-4">
            <p className="text-sm font-semibold text-teal-800 mb-2">
              Multi-pass deep research in progress...
            </p>
            <p className="text-xs text-teal-600 mb-3">
              Running 7 focused AI research passes for a comprehensive analysis. This typically takes 3-5 minutes.
            </p>
            <div className="space-y-1.5">
              {PROGRESS_STEPS.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-teal-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: `${idx * 200}ms` }} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
