"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";
import { Loader2, Sparkles, FileBarChart, Building2 } from "lucide-react";

interface Report {
  id: string;
  title: string;
  reportType: string;
  summary: string | null;
  generatedAt: Date;
  competitor: { name: string } | null;
}

interface Competitor {
  id: string;
  name: string;
}

interface CompetitiveReportsProps {
  reports: Report[];
  competitors: Competitor[];
  organizationId: string;
}

const reportTypes = [
  { id: "market_overview", name: "Market Overview" },
  { id: "pricing_analysis", name: "Pricing Analysis" },
  { id: "feature_comparison", name: "Feature Comparison" },
  { id: "incentive_analysis", name: "Incentive Analysis" },
];

export function CompetitiveReports({
  reports,
  competitors,
  organizationId,
}: CompetitiveReportsProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("");
  const [selectedCompetitor, setSelectedCompetitor] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!selectedType) return;

    setIsGenerating(true);

    try {
      const response = await fetch("/api/competitors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          reportType: selectedType,
          competitorId: selectedCompetitor || null,
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Generate New Report */}
      <div className="rounded-lg border bg-gray-50 p-4">
        <h3 className="mb-4 font-medium">Generate New Report</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Report type..." />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
            <SelectTrigger>
              <SelectValue placeholder="All competitors..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Competitors</SelectItem>
              {competitors.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleGenerate}
            disabled={!selectedType || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Report List */}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileBarChart className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No reports yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Generate your first competitive intelligence report above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-orange-100 p-2">
                    <FileBarChart className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{report.title}</h4>
                    {report.summary && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {report.summary}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-400">
                      Generated: {formatDateTime(report.generatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary">
                    {reportTypes.find((t) => t.id === report.reportType)?.name ||
                      report.reportType}
                  </Badge>
                  {report.competitor && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {report.competitor.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
