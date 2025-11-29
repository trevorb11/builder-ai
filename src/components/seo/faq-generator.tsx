"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Save } from "lucide-react";

interface Community {
  id: string;
  name: string;
}

interface FAQGeneratorProps {
  organizationId: string;
  communities: Community[];
}

interface GeneratedFAQ {
  category: string;
  question: string;
  answer: string;
}

const categories = [
  { id: "general", name: "General Questions" },
  { id: "pricing", name: "Pricing & Financing" },
  { id: "timeline", name: "Timeline & Process" },
  { id: "features", name: "Features & Options" },
  { id: "community", name: "Community & Location" },
  { id: "warranty", name: "Warranty & Support" },
];

export function FAQGenerator({ organizationId, communities }: FAQGeneratorProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [generatedFaqs, setGeneratedFaqs] = useState<GeneratedFAQ[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleGenerate() {
    setIsLoading(true);
    setGeneratedFaqs([]);

    try {
      const response = await fetch("/api/faq/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          category: selectedCategory,
          communityId: selectedCommunity,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedFaqs(data.faqs);
      }
    } catch (error) {
      console.error("Error generating FAQs:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveAll() {
    setIsSaving(true);

    try {
      const response = await fetch("/api/faq/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          communityId: selectedCommunity || null,
          faqs: generatedFaqs,
        }),
      });

      if (response.ok) {
        setGeneratedFaqs([]);
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving FAQs:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Category (Optional)</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Community (Optional)</Label>
          <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
            <SelectTrigger>
              <SelectValue placeholder="All communities" />
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
      </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating FAQs...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate FAQs
          </>
        )}
      </Button>

      {generatedFaqs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Generated FAQs ({generatedFaqs.length})
            </h3>
            <Button onClick={handleSaveAll} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save All FAQs
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {generatedFaqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-lg border bg-gray-50 p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {categories.find((c) => c.id === faq.category)?.name || faq.category}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900">{faq.question}</h4>
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
