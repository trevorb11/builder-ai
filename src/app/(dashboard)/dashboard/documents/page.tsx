"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Upload,
  Loader2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  FileUp,
  X,
  Eye,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  filename: string;
  fileType: string;
  fileSize: number;
  category: string;
  description?: string;
  tags?: string;
  targetFeatures?: string;
  status: string;
  summary?: string;
  priority: number;
  createdAt: string;
  processedAt?: string;
  community?: { id: string; name: string };
  floorplan?: { id: string; name: string };
}

const CATEGORIES = [
  { value: "sales_guide", label: "Sales Guide" },
  { value: "brochure", label: "Brochure" },
  { value: "floorplan_spec", label: "Floorplan Specifications" },
  { value: "training_material", label: "Training Material" },
  { value: "faq", label: "FAQ Document" },
  { value: "policy", label: "Policy / Terms" },
  { value: "other", label: "Other" },
];

const TARGET_FEATURES = [
  { value: "all", label: "All Features" },
  { value: "chatbot", label: "Website Chatbot" },
  { value: "sales_training", label: "Sales Training" },
  { value: "marketing", label: "Marketing" },
  { value: "research", label: "Research" },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Upload form state
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [targetFeatures, setTargetFeatures] = useState<string[]>(["all"]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!file || !name || !category) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("targetFeatures", JSON.stringify(targetFeatures));

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // Reset form
        setFile(null);
        setName("");
        setCategory("");
        setDescription("");
        setTargetFeatures(["all"]);
        setDialogOpen(false);

        // Refresh list
        await fetchDocuments();
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments(documents.filter((d) => d.id !== id));
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "ready":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Knowledge Documents</h1>
              <p className="text-gray-500 mt-1">
                Upload brochures, sales guides, and training materials
              </p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload PDFs, Word docs, or text files. Content will be extracted for AI context.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* File Upload */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      file ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.md"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setFile(f);
                          if (!name) setName(f.name.replace(/\.[^/.]+$/, ""));
                        }
                      }}
                    />
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <FileUp className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-400 mt-1">PDF, DOC, DOCX, TXT, MD (max 10MB)</p>
                      </>
                    )}
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Document Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Oak Ridge Sales Guide"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What's in this document?"
                      rows={2}
                    />
                  </div>

                  {/* Target Features */}
                  <div className="space-y-2">
                    <Label>Use for Features</Label>
                    <div className="flex flex-wrap gap-2">
                      {TARGET_FEATURES.map((feat) => (
                        <button
                          key={feat.value}
                          type="button"
                          onClick={() => {
                            if (feat.value === "all") {
                              setTargetFeatures(["all"]);
                            } else if (targetFeatures.includes(feat.value)) {
                              setTargetFeatures(targetFeatures.filter((f) => f !== feat.value));
                            } else {
                              setTargetFeatures([
                                ...targetFeatures.filter((f) => f !== "all"),
                                feat.value,
                              ]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                            targetFeatures.includes(feat.value)
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {feat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={!file || !name || !category || uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : documents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                Upload brochures, sales guides, and training materials to enhance your AI tools
                with your specific content.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{doc.name}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {CATEGORIES.find((c) => c.value === doc.category)?.label || doc.category}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {doc.summary && (
                      <p className="text-sm text-gray-600 line-clamp-2">{doc.summary}</p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{doc.filename}</span>
                      <span>•</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                    </div>

                    {doc.targetFeatures && (
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(doc.targetFeatures).map((feat: string) => (
                          <Badge key={feat} variant="secondary" className="text-xs">
                            {TARGET_FEATURES.find((f) => f.value === feat)?.label || feat}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        {doc.status === "ready" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedDoc(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Document Details Dialog */}
      {selectedDoc && (
        <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDoc.name}</DialogTitle>
              <DialogDescription>
                {CATEGORIES.find((c) => c.value === selectedDoc.category)?.label}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {selectedDoc.summary && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-gray-600">{selectedDoc.summary}</p>
                </div>
              )}
              {selectedDoc.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedDoc.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
