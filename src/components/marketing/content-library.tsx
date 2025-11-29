"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import {
  Instagram,
  Mail,
  FileText,
  Megaphone,
  Users,
  FileEdit,
  Search,
  Copy,
  Check,
} from "lucide-react";

interface MarketingContent {
  id: string;
  title: string;
  type: string;
  platform: string | null;
  content: string;
  status: string;
  createdAt: Date;
}

interface ContentLibraryProps {
  content: MarketingContent[];
}

const typeIcons: Record<string, typeof Instagram> = {
  social_post: Instagram,
  email: Mail,
  blog: FileText,
  listing: FileEdit,
  ad_copy: Megaphone,
  realtor_email: Users,
};

const typeLabels: Record<string, string> = {
  social_post: "Social Media",
  email: "Email",
  blog: "Blog Post",
  listing: "Listing",
  ad_copy: "Ad Copy",
  realtor_email: "Realtor Email",
};

export function ContentLibrary({ content }: ContentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContent, setSelectedContent] = useState<MarketingContent | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const filteredContent = content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleCopy() {
    if (!selectedContent) return;
    await navigator.clipboard.writeText(selectedContent.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileEdit className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No content yet
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Generated content will appear here. Start by creating some content!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {filteredContent.map((item) => {
          const Icon = typeIcons[item.type] || FileEdit;
          return (
            <div
              key={item.id}
              className="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-gray-50"
              onClick={() => setSelectedContent(item)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-gray-100 p-2">
                    <Icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {item.content}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary">
                    {typeLabels[item.type] || item.type}
                  </Badge>
                  {item.platform && (
                    <Badge variant="outline" className="text-xs">
                      {item.platform}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="secondary">
                {typeLabels[selectedContent?.type || ""] || selectedContent?.type}
              </Badge>
              {selectedContent?.platform && (
                <Badge variant="outline">{selectedContent.platform}</Badge>
              )}
            </div>
            <Textarea
              value={selectedContent?.content || ""}
              readOnly
              rows={12}
              className="font-mono text-sm"
            />
            <div className="flex justify-end">
              <Button onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
