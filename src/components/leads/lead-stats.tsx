"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Star,
  MessageSquare,
} from "lucide-react";

interface Lead {
  id: string;
  source: string | null;
  status: string;
  score: number;
  createdAt: Date;
  community: { id: string; name: string } | null;
  floorplan: { id: string; name: string } | null;
  conversations: {
    id: string;
    messages: { id: string }[];
  }[];
}

interface LeadStatsProps {
  leads: Lead[];
}

export function LeadStats({ leads }: LeadStatsProps) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">No data yet</h3>
        <p className="mt-2 text-gray-500">
          Lead analytics will appear when you have lead data.
        </p>
      </div>
    );
  }

  // Source distribution
  const sourceCounts = leads.reduce((acc, l) => {
    const source = l.source || "unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Status distribution
  const statusCounts = leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Community interest
  const communityCounts = leads.reduce((acc, l) => {
    if (l.community) {
      acc[l.community.name] = (acc[l.community.name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Floorplan interest
  const floorplanCounts = leads.reduce((acc, l) => {
    if (l.floorplan) {
      acc[l.floorplan.name] = (acc[l.floorplan.name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Score distribution
  const highScoreLeads = leads.filter((l) => l.score >= 70).length;
  const mediumScoreLeads = leads.filter((l) => l.score >= 40 && l.score < 70).length;
  const lowScoreLeads = leads.filter((l) => l.score < 40).length;

  // Conversation stats
  const totalMessages = leads.reduce(
    (acc, l) => acc + l.conversations.reduce((a, c) => a + c.messages.length, 0),
    0
  );
  const avgMessagesPerLead = leads.length > 0 ? Math.round(totalMessages / leads.length) : 0;

  // Time analysis - leads by day of week
  const dayOfWeekCounts = leads.reduce((acc, l) => {
    const day = new Date(l.createdAt).toLocaleDateString("en-US", { weekday: "long" });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Conversion rate
  const closedWon = leads.filter((l) => l.status === "closed_won").length;
  const totalClosed = leads.filter(
    (l) => l.status === "closed_won" || l.status === "closed_lost"
  ).length;
  const conversionRate = totalClosed > 0 ? Math.round((closedWon / totalClosed) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-gray-500">
              {closedWon} won / {totalClosed} closed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Hot Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{highScoreLeads}</div>
            <p className="text-xs text-gray-500">Score 70+</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Avg. Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMessagesPerLead}</div>
            <p className="text-xs text-gray-500">per lead conversation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Badge className="bg-green-100 text-green-800">High: {highScoreLeads}</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">Med: {mediumScoreLeads}</Badge>
              <Badge className="bg-gray-100 text-gray-800">Low: {lowScoreLeads}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lead Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(sourceCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="capitalize">{source.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 bg-blue-100 rounded"
                        style={{
                          width: `${(count / leads.length) * 100}px`,
                        }}
                      />
                      <span className="text-sm font-medium">{count}</span>
                      <span className="text-xs text-gray-500">
                        ({Math.round((count / leads.length) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([status, count]) => {
                  const colors: Record<string, string> = {
                    new: "bg-blue-500",
                    contacted: "bg-yellow-500",
                    qualified: "bg-purple-500",
                    nurturing: "bg-orange-500",
                    closed_won: "bg-green-500",
                    closed_lost: "bg-gray-500",
                  };
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[status] || "bg-gray-400"}`} />
                        <span className="capitalize">{status.replace("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 bg-gray-100 rounded"
                          style={{
                            width: `${(count / leads.length) * 100}px`,
                          }}
                        />
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Community Interest */}
        {Object.keys(communityCounts).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Community Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(communityCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([community, count]) => (
                    <div key={community} className="flex items-center justify-between">
                      <span className="truncate">{community}</span>
                      <Badge variant="outline">{count} leads</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Floorplan Interest */}
        {Object.keys(floorplanCounts).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Floorplan Interest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(floorplanCounts)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([floorplan, count]) => (
                    <div key={floorplan} className="flex items-center justify-between">
                      <span className="truncate">{floorplan}</span>
                      <Badge variant="outline">{count} leads</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Leads by Day of Week */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Leads by Day of Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end h-32">
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
              (day) => {
                const count = dayOfWeekCounts[day] || 0;
                const maxCount = Math.max(...Object.values(dayOfWeekCounts), 1);
                const height = (count / maxCount) * 100;
                return (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div
                      className="w-8 bg-blue-500 rounded-t transition-all"
                      style={{ height: `${height}%`, minHeight: count > 0 ? "4px" : "0" }}
                    />
                    <span className="text-xs text-gray-500">{day.slice(0, 3)}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
