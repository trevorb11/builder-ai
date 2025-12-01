"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Finding {
  category: string;
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  details?: string;
}

interface Source {
  url: string;
  title: string;
  snippet?: string;
  relevance: number;
}

interface Report {
  id: string;
  title: string;
  status: string;
  summary?: string | null;
  findings?: string | null;
  sources?: string | null;
  recommendations?: string | null;
  createdAt: Date;
  completedAt?: Date | null;
}

interface DigitalFootprintReportsProps {
  reports: Report[];
}

export function DigitalFootprintReports({ reports }: DigitalFootprintReportsProps) {
  const [expandedReport, setExpandedReport] = useState<string | null>(
    reports[0]?.id || null
  );

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            Analysis Reports
          </CardTitle>
          <CardDescription>
            Your digital footprint analysis reports will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No reports yet</h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              Start your first digital footprint analysis to understand your online presence
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-teal-500" />
          Analysis Reports
        </CardTitle>
        <CardDescription>
          View your digital footprint analysis results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[700px] pr-4">
          <div className="space-y-4">
            {reports.map((report) => {
              const isExpanded = expandedReport === report.id;
              const findings: Finding[] = report.findings
                ? JSON.parse(report.findings)
                : [];
              const sources: Source[] = report.sources
                ? JSON.parse(report.sources)
                : [];
              const recommendations: string[] = report.recommendations
                ? JSON.parse(report.recommendations)
                : [];

              return (
                <div
                  key={report.id}
                  className="rounded-lg border border-gray-200 bg-white overflow-hidden"
                >
                  {/* Report Header */}
                  <button
                    onClick={() =>
                      setExpandedReport(isExpanded ? null : report.id)
                    }
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon status={report.status} />
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(report.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={report.status} />
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Report Content */}
                  {isExpanded && report.status === "completed" && (
                    <div className="border-t border-gray-200 p-4 space-y-6">
                      {/* Summary */}
                      {report.summary && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Summary
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {report.summary}
                          </p>
                        </div>
                      )}

                      {/* Findings */}
                      {findings.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-teal-500" />
                            Key Findings
                          </h4>
                          <div className="space-y-3">
                            {findings.map((finding, index) => (
                              <FindingCard key={index} finding={finding} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-amber-500" />
                            Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {recommendations.map((rec, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-gray-600"
                              >
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-semibold">
                                  {index + 1}
                                </span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sources */}
                      {sources.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Sources
                          </h4>
                          <div className="space-y-2">
                            {sources.slice(0, 5).map((source, index) => (
                              <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {source.title || source.url}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* In Progress State */}
                  {isExpanded && report.status === "in_progress" && (
                    <div className="border-t border-gray-200 p-8">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping" />
                          <div className="relative rounded-full bg-teal-100 p-4">
                            <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
                          </div>
                        </div>
                        <h3 className="mt-4 font-semibold text-gray-900">
                          Analysis in Progress
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Our AI is analyzing your digital presence...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Failed State */}
                  {isExpanded && report.status === "failed" && (
                    <div className="border-t border-gray-200 p-8">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-red-100 p-4">
                          <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="mt-4 font-semibold text-gray-900">
                          Analysis Failed
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          There was an error analyzing your digital footprint. Please try again.
                        </p>
                        <Button variant="outline" className="mt-4">
                          Retry Analysis
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <div className="rounded-full bg-green-100 p-2">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </div>
      );
    case "in_progress":
      return (
        <div className="rounded-full bg-blue-100 p-2">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
        </div>
      );
    case "failed":
      return (
        <div className="rounded-full bg-red-100 p-2">
          <XCircle className="h-4 w-4 text-red-600" />
        </div>
      );
    default:
      return (
        <div className="rounded-full bg-gray-100 p-2">
          <Clock className="h-4 w-4 text-gray-600" />
        </div>
      );
  }
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          Completed
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          In Progress
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          Failed
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
          Pending
        </Badge>
      );
  }
}

function FindingCard({ finding }: { finding: Finding }) {
  const importanceColors = {
    high: "border-l-red-500 bg-red-50",
    medium: "border-l-amber-500 bg-amber-50",
    low: "border-l-blue-500 bg-blue-50",
  };

  const importanceBadgeColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-blue-100 text-blue-700",
  };

  return (
    <div
      className={`rounded-lg border-l-4 p-4 ${
        importanceColors[finding.importance]
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase">
              {finding.category}
            </span>
            <Badge
              className={`text-[10px] ${importanceBadgeColors[finding.importance]}`}
            >
              {finding.importance} priority
            </Badge>
          </div>
          <h5 className="font-semibold text-gray-900">{finding.title}</h5>
          <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
        </div>
      </div>
    </div>
  );
}
