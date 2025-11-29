"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, CheckCircle, XCircle } from "lucide-react";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  isActive: boolean;
  community: { name: string } | null;
}

interface FAQListProps {
  faqsByCategory: Record<string, FAQ[]>;
  categories: string[];
}

const categoryLabels: Record<string, string> = {
  general: "General Questions",
  pricing: "Pricing & Financing",
  timeline: "Timeline & Process",
  features: "Features & Options",
  community: "Community & Location",
  warranty: "Warranty & Support",
};

export function FAQList({ faqsByCategory, categories }: FAQListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = Object.entries(faqsByCategory).reduce(
    (acc, [category, faqs]) => {
      const filtered = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {} as Record<string, FAQ[]>
  );

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No FAQs yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Use the AI FAQ Generator to create comprehensive FAQs for your website.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Accordion type="multiple" className="space-y-4">
        {Object.entries(filteredFaqs).map(([category, faqs]) => (
          <AccordionItem
            key={category}
            value={category}
            className="rounded-lg border px-4"
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {categoryLabels[category] || category}
                </span>
                <Badge variant="secondary">{faqs.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pb-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="rounded-lg border bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {faq.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          {faq.community && (
                            <Badge variant="outline" className="text-xs">
                              {faq.community.name}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900">
                          {faq.question}
                        </h4>
                        <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
