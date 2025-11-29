"use client";

import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Metrics {
  objectionHandling: number | null;
  productKnowledge: number | null;
  rapport: number | null;
  closingSkills: number | null;
  listeningSkills: number | null;
  overallScore: number | null;
}

interface Session {
  id: string;
  score: number | null;
  createdAt: Date;
}

interface PerformanceMetricsProps {
  metrics: Metrics[];
  sessions: Session[];
}

const skillLabels: Record<string, string> = {
  objectionHandling: "Objection Handling",
  productKnowledge: "Product Knowledge",
  rapport: "Building Rapport",
  closingSkills: "Closing Skills",
  listeningSkills: "Active Listening",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

function getTrend(
  current: number | null,
  previous: number | null
): "up" | "down" | "neutral" {
  if (current === null || previous === null) return "neutral";
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
}

export function PerformanceMetrics({
  metrics,
  sessions,
}: PerformanceMetricsProps) {
  const latestMetrics = metrics[0];
  const previousMetrics = metrics[1];

  // Calculate averages
  const completedSessions = sessions.filter((s) => s.score !== null);
  const recentSessions = completedSessions.slice(0, 5);
  const olderSessions = completedSessions.slice(5, 10);

  const recentAvg =
    recentSessions.length > 0
      ? Math.round(
          recentSessions.reduce((acc, s) => acc + (s.score || 0), 0) /
            recentSessions.length
        )
      : 0;

  const olderAvg =
    olderSessions.length > 0
      ? Math.round(
          olderSessions.reduce((acc, s) => acc + (s.score || 0), 0) /
            olderSessions.length
        )
      : 0;

  const overallTrend = getTrend(recentAvg, olderAvg);

  if (!latestMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No performance data yet
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Complete training sessions to track your performance over time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overall Performance */}
      <div className="rounded-lg border bg-gray-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Overall Performance
            </h3>
            <p className="text-sm text-gray-500">
              Based on your recent training sessions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{recentAvg}%</p>
              <p className="text-sm text-gray-500">Recent Average</p>
            </div>
            {overallTrend === "up" && (
              <TrendingUp className="h-6 w-6 text-green-500" />
            )}
            {overallTrend === "down" && (
              <TrendingDown className="h-6 w-6 text-red-500" />
            )}
            {overallTrend === "neutral" && (
              <Minus className="h-6 w-6 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Skill Breakdown */}
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          Skill Breakdown
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(skillLabels).map(([key, label]) => {
            const score = latestMetrics[key as keyof Metrics] as number | null;
            const prevScore = previousMetrics?.[key as keyof Metrics] as
              | number
              | null;
            const trend = getTrend(score, prevScore);

            return (
              <div key={key} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{label}</span>
                  <div className="flex items-center gap-2">
                    {score !== null ? (
                      <>
                        <span className="text-lg font-bold">{score}%</span>
                        {trend === "up" && (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                        {trend === "down" && (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </div>
                </div>
                {score !== null && (
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all ${getScoreColor(score)}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h4 className="font-medium text-blue-900">Tips for Improvement</h4>
        <ul className="mt-2 space-y-2 text-sm text-blue-800">
          {latestMetrics.objectionHandling !== null &&
            latestMetrics.objectionHandling < 70 && (
              <li>
                Practice acknowledging concerns before addressing them directly
              </li>
            )}
          {latestMetrics.productKnowledge !== null &&
            latestMetrics.productKnowledge < 70 && (
              <li>
                Review floorplan features and community amenities regularly
              </li>
            )}
          {latestMetrics.rapport !== null && latestMetrics.rapport < 70 && (
            <li>Focus on asking open-ended questions and active listening</li>
          )}
          {latestMetrics.closingSkills !== null &&
            latestMetrics.closingSkills < 70 && (
              <li>
                Practice trial closes and look for buying signals throughout
              </li>
            )}
          {(!latestMetrics.objectionHandling ||
            latestMetrics.objectionHandling >= 70) &&
            (!latestMetrics.productKnowledge ||
              latestMetrics.productKnowledge >= 70) &&
            (!latestMetrics.rapport || latestMetrics.rapport >= 70) &&
            (!latestMetrics.closingSkills ||
              latestMetrics.closingSkills >= 70) && (
              <li>
                Great work! Keep practicing to maintain your skills.
              </li>
            )}
        </ul>
      </div>
    </div>
  );
}
