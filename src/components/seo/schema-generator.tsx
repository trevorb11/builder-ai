"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Code } from "lucide-react";

interface Organization {
  name: string;
  website: string | null;
  description: string | null;
}

interface FAQ {
  question: string;
  answer: string;
}

interface SchemaGeneratorProps {
  organization: Organization | null;
  faqs: FAQ[];
  organizationId: string;
}

export function SchemaGenerator({
  organization,
  faqs,
  organizationId,
}: SchemaGeneratorProps) {
  const [copied, setCopied] = useState<string | null>(null);

  // Generate LocalBusiness Schema
  const localBusinessSchema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "HomeBuilder",
      name: organization?.name || "Your Builder Name",
      url: organization?.website || "https://yourbuilder.com",
      description:
        organization?.description ||
        "New home builder offering quality homes in your area.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Your City",
        addressRegion: "Your State",
        addressCountry: "US",
      },
      areaServed: {
        "@type": "State",
        name: "Your State",
      },
    },
    null,
    2
  );

  // Generate FAQPage Schema
  const faqSchema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.slice(0, 10).map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    null,
    2
  );

  // Generate Product Schema for a sample home
  const productSchema = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Sample Floorplan Name",
      description: "Beautiful 4 bedroom, 3 bathroom home with modern finishes",
      brand: {
        "@type": "Brand",
        name: organization?.name || "Your Builder Name",
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: "400000",
        availability: "https://schema.org/InStock",
      },
    },
    null,
    2
  );

  async function handleCopy(schema: string, type: string) {
    await navigator.clipboard.writeText(`<script type="application/ld+json">\n${schema}\n</script>`);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900">About Schema Markup</h4>
        <p className="mt-1 text-sm text-blue-800">
          Schema markup helps search engines and AI tools better understand your
          website content. Add these scripts to your website's &lt;head&gt; tag
          for improved visibility.
        </p>
      </div>

      {/* LocalBusiness Schema */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium">HomeBuilder / LocalBusiness Schema</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(localBusinessSchema, "local")}
          >
            {copied === "local" ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <Textarea
          value={localBusinessSchema}
          readOnly
          rows={12}
          className="font-mono text-xs"
        />
      </div>

      {/* FAQ Schema */}
      {faqs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-gray-500" />
              <h3 className="font-medium">FAQPage Schema</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(faqSchema, "faq")}
            >
              {copied === "faq" ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <Textarea
            value={faqSchema}
            readOnly
            rows={12}
            className="font-mono text-xs"
          />
        </div>
      )}

      {/* Product Schema */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-gray-500" />
            <h3 className="font-medium">Product Schema (Floorplan Template)</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(productSchema, "product")}
          >
            {copied === "product" ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
        <Textarea
          value={productSchema}
          readOnly
          rows={12}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}
