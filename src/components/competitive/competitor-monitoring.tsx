"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Radio,
  Clock,
  CheckCircle2,
  Loader2,
  Globe,
  AlertTriangle,
  Play,
  Pause,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MonitorReport {
  id: string;
  findings: string;
  summary: string;
  hasUpdates: boolean;
  checkedAt: Date;
}

interface MonitorFinding {
  category: string;
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  sourceUrl?: string;
}

interface Monitor {
  id: string;
  websiteUrl: string;
  intervalHours: number;
  isActive: boolean;
  lastCheckedAt: Date | null;
  nextCheckAt: Date | null;
  competitor: {
    id: string;
    name: string;
    website: string | null;
  };
  reports: MonitorReport[];
}

interface CompetitorMonitoringProps {
  monitors: Monitor[];
}

export function CompetitorMonitoring({ monitors }: CompetitorMonitoringProps) {
  const [expandedMonitor, setExpandedMonitor] = useState<string | null>(
    monitors[0]?.id || null
  );
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleToggle = async (monitorId: string, isActive: boolean) => {
    setLoadingAction(monitorId + "-toggle");
    try {
      await fetch(`/api/competitors/monitor/${monitorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to toggle monitor:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async (monitorId: string) => {
    if (!confirm("Are you sure you want to delete this monitor?")) return;

    setLoadingAction(monitorId + "-delete");
    try {
      await fetch(`/api/competitors/monitor/${monitorId}`, {
        method: "DELETE",
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete monitor:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCheckNow = async (monitorId: string) => {
    setLoadingAction(monitorId + "-check");
    try {
      await fetch("/api/competitors/monitor/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monitorId }),
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to run monitor check:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const getIntervalLabel = (hours: number) => {
    if (hours < 24) return `Every ${hours} hours`;
    if (hours === 24) return "Daily";
    if (hours === 48) return "Every 2 days";
    if (hours === 72) return "Every 3 days";
    if (hours === 168) return "Weekly";
    return `Every ${Math.round(hours / 24)} days`;
  };

  if (monitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-4 mb-4">
          <Radio className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          No monitors set up yet
        </h3>
        <p className="text-gray-500 mt-1 max-w-sm">
          Go to the Competitors tab and click the &quot;Monitor&quot; button on any competitor
          to set up automated website monitoring.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        {monitors.map((monitor) => {
          const isExpanded = expandedMonitor === monitor.id;
          const isLoading = loadingAction?.startsWith(monitor.id);

          return (
            <div
              key={monitor.id}
              className="rounded-lg border border-gray-200 bg-white overflow-hidden"
            >
              {/* Monitor Header */}
              <div className="flex items-center justify-between p-4">
                <button
                  onClick={() =>
                    setExpandedMonitor(isExpanded ? null : monitor.id)
                  }
                  className="flex items-center gap-3 text-left flex-1"
                >
                  <div
                    className={`rounded-full p-2 ${
                      monitor.isActive
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Radio
                      className={`h-4 w-4 ${
                        monitor.isActive
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {monitor.competitor.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Globe className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">
                        {monitor.websiteUrl}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          monitor.isActive
                            ? "border-green-200 text-green-600"
                            : "border-gray-200 text-gray-400"
                        }`}
                      >
                        {monitor.isActive ? "Active" : "Paused"}
                      </Badge>
                      <span className="text-xs">
                        {getIntervalLabel(monitor.intervalHours)}
                      </span>
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  {/* Check Now */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCheckNow(monitor.id)}
                    disabled={isLoading}
                    className="gap-1 text-xs"
                  >
                    {loadingAction === monitor.id + "-check" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    Check Now
                  </Button>

                  {/* Toggle Active */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(monitor.id, monitor.isActive)}
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
                  >
                    {monitor.isActive ? (
                      <Pause className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Play className="h-4 w-4 text-green-500" />
                    )}
                  </Button>

                  {/* Delete */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(monitor.id)}
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>

                  <button
                    onClick={() =>
                      setExpandedMonitor(isExpanded ? null : monitor.id)
                    }
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Monitor Details & Reports */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  {/* Last Check Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {monitor.lastCheckedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last checked:{" "}
                        {formatDistanceToNow(new Date(monitor.lastCheckedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                    {monitor.nextCheckAt && monitor.isActive && (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        Next check:{" "}
                        {formatDistanceToNow(new Date(monitor.nextCheckAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>

                  {/* Monitor Reports */}
                  {monitor.reports.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-sm">
                        No monitoring reports yet. Click &quot;Check Now&quot; to run the
                        first check.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Recent Reports
                      </h4>
                      {monitor.reports.map((report) => {
                        let findings: MonitorFinding[] = [];
                        try {
                          findings = JSON.parse(report.findings);
                        } catch {
                          /* empty */
                        }

                        return (
                          <div
                            key={report.id}
                            className={`rounded-lg border p-3 ${
                              report.hasUpdates
                                ? "border-amber-200 bg-amber-50/50"
                                : "border-gray-200 bg-gray-50/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {report.hasUpdates ? (
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                                <span className="text-sm font-medium text-gray-900">
                                  {report.hasUpdates
                                    ? "Updates Found"
                                    : "No Changes Detected"}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(
                                  new Date(report.checkedAt),
                                  { addSuffix: true }
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {report.summary}
                            </p>

                            {/* Findings */}
                            {findings.length > 0 && (
                              <div className="space-y-2 mt-3">
                                {findings.map((finding, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] flex-shrink-0 ${
                                        finding.importance === "high"
                                          ? "border-red-200 text-red-600"
                                          : finding.importance === "medium"
                                          ? "border-amber-200 text-amber-600"
                                          : "border-blue-200 text-blue-600"
                                      }`}
                                    >
                                      {finding.category}
                                    </Badge>
                                    <div>
                                      <span className="font-medium text-gray-800">
                                        {finding.title}
                                      </span>
                                      <p className="text-gray-500 mt-0.5">
                                        {finding.description}
                                      </p>
                                      {finding.sourceUrl && (
                                        <a
                                          href={finding.sourceUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-blue-500 hover:underline mt-0.5"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          Source
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
