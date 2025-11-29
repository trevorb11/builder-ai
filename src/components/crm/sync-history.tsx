"use client";

import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { CheckCircle, XCircle, RefreshCw, User, MessageSquare } from "lucide-react";

interface SyncLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  status: string;
  error: string | null;
  createdAt: Date;
  integration: {
    provider: string;
  };
}

interface SyncHistoryProps {
  syncLogs: SyncLog[];
}

const actionLabels: Record<string, string> = {
  create: "Created",
  update: "Updated",
  sync: "Synced",
};

const entityLabels: Record<string, string> = {
  lead: "Lead",
  contact: "Contact",
  conversation: "Conversation",
  activity: "Activity",
};

const providerColors: Record<string, string> = {
  hubspot: "bg-orange-100 text-orange-800",
  salesforce: "bg-blue-100 text-blue-800",
  gohighlevel: "bg-green-100 text-green-800",
};

export function SyncHistory({ syncLogs }: SyncHistoryProps) {
  if (syncLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <RefreshCw className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No sync history yet
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Sync activity will appear here once you connect a CRM and capture leads.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {syncLogs.map((log) => (
        <div
          key={log.id}
          className={`rounded-lg border p-4 ${
            log.status === "error" ? "border-red-200 bg-red-50" : ""
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {log.status === "success" ? (
                <CheckCircle className="mt-0.5 h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 text-red-500" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      providerColors[log.integration.provider] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {log.integration.provider}
                  </span>
                  <span className="font-medium text-gray-900">
                    {actionLabels[log.action] || log.action}{" "}
                    {entityLabels[log.entity] || log.entity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  ID: {log.entityId}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatDateTime(log.createdAt)}
                </p>
              </div>
            </div>
            <Badge
              variant={log.status === "success" ? "success" : "destructive"}
            >
              {log.status}
            </Badge>
          </div>
          {log.error && (
            <div className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">
              {log.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
