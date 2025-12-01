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
  ExternalLink,
} from "lucide-react";

interface DigitalFootprintAnalyzerProps {
  config?: {
    websiteUrl?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    linkedinUrl?: string | null;
    youtubeUrl?: string | null;
    googleBusinessUrl?: string | null;
  } | null;
  websiteUrl?: string;
}

export function DigitalFootprintAnalyzer({
  config,
  websiteUrl,
}: DigitalFootprintAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    websiteUrl: config?.websiteUrl || websiteUrl || "",
    facebookUrl: config?.facebookUrl || "",
    instagramUrl: config?.instagramUrl || "",
    linkedinUrl: config?.linkedinUrl || "",
    youtubeUrl: config?.youtubeUrl || "",
    googleBusinessUrl: config?.googleBusinessUrl || "",
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

      const response = await fetch("/api/research/digital-footprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: formData.websiteUrl,
          socialProfiles,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze");
      }

      // Refresh the page to show new report
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
          <Search className="h-5 w-5 text-teal-500" />
          Start Analysis
        </CardTitle>
        <CardDescription>
          Enter your digital properties to analyze your online presence
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
            Social Media Profiles (Optional)
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

        <Button
          onClick={handleAnalyze}
          disabled={!formData.websiteUrl || isAnalyzing}
          className="w-full mt-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
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
            <p className="text-sm text-teal-700">
              <strong>Deep research in progress...</strong>
            </p>
            <p className="text-xs text-teal-600 mt-1">
              This may take 1-2 minutes as we analyze your website, social media presence, reviews, and AI search visibility.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
