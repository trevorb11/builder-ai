"use client";

import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Eye, CheckCircle, XCircle, MessageSquare } from "lucide-react";

interface AISearchResult {
  id: string;
  platform: string;
  query: string;
  response: string;
  mentions: boolean;
  sentiment: string | null;
  checkedAt: Date;
}

interface AISearchMonitorProps {
  results: AISearchResult[];
  organizationId: string;
}

const platformLabels: Record<string, string> = {
  chatgpt: "ChatGPT",
  gemini: "Google Gemini",
  perplexity: "Perplexity",
  bing_copilot: "Bing Copilot",
};

const platformColors: Record<string, string> = {
  chatgpt: "bg-green-100 text-green-800",
  gemini: "bg-blue-100 text-blue-800",
  perplexity: "bg-purple-100 text-purple-800",
  bing_copilot: "bg-cyan-100 text-cyan-800",
};

export function AISearchMonitor({ results, organizationId }: AISearchMonitorProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Eye className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No monitoring data yet
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          AI search monitoring results will appear here once tracking begins.
        </p>
        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
          <h4 className="font-medium text-gray-900">How it works:</h4>
          <ul className="mt-2 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <MessageSquare className="mt-0.5 h-4 w-4 text-gray-400" />
              We periodically query AI tools with searches like "new homes in [your area]"
            </li>
            <li className="flex items-start gap-2">
              <Eye className="mt-0.5 h-4 w-4 text-gray-400" />
              We check if your builder is mentioned in the responses
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 text-gray-400" />
              Results are tracked over time to show improvement
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {results.filter((r) => r.mentions).length}
          </p>
          <p className="text-sm text-gray-500">Total Mentions</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {results.filter((r) => r.platform === "chatgpt").length}
          </p>
          <p className="text-sm text-gray-500">ChatGPT Checks</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {results.filter((r) => r.platform === "gemini").length}
          </p>
          <p className="text-sm text-gray-500">Gemini Checks</p>
        </div>
        <div className="rounded-lg border bg-gray-50 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {results.filter((r) => r.sentiment === "positive").length}
          </p>
          <p className="text-sm text-gray-500">Positive Mentions</p>
        </div>
      </div>

      <div className="space-y-3">
        {results.map((result) => (
          <div key={result.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {result.mentions ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${
                        platformColors[result.platform] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {platformLabels[result.platform] || result.platform}
                    </span>
                    {result.sentiment && (
                      <Badge
                        variant={
                          result.sentiment === "positive"
                            ? "success"
                            : result.sentiment === "negative"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {result.sentiment}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 font-medium text-gray-900">
                    Query: "{result.query}"
                  </p>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {result.response}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Checked: {formatDateTime(result.checkedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
