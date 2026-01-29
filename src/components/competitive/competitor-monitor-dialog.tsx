"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Radio, Globe } from "lucide-react";

interface CompetitorMonitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitorId: string;
  competitorName: string;
  competitorWebsite: string | null;
}

const intervalOptions = [
  { value: "6", label: "Every 6 hours" },
  { value: "12", label: "Every 12 hours" },
  { value: "24", label: "Once a day" },
  { value: "48", label: "Every 2 days" },
  { value: "72", label: "Every 3 days" },
  { value: "168", label: "Once a week" },
];

export function CompetitorMonitorDialog({
  open,
  onOpenChange,
  competitorId,
  competitorName,
  competitorWebsite,
}: CompetitorMonitorDialogProps) {
  const [websiteUrl, setWebsiteUrl] = useState(competitorWebsite || "");
  const [intervalHours, setIntervalHours] = useState("24");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!websiteUrl.trim()) {
      setError("Website URL is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/competitors/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitorId,
          websiteUrl: websiteUrl.trim(),
          intervalHours: parseInt(intervalHours, 10),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to set up monitor");
      }

      onOpenChange(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set up monitor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-green-500" />
            Monitor {competitorName}
          </DialogTitle>
          <DialogDescription>
            Set up automated monitoring to track website updates and changes for
            this competitor. Uses AI-powered web search to check for new content,
            pricing changes, community announcements, and more.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">
              <Globe className="inline h-4 w-4 mr-1" />
              Website URL
            </Label>
            <Input
              id="websiteUrl"
              placeholder="https://www.competitor.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Check Frequency</Label>
            <Select value={intervalHours} onValueChange={setIntervalHours}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency..." />
              </SelectTrigger>
              <SelectContent>
                {intervalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              The AI web search will check the competitor&apos;s website at this interval
              and report any new updates, pricing changes, or announcements.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !websiteUrl.trim()}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Radio className="mr-2 h-4 w-4" />
                Start Monitoring
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
