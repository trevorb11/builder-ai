"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  TrendingUp,
  Lightbulb,
  Shield,
  AlertTriangle,
  Zap,
  ArrowLeft,
  Swords,
  Eye,
  ChevronRight,
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

interface BattleCardSummary {
  competitorName: string;
  builderName: string;
  overallThreatLevel: "high" | "medium" | "low";
  keyStrengths: { yours: string[]; theirs: string[] };
  pricingComparison: string;
  marketPositioning: string;
  topOpportunities: string[];
  topThreats: string[];
  quickWins: string[];
  talkingPoints: string[];
}

interface Report {
  id: string;
  title: string;
  status: string;
  summary?: string | null;
  findings?: string | null;
  sources?: string | null;
  recommendations?: string | null;
  rawResponse?: string | null;
  metadata?: string | null;
  createdAt: Date;
  completedAt?: Date | null;
}

interface CompetitorResearchReportsProps {
  reports: Report[];
}

export function CompetitorResearchReports({ reports }: CompetitorResearchReportsProps) {
  const [expandedReport, setExpandedReport] = useState<string | null>(
    reports[0]?.id || null
  );
  const [fullReportView, setFullReportView] = useState<string | null>(null);

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            Research Reports
          </CardTitle>
          <CardDescription>
            Your competitor research reports will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No reports yet</h3>
            <p className="text-gray-500 mt-1 max-w-sm">
              Start researching a competitor to gather actionable intelligence
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If viewing full report, show the full report view
  if (fullReportView) {
    const report = reports.find((r) => r.id === fullReportView);
    if (report) {
      const metadata = report.metadata ? JSON.parse(report.metadata) : {};
      const fullReport = report.rawResponse || "";
      const findings: Finding[] = report.findings ? JSON.parse(report.findings) : [];
      const sources: Source[] = report.sources ? JSON.parse(report.sources) : [];
      const recommendations: string[] = report.recommendations ? JSON.parse(report.recommendations) : [];

      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFullReportView(null)}
                  className="mb-2 -ml-2 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Reports
                </Button>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-500" />
                  Full Competitive Report: {metadata.competitorName || report.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  {metadata.researchEngine === "claude" && (
                    <Badge className="bg-purple-100 text-purple-700">
                      Powered by Claude Deep Research
                    </Badge>
                  )}
                  <span>
                    Generated{" "}
                    {formatDistanceToNow(new Date(report.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[800px] pr-4">
              <div className="space-y-6">
                {/* Full Markdown Report */}
                {fullReport && (
                  <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-800">
                    <ReactMarkdown>{fullReport}</ReactMarkdown>
                  </div>
                )}

                {/* Structured Findings (fallback if no markdown) */}
                {!fullReport && findings.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-amber-500" />
                      Key Intelligence
                    </h3>
                    <div className="space-y-3">
                      {findings.map((finding, index) => (
                        <FindingCard key={index} finding={finding} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Strategic Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"
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
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Sources</h3>
                    <div className="space-y-2">
                      {sources.map((source, index) => (
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
            </ScrollArea>
          </CardContent>
        </Card>
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-500" />
          Research Reports
        </CardTitle>
        <CardDescription>
          View your competitor intelligence reports - powered by Claude Deep Research
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[700px] pr-4">
          <div className="space-y-4">
            {reports.map((report) => {
              const isExpanded = expandedReport === report.id;
              const metadata = report.metadata ? JSON.parse(report.metadata) : {};
              const battleCard: BattleCardSummary | null = metadata.battleCardSummary || null;

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
                          {metadata.competitorName || report.title}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(report.createdAt), {
                            addSuffix: true,
                          })}
                          {metadata.researchEngine === "claude" && (
                            <Badge variant="outline" className="ml-2 text-[10px] border-purple-200 text-purple-600">
                              Claude
                            </Badge>
                          )}
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

                  {/* Battle Card Summary View (when expanded and completed) */}
                  {isExpanded && report.status === "completed" && (
                    <div className="border-t border-gray-200 p-4 space-y-5">
                      {battleCard ? (
                        <BattleCardView
                          battleCard={battleCard}
                          summary={report.summary}
                          onViewFullReport={() => setFullReportView(report.id)}
                        />
                      ) : (
                        <LegacyReportView report={report} />
                      )}

                      {/* View Full Report Button */}
                      {(report.rawResponse || report.findings) && (
                        <div className="flex justify-center pt-2">
                          <Button
                            onClick={() => setFullReportView(report.id)}
                            className="gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                          >
                            <Eye className="h-4 w-4" />
                            View Full Competitive Report
                            <ChevronRight className="h-4 w-4" />
                          </Button>
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
                          Claude Deep Research in Progress
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Conducting forensic competitive intelligence analysis...
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          This may take 1-2 minutes for comprehensive results
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
                          There was an error researching this competitor. Please try again.
                        </p>
                        <Button variant="outline" className="mt-4">
                          Retry Research
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

// Battle Card Summary View Component
function BattleCardView({
  battleCard,
  summary,
  onViewFullReport,
}: {
  battleCard: BattleCardSummary;
  summary?: string | null;
  onViewFullReport: () => void;
}) {
  const threatColors = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="space-y-4">
      {/* Header with Threat Level */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-purple-500" />
          <h4 className="font-semibold text-gray-900">Battle Card Summary</h4>
        </div>
        <Badge className={`${threatColors[battleCard.overallThreatLevel]} border`}>
          {battleCard.overallThreatLevel === "high" ? "High Threat" :
           battleCard.overallThreatLevel === "medium" ? "Medium Threat" : "Low Threat"}
        </Badge>
      </div>

      {/* Executive Summary */}
      {summary && (
        <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Strengths Comparison */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
          <h5 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Your Strengths
          </h5>
          <ul className="space-y-1">
            {battleCard.keyStrengths.yours.map((s, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-3">
          <h5 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-1">
            <Target className="h-4 w-4" />
            Their Strengths
          </h5>
          <ul className="space-y-1">
            {battleCard.keyStrengths.theirs.map((s, i) => (
              <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                <AlertTriangle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Pricing & Positioning */}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-gray-50 border p-3">
          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Pricing</h5>
          <p className="text-sm text-gray-700">{battleCard.pricingComparison}</p>
        </div>
        <div className="rounded-lg bg-gray-50 border p-3">
          <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Positioning</h5>
          <p className="text-sm text-gray-700">{battleCard.marketPositioning}</p>
        </div>
      </div>

      {/* Opportunities, Threats, Quick Wins */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
          <h5 className="text-xs font-semibold text-green-700 uppercase mb-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Opportunities
          </h5>
          <ul className="space-y-1">
            {battleCard.topOpportunities.map((o, i) => (
              <li key={i} className="text-xs text-gray-600">{o}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50/50 p-3">
          <h5 className="text-xs font-semibold text-red-700 uppercase mb-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Threats
          </h5>
          <ul className="space-y-1">
            {battleCard.topThreats.map((t, i) => (
              <li key={i} className="text-xs text-gray-600">{t}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
          <h5 className="text-xs font-semibold text-amber-700 uppercase mb-2 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Quick Wins
          </h5>
          <ul className="space-y-1">
            {battleCard.quickWins.map((w, i) => (
              <li key={i} className="text-xs text-gray-600">{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Talking Points */}
      {battleCard.talkingPoints.length > 0 && (
        <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3">
          <h5 className="text-xs font-semibold text-purple-700 uppercase mb-2">
            Sales Talking Points
          </h5>
          <div className="grid gap-2 md:grid-cols-2">
            {battleCard.talkingPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-[10px] font-semibold">
                  {i + 1}
                </span>
                {point}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Legacy report view for reports without battle card
function LegacyReportView({ report }: { report: Report }) {
  const findings: Finding[] = report.findings ? JSON.parse(report.findings) : [];
  const sources: Source[] = report.sources ? JSON.parse(report.sources) : [];
  const recommendations: string[] = report.recommendations ? JSON.parse(report.recommendations) : [];
  const metadata = report.metadata ? JSON.parse(report.metadata) : {};

  return (
    <div className="space-y-6">
      {/* Research Criteria */}
      {metadata.criteria && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Research Focus</h4>
          <div className="flex flex-wrap gap-2">
            {metadata.criteria.map((criterion: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {criterion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {report.summary && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Executive Summary</h4>
          <p className="text-gray-600 text-sm leading-relaxed bg-amber-50 p-4 rounded-lg border border-amber-100">
            {report.summary}
          </p>
        </div>
      )}

      {/* Findings */}
      {findings.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            Key Intelligence
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
            Strategic Recommendations
          </h4>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg"
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
          <h4 className="font-semibold text-gray-900 mb-3">Sources</h4>
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
          Researching
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
              {finding.importance}
            </Badge>
          </div>
          <h5 className="font-semibold text-gray-900">{finding.title}</h5>
          <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
        </div>
      </div>
    </div>
  );
}
