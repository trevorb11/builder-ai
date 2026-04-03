"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PenLine,
  FileText,
  Globe,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KnowledgeBaseEntry {
  id: string;
  title: string;
  type: string;
  content: string | null;
  sourceUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  category: string | null;
  isProcessed: boolean;
  isActive: boolean;
  createdAt: string;
}

interface KnowledgeBaseManagerProps {
  entries: KnowledgeBaseEntry[];
}

export function KnowledgeBaseManager({ entries: initialEntries }: KnowledgeBaseManagerProps) {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>(initialEntries);
  const [isAddingText, setIsAddingText] = useState(false);
  const [isAddingWebsite, setIsAddingWebsite] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [textCategory, setTextCategory] = useState("");
  const [websiteTitle, setWebsiteTitle] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteCategory, setWebsiteCategory] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddText = async () => {
    if (!textTitle || !textContent) return;

    setIsAddingText(true);
    try {
      const response = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: textTitle,
          type: "text",
          content: textContent,
          category: textCategory || null,
        }),
      });

      if (response.ok) {
        const { entry } = await response.json();
        setEntries([entry, ...entries]);
        setTextTitle("");
        setTextContent("");
        setTextCategory("");
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to add text:", error);
    } finally {
      setIsAddingText(false);
    }
  };

  const handleAddWebsite = async () => {
    if (!websiteTitle || !websiteUrl) return;

    setIsAddingWebsite(true);
    try {
      const response = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: websiteTitle,
          type: "website",
          sourceUrl: websiteUrl,
          category: websiteCategory || null,
        }),
      });

      if (response.ok) {
        const { entry } = await response.json();
        
        const processResponse = await fetch("/api/knowledge-base/process-website", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entryId: entry.id }),
        });
        
        if (processResponse.ok) {
          const { entry: processedEntry } = await processResponse.json();
          setEntries([processedEntry, ...entries]);
        } else {
          setEntries([entry, ...entries]);
        }
        
        setWebsiteTitle("");
        setWebsiteUrl("");
        setWebsiteCategory("");
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to add website:", error);
    } finally {
      setIsAddingWebsite(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();

      const response = await fetch("/api/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name.replace(/\.[^/.]+$/, ""),
          type: "file",
          content: text,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (response.ok) {
        const { entry } = await response.json();
        setEntries([entry, ...entries]);
        setDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/knowledge-base?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEntries(entries.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/knowledge-base", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });

      if (response.ok) {
        setEntries(
          entries.map((e) =>
            e.id === id ? { ...e, isActive: !currentStatus } : e
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle entry:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <PenLine className="h-4 w-4" />;
      case "file":
        return <FileText className="h-4 w-4" />;
      case "website":
        return <Globe className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-emerald-100 text-emerald-700";
      case "file":
        return "bg-blue-100 text-blue-700";
      case "website":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const textEntries = entries.filter((e) => e.type === "text");
  const fileEntries = entries.filter((e) => e.type === "file");
  const websiteEntries = entries.filter((e) => e.type === "website");

  return (
    <div className="space-y-6">
      {/* What KB powers */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-900">Your knowledge base powers these features:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Website Chatbot</Badge>
          <Badge className="bg-violet-100 text-violet-700 border-0 text-xs">Marketing Writer</Badge>
          <Badge className="bg-pink-100 text-pink-700 border-0 text-xs">Sales Coach</Badge>
          <Badge className="bg-green-100 text-green-700 border-0 text-xs">FAQ Generator</Badge>
        </div>
        <p className="mt-2 text-xs text-blue-600">
          Active entries are included when AI generates responses. Disable entries to exclude them without deleting.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Your Knowledge</h2>
          <p className="text-sm text-gray-500">
            {entries.length} {entries.length === 1 ? "item" : "items"} &middot; {entries.filter(e => e.isActive).length} active &middot; {entries.filter(e => e.isProcessed).length} processed
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Knowledge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add to Knowledge Base</DialogTitle>
              <DialogDescription>
                Add content that your AI assistants can use across all features
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="text" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text" className="gap-2">
                  <PenLine className="h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="file" className="gap-2">
                  <FileText className="h-4 w-4" />
                  File
                </TabsTrigger>
                <TabsTrigger value="website" className="gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="text-title">Title</Label>
                  <Input
                    id="text-title"
                    placeholder="e.g., Competitor Battle Card - Perry Homes"
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-content">Content</Label>
                  <Textarea
                    id="text-content"
                    placeholder="Paste or type your content here..."
                    className="min-h-[200px]"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-category">Category (Optional)</Label>
                  <Input
                    id="text-category"
                    placeholder="e.g., Competitors, Sales, Marketing"
                    value={textCategory}
                    onChange={(e) => setTextCategory(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAddText}
                  disabled={!textTitle || !textContent || isAddingText}
                  className="w-full"
                >
                  {isAddingText ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Text Content
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="file" className="space-y-4 mt-4">
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-sm text-gray-600">
                    Upload text documents to add to your knowledge base
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Supports .txt and .md files
                  </p>
                  <label className="mt-4 inline-block">
                    <input
                      type="file"
                      className="hidden"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Choose File
                        </>
                      )}
                    </span>
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="website" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="website-title">Title</Label>
                  <Input
                    id="website-title"
                    placeholder="e.g., Company Website"
                    value={websiteTitle}
                    onChange={(e) => setWebsiteTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website-url">Website URL</Label>
                  <Input
                    id="website-url"
                    type="url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website-category">Category (Optional)</Label>
                  <Input
                    id="website-category"
                    placeholder="e.g., Competitors, Resources"
                    value={websiteCategory}
                    onChange={(e) => setWebsiteCategory(e.target.value)}
                  />
                </div>
                {websiteUrl && !websiteUrl.startsWith("http") && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-md p-2">
                    URL should start with https:// (e.g., https://example.com)
                  </p>
                )}
                <Button
                  onClick={handleAddWebsite}
                  disabled={!websiteTitle || !websiteUrl || !websiteUrl.startsWith("http") || isAddingWebsite}
                  className="w-full"
                >
                  {isAddingWebsite ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Connect Website
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No knowledge added yet</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              Add text content, upload documents, or connect websites to build your AI's knowledge base.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <PenLine className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Text Content</CardTitle>
                  <CardDescription>{textEntries.length} items</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {textEntries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No text content yet</p>
              ) : (
                textEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                    formatFileSize={formatFileSize}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Documents</CardTitle>
                  <CardDescription>{fileEntries.length} files</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {fileEntries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No documents uploaded</p>
              ) : (
                fileEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                    formatFileSize={formatFileSize}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                  <Globe className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Websites</CardTitle>
                  <CardDescription>{websiteEntries.length} connections</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {websiteEntries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No websites connected</p>
              ) : (
                websiteEntries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    getTypeIcon={getTypeIcon}
                    getTypeColor={getTypeColor}
                    formatFileSize={formatFileSize}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function EntryCard({
  entry,
  onDelete,
  onToggleActive,
  getTypeIcon,
  getTypeColor,
  formatFileSize,
}: {
  entry: KnowledgeBaseEntry;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  getTypeIcon: (type: string) => React.ReactNode;
  getTypeColor: (type: string) => string;
  formatFileSize: (bytes: number | null) => string;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        entry.isActive ? "bg-white" : "bg-gray-50 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`${getTypeColor(entry.type)} text-xs`}>
              {getTypeIcon(entry.type)}
            </Badge>
            {entry.isProcessed ? (
              <Badge className="bg-green-100 text-green-700 border-0 text-[10px] gap-0.5 h-5">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Ready
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] gap-0.5 h-5">
                <AlertCircle className="h-2.5 w-2.5" />
                Processing
              </Badge>
            )}
          </div>
          <p className="mt-1 font-medium text-sm text-gray-900 truncate">{entry.title}</p>
          {entry.category && (
            <p className="text-xs text-gray-500">{entry.category}</p>
          )}
          {entry.fileName && (
            <p className="text-xs text-gray-500">
              {entry.fileName} {formatFileSize(entry.fileSize)}
            </p>
          )}
          {entry.sourceUrl && (
            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Open
            </a>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onToggleActive(entry.id, entry.isActive)}
            title={entry.isActive ? "Disable" : "Enable"}
          >
            {entry.isActive ? (
              <ToggleRight className="h-4 w-4 text-green-500" />
            ) : (
              <ToggleLeft className="h-4 w-4 text-gray-400" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(entry.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
