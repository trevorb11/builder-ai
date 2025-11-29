"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Loader2, CheckCircle } from "lucide-react";

interface Integration {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  settings: string | null;
}

interface CRMSettingsProps {
  integrations: Integration[];
  organizationId: string;
}

const syncOptions = [
  {
    id: "sync_leads",
    name: "Sync New Leads",
    description: "Automatically create contacts in CRM when leads are captured",
  },
  {
    id: "sync_conversations",
    name: "Sync Conversations",
    description: "Attach chat transcripts to contact records",
  },
  {
    id: "sync_intent_score",
    name: "Lead Scoring",
    description: "Update lead scores based on conversation intent",
  },
  {
    id: "trigger_workflows",
    name: "Trigger Workflows",
    description: "Trigger automated follow-up sequences in CRM",
  },
  {
    id: "realtime_sync",
    name: "Real-time Sync",
    description: "Sync immediately instead of batching",
  },
];

export function CRMSettings({
  integrations,
  organizationId,
}: CRMSettingsProps) {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    sync_leads: true,
    sync_conversations: true,
    sync_intent_score: true,
    trigger_workflows: false,
    realtime_sync: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const activeIntegrations = integrations.filter((i) => i.isActive);

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);

    try {
      // Save settings to each active integration
      await Promise.all(
        activeIntegrations.map((integration) =>
          fetch(`/api/crm/${integration.id}/settings`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ settings }),
          })
        )
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  }

  if (activeIntegrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Settings className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          No CRM Connected
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Connect a CRM first to configure sync settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Active integrations:</span>
        {activeIntegrations.map((i) => (
          <Badge key={i.id} variant="outline">
            {i.provider}
          </Badge>
        ))}
      </div>

      <div className="space-y-4">
        {syncOptions.map((option) => (
          <div
            key={option.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <Label htmlFor={option.id} className="font-medium">
                {option.name}
              </Label>
              <p className="text-sm text-gray-500">{option.description}</p>
            </div>
            <Switch
              id={option.id}
              checked={settings[option.id]}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, [option.id]: checked })
              }
            />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <h4 className="font-medium text-yellow-900">Data Mapping</h4>
        <p className="mt-1 text-sm text-yellow-800">
          By default, Builder AI maps the following fields to your CRM:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-yellow-700">
          <li>• Email → Contact Email</li>
          <li>• Phone → Contact Phone</li>
          <li>• First Name, Last Name → Contact Name</li>
          <li>• Interested Communities → Custom Field / Tags</li>
          <li>• Intent Score → Lead Score</li>
          <li>• Conversation Transcript → Activity Note</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Saved!
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
