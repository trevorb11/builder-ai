"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy } from "lucide-react";
import type { ChatbotConfig } from "@/generated/prisma/client";

interface EmbedCodeSectionProps {
  organizationId: string;
  config: ChatbotConfig | null;
}

export function EmbedCodeSection({ organizationId, config }: EmbedCodeSectionProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<!-- Builder AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/widget.js';
    script.async = true;
    script.dataset.organizationId = '${organizationId}';
    script.dataset.primaryColor = '${config?.primaryColor || '#2563eb'}';
    script.dataset.position = '${config?.position || 'bottom-right'}';
    document.body.appendChild(script);
  })();
</script>`;

  async function copyToClipboard() {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Textarea
          value={embedCode}
          readOnly
          className="min-h-[200px] font-mono text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          className="absolute right-2 top-2"
          onClick={copyToClipboard}
        >
          {copied ? (
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

      <div className="rounded-lg bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900">Installation Instructions</h4>
        <ol className="mt-2 list-inside list-decimal space-y-2 text-sm text-blue-800">
          <li>Copy the embed code above</li>
          <li>Paste it just before the closing <code className="rounded bg-blue-100 px-1">&lt;/body&gt;</code> tag on every page of your website</li>
          <li>The chat widget will appear automatically in the {config?.position === "bottom-left" ? "bottom-left" : "bottom-right"} corner</li>
          <li>Visitors can click the chat icon to start a conversation</li>
        </ol>
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <h4 className="font-medium text-yellow-900">Important Notes</h4>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-yellow-800">
          <li>Make sure the chatbot is set to Active in the Configuration tab</li>
          <li>The widget will use your configured colors and settings</li>
          <li>All conversations are automatically saved and synced to your CRM (if configured)</li>
        </ul>
      </div>
    </div>
  );
}
