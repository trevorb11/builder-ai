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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Trash2,
  Pencil,
  Save,
  X,
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

const typeColors: Record<string, string> = {
  social_post: "bg-pink-100 text-pink-700",
  email: "bg-blue-100 text-blue-700",
  blog: "bg-green-100 text-green-700",
  listing: "bg-amber-100 text-amber-700",
  ad_copy: "bg-purple-100 text-purple-700",
  realtor_email: "bg-indigo-100 text-indigo-700",
};

export function ContentLibrary({ content: initialContent }: ContentLibraryProps) {
  const [content, setContent] = useState(initialContent);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedContent, setSelectedContent] = useState<MarketingContent | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const uniqueTypes = [...new Set(content.map((item) => item.type))];

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  async function handleCopy() {
    if (!selectedContent) return;
    const text = isEditing ? editedContent : selectedContent.content;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function startEditing() {
    if (!selectedContent) return;
    setEditedContent(selectedContent.content);
    setEditedTitle(selectedContent.title);
    setIsEditing(true);
  }

  async function handleSaveEdit() {
    if (!selectedContent) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/marketing/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: "update",
          type: selectedContent.type,
          platform: selectedContent.platform,
          content: editedContent,
          title: editedTitle,
        }),
      });

      if (response.ok) {
        setContent((prev) =>
          prev.map((item) =>
            item.id === selectedContent.id
              ? { ...item, content: editedContent, title: editedTitle }
              : item
          )
        );
        setSelectedContent({ ...selectedContent, content: editedContent, title: editedTitle });
        setIsEditing(false);
      }
    } catch {
      // Silent fail - content stays in edit mode
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedContent) return;
    setIsDeleting(true);
    try {
      setContent((prev) => prev.filter((item) => item.id !== selectedContent.id));
      setSelectedContent(null);
      setIsEditing(false);
    } finally {
      setIsDeleting(false);
    }
  }

  if (content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <FileEdit className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          No content yet
        </h3>
        <p className="mt-2 text-sm text-gray-500 max-w-sm">
          Generated content will appear here after you save it from the generator. Start by creating your first piece!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types ({content.length})</SelectItem>
            {uniqueTypes.map((type) => {
              const count = content.filter((c) => c.type === type).length;
              return (
                <SelectItem key={type} value={type}>
                  {typeLabels[type] || type} ({count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {(searchQuery || typeFilter !== "all") && (
        <p className="text-xs text-gray-500">
          Showing {filteredContent.length} of {content.length} items
          {searchQuery && <> matching &quot;{searchQuery}&quot;</>}
        </p>
      )}

      {/* Content List */}
      <div className="space-y-2">
        {filteredContent.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-500">
            No content matches your search.
          </div>
        ) : (
          filteredContent.map((item) => {
            const Icon = typeIcons[item.type] || FileEdit;
            const colorClass = typeColors[item.type] || "bg-gray-100 text-gray-700";
            return (
              <div
                key={item.id}
                className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                onClick={() => { setSelectedContent(item); setIsEditing(false); }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`rounded-lg p-2 flex-shrink-0 ${colorClass.split(" ")[0]}`}>
                      <Icon className={`h-4 w-4 ${colorClass.split(" ")[1]}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{item.title}</h4>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500 leading-relaxed">
                        {item.content}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Badge className={`text-xs ${colorClass} border-0`}>
                      {typeLabels[item.type] || item.type}
                    </Badge>
                    {item.platform && (
                      <Badge variant="outline" className="text-[10px]">
                        {item.platform.replace(/_/g, " ")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Content Detail Dialog */}
      <Dialog open={!!selectedContent} onOpenChange={() => { setSelectedContent(null); setIsEditing(false); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-lg font-semibold"
              />
            ) : (
              <DialogTitle>{selectedContent?.title}</DialogTitle>
            )}
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {selectedContent && (
                  <Badge className={`text-xs ${typeColors[selectedContent.type] || "bg-gray-100 text-gray-700"} border-0`}>
                    {typeLabels[selectedContent.type] || selectedContent.type}
                  </Badge>
                )}
                {selectedContent?.platform && (
                  <Badge variant="outline" className="text-xs">
                    {selectedContent.platform.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
              {selectedContent && (
                <span className="text-xs text-gray-400">{formatDateTime(selectedContent.createdAt)}</span>
              )}
            </div>

            <Textarea
              value={isEditing ? editedContent : selectedContent?.content || ""}
              onChange={isEditing ? (e) => setEditedContent(e.target.value) : undefined}
              readOnly={!isEditing}
              rows={14}
              className={`text-sm leading-relaxed ${isEditing ? "bg-white" : "bg-gray-50"}`}
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={startEditing} className="gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting} className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="gap-1.5">
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit} disabled={isSaving} className="gap-1.5">
                      <Save className="h-3.5 w-3.5" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                )}
              </div>
              <Button onClick={handleCopy} size="sm" className="gap-1.5">
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
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
