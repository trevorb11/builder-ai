"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  TrendingUp,
  Lightbulb,
  Globe,
  Share2,
  Star,
  Search,
  Bot,
  BarChart3,
  ArrowRight,
  Target,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AIReadinessScore, extractAIReadinessData } from "./ai-readiness-score";

interface DataPoint {
  label: string;
  value: string;
  source?: string;
  date?: string;
}

interface ResearchMetric {
  name: string;
  value: string | number;
  benchmark?: string | number;
  trend?: "up" | "down" | "stable";
  interpretation?: string;
}

interface Finding {
  category: string;
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  details?: string;
  dataPoints?: DataPoint[];
  actionItems?: string[];
  metrics?: ResearchMetric[];
}

interface Source {
  url: string;
  title: string;
  snippet?: string;
  relevance: number;
}

interface SectionScore {
  section: string;
  score: number;
  maxScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
  strengths: string[];
  weaknesses: string[];
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

interface DigitalFootprintReportsProps {
  reports: Report[];
}

// Category configuration for organized display
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  website: { icon: <Globe className="h-4 w-4" />, color: "text-blue-500", label: "Website" },
  social: { icon: <Share2 className="h-4 w-4" />, color: "text-pink-500", label: "Social Media" },
  reputation: { icon: <Star className="h-4 w-4" />, color: "text-amber-500", label: "Reputation" },
  seo: { icon: <Search className="h-4 w-4" />, color: "text-green-500", label: "SEO" },
  ai: { icon: <Bot className="h-4 w-4" />, color: "text-purple-500", label: "AI Readiness" },
  local: { icon: <Target className="h-4 w-4" />, color: "text-teal-500", label: "Local SEO" },
  performance: { icon: <Zap className="h-4 w-4" />, color: "text-orange-500", label: "Performance" },
};

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
              Start your first digital footprint analysis to understand your online presence and AI readiness
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
          View your digital footprint analysis results with AI readiness insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[800px] pr-4">
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

              // Extract AI readiness data
              const aiReadinessData = extractAIReadinessData(findings);

              // Categorize findings
              const categorizedFindings = categorizeFindings(findings);

              // Extract section scores from metadata or rawResponse
              let sectionScores: SectionScore[] = [];
              let overallScore: number | null = null;
              let overallGrade: string | null = null;
              try {
                const metadata = report.metadata ? JSON.parse(report.metadata) : null;
                if (metadata?.sectionScores) {
                  sectionScores = metadata.sectionScores;
                  overallScore = metadata.overallScore;
                  overallGrade = metadata.overallGrade;
                } else if (report.rawResponse) {
                  const raw = JSON.parse(report.rawResponse);
                  if (raw.sectionScores) {
                    sectionScores = raw.sectionScores;
                    overallScore = raw.overallScore;
                    overallGrade = raw.overallGrade;
                  }
                }
              } catch {
                // Older reports without section scores
              }
              const hasScorecard = sectionScores.length > 0;

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
                    <div className="border-t border-gray-200">
                      <Tabs defaultValue={hasScorecard ? "scorecard" : "ai-readiness"} className="w-full">
                        <div className="border-b border-gray-200 px-4">
                          <TabsList className="h-12 w-full justify-start gap-2 bg-transparent p-0">
                            {hasScorecard && (
                              <TabsTrigger
                                value="scorecard"
                                className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 rounded-none px-4"
                              >
                                <Target className="h-4 w-4" />
                                Scorecard
                              </TabsTrigger>
                            )}
                            <TabsTrigger
                              value="ai-readiness"
                              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-600 rounded-none px-4"
                            >
                              <Bot className="h-4 w-4" />
                              AI Readiness
                            </TabsTrigger>
                            <TabsTrigger
                              value="overview"
                              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-teal-500 data-[state=active]:text-teal-600 rounded-none px-4"
                            >
                              <BarChart3 className="h-4 w-4" />
                              Overview
                            </TabsTrigger>
                            <TabsTrigger
                              value="findings"
                              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 rounded-none px-4"
                            >
                              <TrendingUp className="h-4 w-4" />
                              All Findings
                            </TabsTrigger>
                            <TabsTrigger
                              value="actions"
                              className="flex items-center gap-2 data-[state=active]:border-b-2 data-[state=active]:border-amber-500 data-[state=active]:text-amber-600 rounded-none px-4"
                            >
                              <Lightbulb className="h-4 w-4" />
                              Action Items
                            </TabsTrigger>
                          </TabsList>
                        </div>

                        {/* Scorecard Tab */}
                        {hasScorecard && (
                          <TabsContent value="scorecard" className="p-4 mt-0 space-y-6">
                            {/* Overall Score */}
                            <div className="flex items-center gap-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-6">
                              <div className="relative flex-shrink-0">
                                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r="52"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="10"
                                  />
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r="52"
                                    fill="none"
                                    stroke={
                                      (overallScore || 0) >= 75 ? "#22c55e" :
                                      (overallScore || 0) >= 60 ? "#eab308" :
                                      (overallScore || 0) >= 40 ? "#f97316" : "#ef4444"
                                    }
                                    strokeWidth="10"
                                    strokeDasharray={`${((overallScore || 0) / 100) * 327} 327`}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-3xl font-bold text-gray-900">{overallScore}</span>
                                  <span className="text-xs text-gray-500">/100</span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-xl font-bold text-gray-900">Overall Digital Presence</h3>
                                  <Badge className={
                                    overallGrade === "A" ? "bg-green-100 text-green-700" :
                                    overallGrade === "B" ? "bg-blue-100 text-blue-700" :
                                    overallGrade === "C" ? "bg-yellow-100 text-yellow-700" :
                                    overallGrade === "D" ? "bg-orange-100 text-orange-700" :
                                    "bg-red-100 text-red-700"
                                  }>
                                    Grade: {overallGrade}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                  {report.summary}
                                </p>
                              </div>
                            </div>

                            {/* Section Score Cards */}
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-4">Section Breakdown</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {sectionScores.map((section) => {
                                  const sectionConfig = getSectionConfig(section.section);
                                  return (
                                    <SectionScoreCard
                                      key={section.section}
                                      section={section}
                                      icon={sectionConfig.icon}
                                      color={sectionConfig.color}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </TabsContent>
                        )}

                        {/* AI Readiness Tab */}
                        <TabsContent value="ai-readiness" className="p-4 mt-0">
                          {aiReadinessData && (
                            <AIReadinessScore data={aiReadinessData} />
                          )}
                        </TabsContent>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="p-4 mt-0 space-y-6">
                          {/* Summary */}
                          {report.summary && (
                            <div className="rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 p-4">
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-teal-500" />
                                Executive Summary
                              </h4>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {report.summary}
                              </p>
                            </div>
                          )}

                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <QuickStat
                              label="Total Findings"
                              value={findings.length}
                              icon={<FileText className="h-4 w-4" />}
                              color="blue"
                            />
                            <QuickStat
                              label="High Priority"
                              value={findings.filter((f) => f.importance === "high").length}
                              icon={<TrendingUp className="h-4 w-4" />}
                              color="red"
                            />
                            <QuickStat
                              label="Action Items"
                              value={recommendations.length}
                              icon={<Lightbulb className="h-4 w-4" />}
                              color="amber"
                            />
                            <QuickStat
                              label="Sources"
                              value={sources.length}
                              icon={<ExternalLink className="h-4 w-4" />}
                              color="green"
                            />
                          </div>

                          {/* Category Summary */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Analysis by Category
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {Object.entries(categorizedFindings).map(
                                ([category, catFindings]) => {
                                  const config = getCategoryConfig(category);
                                  const highCount = catFindings.filter(
                                    (f) => f.importance === "high"
                                  ).length;
                                  return (
                                    <div
                                      key={category}
                                      className="rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors"
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className={config.color}>{config.icon}</span>
                                        <span className="font-medium text-sm text-gray-900">
                                          {config.label}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">
                                          {catFindings.length} findings
                                        </span>
                                        {highCount > 0 && (
                                          <Badge className="bg-red-100 text-red-700 text-[10px]">
                                            {highCount} high priority
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </TabsContent>

                        {/* All Findings Tab */}
                        <TabsContent value="findings" className="p-4 mt-0 space-y-6">
                          {Object.entries(categorizedFindings).map(
                            ([category, catFindings]) => {
                              const config = getCategoryConfig(category);
                              return (
                                <div key={category}>
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className={config.color}>{config.icon}</span>
                                    {config.label}
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {catFindings.length}
                                    </Badge>
                                  </h4>
                                  <div className="space-y-3">
                                    {catFindings.map((finding, index) => (
                                      <EnhancedFindingCard
                                        key={index}
                                        finding={finding}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </TabsContent>

                        {/* Action Items Tab */}
                        <TabsContent value="actions" className="p-4 mt-0 space-y-6">
                          {/* Priority Actions */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-red-500" />
                              High Priority Actions
                            </h4>
                            <div className="space-y-2">
                              {findings
                                .filter((f) => f.importance === "high")
                                .flatMap((f) => f.actionItems || [f.description])
                                .slice(0, 5)
                                .map((action, idx) => (
                                  <ActionItem key={idx} action={action} priority="high" />
                                ))}
                            </div>
                          </div>

                          {/* All Recommendations */}
                          {recommendations.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                All Recommendations
                              </h4>
                              <div className="space-y-2">
                                {recommendations.map((rec, index) => (
                                  <ActionItem
                                    key={index}
                                    action={rec}
                                    priority={index < 3 ? "high" : index < 7 ? "medium" : "low"}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sources */}
                          {sources.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">
                                Research Sources
                              </h4>
                              <div className="space-y-2">
                                {sources.slice(0, 8).map((source, index) => (
                                  <a
                                    key={index}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                  >
                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">
                                      {source.title || source.url}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
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
                          Multi-Pass Deep Analysis in Progress
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-md">
                          Running 7 focused AI research passes for a comprehensive analysis of your entire digital presence...
                        </p>
                        <div className="mt-4 space-y-2 text-left w-full max-w-xs">
                          {[
                            "Website & UX Analysis",
                            "Social Media Audit",
                            "Reputation & Reviews",
                            "SEO & Local Search",
                            "AI Search Visibility",
                            "Competitive Benchmarking",
                            "Executive Report",
                          ].map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: `${idx * 300}ms` }} />
                              {step}
                            </div>
                          ))}
                        </div>
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

function QuickStat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "red" | "amber" | "green";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    red: "bg-red-50 text-red-600 border-red-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    green: "bg-green-50 text-green-600 border-green-200",
  };

  return (
    <div className={`rounded-lg border p-3 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function EnhancedFindingCard({ finding }: { finding: Finding }) {
  const importanceColors = {
    high: "border-l-red-500 bg-red-50/50",
    medium: "border-l-amber-500 bg-amber-50/50",
    low: "border-l-blue-500 bg-blue-50/50",
  };

  const importanceBadgeColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-blue-100 text-blue-700",
  };

  return (
    <div
      className={`rounded-lg border-l-4 p-4 ${importanceColors[finding.importance]}`}
    >
      <div className="space-y-3">
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

        {/* Metrics */}
        {finding.metrics && finding.metrics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {finding.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs border"
              >
                <span className="text-gray-500">{metric.name}:</span>
                <span className="font-semibold text-gray-900">{metric.value}</span>
                {metric.benchmark && (
                  <span className="text-gray-400">/ {metric.benchmark}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Data Points */}
        {finding.dataPoints && finding.dataPoints.length > 0 && (
          <div className="text-xs text-gray-500 space-y-1">
            {finding.dataPoints.slice(0, 3).map((dp, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <ArrowRight className="h-3 w-3" />
                <span>
                  {dp.label}: <strong className="text-gray-700">{dp.value}</strong>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Items */}
        {finding.actionItems && finding.actionItems.length > 0 && (
          <div className="pt-2 border-t border-gray-200/50">
            <p className="text-xs font-medium text-gray-500 mb-1">Quick Actions:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {finding.actionItems.slice(0, 2).map((action, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionItem({
  action,
  priority,
}: {
  action: string;
  priority: "high" | "medium" | "low";
}) {
  const priorityColors = {
    high: "border-l-red-500 bg-red-50",
    medium: "border-l-amber-500 bg-amber-50",
    low: "border-l-blue-500 bg-blue-50",
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border-l-4 p-3 ${priorityColors[priority]}`}
    >
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
          priority === "high"
            ? "bg-red-200 text-red-700"
            : priority === "medium"
            ? "bg-amber-200 text-amber-700"
            : "bg-blue-200 text-blue-700"
        }`}
      >
        {priority === "high" ? "!" : priority === "medium" ? "•" : "○"}
      </div>
      <p className="text-sm text-gray-700">{action}</p>
    </div>
  );
}

// Section score configuration for the scorecard
const SECTION_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  Website: { icon: <Globe className="h-5 w-5" />, color: "text-blue-500" },
  "Social Media": { icon: <Share2 className="h-5 w-5" />, color: "text-pink-500" },
  Reputation: { icon: <Star className="h-5 w-5" />, color: "text-amber-500" },
  SEO: { icon: <Search className="h-5 w-5" />, color: "text-green-500" },
  "AI Visibility": { icon: <Bot className="h-5 w-5" />, color: "text-purple-500" },
  Competitive: { icon: <Target className="h-5 w-5" />, color: "text-teal-500" },
};

function getSectionConfig(section: string): { icon: React.ReactNode; color: string } {
  return SECTION_CONFIG[section] || { icon: <BarChart3 className="h-5 w-5" />, color: "text-gray-500" };
}

function SectionScoreCard({
  section,
  icon,
  color,
}: {
  section: SectionScore;
  icon: React.ReactNode;
  color: string;
}) {
  const gradeColors = {
    A: "bg-green-100 text-green-700 border-green-200",
    B: "bg-blue-100 text-blue-700 border-blue-200",
    C: "bg-yellow-100 text-yellow-700 border-yellow-200",
    D: "bg-orange-100 text-orange-700 border-orange-200",
    F: "bg-red-100 text-red-700 border-red-200",
  };

  const barColor =
    section.score >= 75 ? "bg-green-500" :
    section.score >= 60 ? "bg-yellow-500" :
    section.score >= 40 ? "bg-orange-500" : "bg-red-500";

  return (
    <div className="rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={color}>{icon}</span>
          <h5 className="font-semibold text-gray-900">{section.section}</h5>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{section.score}</span>
          <span className="text-xs text-gray-400">/100</span>
          <Badge className={`text-xs ${gradeColors[section.grade]}`}>
            {section.grade}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${section.score}%` }}
        />
      </div>

      {/* Summary */}
      <p className="text-xs text-gray-600 mb-3">{section.summary}</p>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-3">
        {section.strengths.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1">Strengths</p>
            <ul className="space-y-0.5">
              {section.strengths.slice(0, 3).map((s, i) => (
                <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {section.weaknesses.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider mb-1">Needs Work</p>
            <ul className="space-y-0.5">
              {section.weaknesses.slice(0, 3).map((w, i) => (
                <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                  <XCircle className="h-3 w-3 text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryConfig(category: string): { icon: React.ReactNode; color: string; label: string } {
  const lower = category.toLowerCase();

  for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
    if (lower.includes(key)) {
      return config;
    }
  }

  // Default fallback
  return {
    icon: <FileText className="h-4 w-4" />,
    color: "text-gray-500",
    label: category,
  };
}

function categorizeFindings(findings: Finding[]): Record<string, Finding[]> {
  const categories: Record<string, Finding[]> = {};

  findings.forEach((finding) => {
    const category = finding.category?.toLowerCase() || "general";

    // Determine the main category
    let mainCategory = "general";
    if (category.includes("website") || category.includes("technical") || category.includes("performance")) {
      mainCategory = "website";
    } else if (category.includes("social") || category.includes("facebook") || category.includes("instagram")) {
      mainCategory = "social";
    } else if (category.includes("review") || category.includes("reputation") || category.includes("rating")) {
      mainCategory = "reputation";
    } else if (category.includes("seo") || category.includes("search") && !category.includes("ai")) {
      mainCategory = "seo";
    } else if (category.includes("ai") || category.includes("chatgpt") || category.includes("visibility")) {
      mainCategory = "ai";
    } else if (category.includes("local") || category.includes("google business") || category.includes("map")) {
      mainCategory = "local";
    }

    if (!categories[mainCategory]) {
      categories[mainCategory] = [];
    }
    categories[mainCategory].push(finding);
  });

  // Sort categories by priority (AI first, then website, SEO, etc.)
  const sortedCategories: Record<string, Finding[]> = {};
  const order = ["ai", "website", "seo", "local", "social", "reputation", "general"];

  order.forEach((cat) => {
    if (categories[cat] && categories[cat].length > 0) {
      sortedCategories[cat] = categories[cat];
    }
  });

  // Add any remaining categories
  Object.entries(categories).forEach(([cat, findings]) => {
    if (!sortedCategories[cat]) {
      sortedCategories[cat] = findings;
    }
  });

  return sortedCategories;
}
