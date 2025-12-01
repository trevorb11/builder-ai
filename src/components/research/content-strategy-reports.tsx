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
  Lightbulb,
  MapPin,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Finding {
  category: string;
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
}

interface Source {
  url: string;
  title: string;
}

interface Report {
  id: string;
  title: string;
  status: string;
  summary?: string | null;
  findings?: string | null;
  sources?: string | null;
  recommendations?: string | null;
  metadata?: string | null;
  createdAt: Date;
}

interface ContentStrategyReportsProps {
  reports: Report[];
}

export function ContentStrategyReports({ reports }: ContentStrategyReportsProps) {
  const [expandedReport, setExpandedReport] = useState<string | null>(
    reports[0]?.id || null
  );

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            Research Reports
          </CardTitle>
          <CardDescription>
            Your content strategy research reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No reports yet</h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              Run a content strategy research to get recommendations
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
          <FileText className="h-5 w-5 text-purple-500" />
          Research Reports
        </CardTitle>
        <CardDescription>
          View your content strategy research results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[550px] pr-4">
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
              const metadata = report.metadata ? JSON.parse(report.metadata) : {};

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
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(report.createdAt), {
                            addSuffix: true,
                          })}
                          {metadata.markets && (
                            <>
                              <span>•</span>
                              <MapPin className="h-3 w-3" />
                              {metadata.markets.join(", ")}
                            </>
                          )}
                        </div>
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
                          <p className="text-gray-600 text-sm leading-relaxed bg-purple-50 p-4 rounded-lg border border-purple-100">
                            {report.summary}
                          </p>
                        </div>
                      )}

                      {/* Key Recommendations */}
                      {recommendations.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-purple-500" />
                            Key Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {recommendations.map((rec, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"
                              >
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-semibold">
                                  {index + 1}
                                </span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Findings by Category */}
                      {findings.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Detailed Findings
                          </h4>
                          <div className="space-y-3">
                            {findings.slice(0, 6).map((finding, index) => (
                              <div
                                key={index}
                                className="border-l-2 border-purple-300 pl-3"
                              >
                                <span className="text-xs font-medium text-purple-600 uppercase">
                                  {finding.category}
                                </span>
                                <h5 className="font-medium text-gray-900">
                                  {finding.title}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {finding.description}
                                </p>
                              </div>
                            ))}
                          </div>
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
                          <div className="absolute inset-0 rounded-full bg-purple-400/20 animate-ping" />
                          <div className="relative rounded-full bg-purple-100 p-4">
                            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                          </div>
                        </div>
                        <h3 className="mt-4 font-semibold text-gray-900">
                          Research in Progress
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Analyzing trends and opportunities...
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
                          Research Failed
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Please try again.
                        </p>
                        <Button variant="outline" className="mt-4">
                          Retry
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
        <div className="rounded-full bg-purple-100 p-2">
          <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
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
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
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
