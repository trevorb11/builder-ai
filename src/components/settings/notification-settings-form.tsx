"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Mail, Bell } from "lucide-react";

interface NotificationPrefs {
  email: {
    newLeads: boolean;
    leadStatusChanges: boolean;
    crmSyncResults: boolean;
    competitorUpdates: boolean;
    aiSearchMentions: boolean;
    weeklyReport: boolean;
    marketingContentReady: boolean;
  };
  inApp: {
    newLeads: boolean;
    leadStatusChanges: boolean;
    crmSyncResults: boolean;
    competitorUpdates: boolean;
    aiSearchMentions: boolean;
    salesTrainingReminders: boolean;
    marketingContentReady: boolean;
  };
}

const defaultPrefs: NotificationPrefs = {
  email: {
    newLeads: true,
    leadStatusChanges: true,
    crmSyncResults: false,
    competitorUpdates: true,
    aiSearchMentions: true,
    weeklyReport: true,
    marketingContentReady: true,
  },
  inApp: {
    newLeads: true,
    leadStatusChanges: true,
    crmSyncResults: true,
    competitorUpdates: true,
    aiSearchMentions: true,
    salesTrainingReminders: true,
    marketingContentReady: true,
  },
};

const emailLabels: Record<string, string> = {
  newLeads: "New lead captured",
  leadStatusChanges: "Lead status changes",
  crmSyncResults: "CRM sync results",
  competitorUpdates: "Competitor activity updates",
  aiSearchMentions: "AI search mentions",
  weeklyReport: "Weekly performance report",
  marketingContentReady: "Marketing content ready for review",
};

const inAppLabels: Record<string, string> = {
  newLeads: "New lead captured",
  leadStatusChanges: "Lead status changes",
  crmSyncResults: "CRM sync results",
  competitorUpdates: "Competitor activity updates",
  aiSearchMentions: "AI search mentions",
  salesTrainingReminders: "Sales training reminders",
  marketingContentReady: "Marketing content ready for review",
};

export function NotificationSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);

  useEffect(() => {
    async function fetchPrefs() {
      try {
        const response = await fetch("/api/settings/notifications");
        if (response.ok) {
          const data = await response.json();
          setPrefs(data);
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
      } finally {
        setIsFetching(false);
      }
    }
    fetchPrefs();
  }, []);

  const handleEmailToggle = (key: string, checked: boolean) => {
    setPrefs((prev) => ({
      ...prev,
      email: { ...prev.email, [key]: checked },
    }));
    setSuccess(false);
  };

  const handleInAppToggle = (key: string, checked: boolean) => {
    setPrefs((prev) => ({
      ...prev,
      inApp: { ...prev.inApp, [key]: checked },
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });

      if (response.ok) {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error saving notification preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose which events trigger email notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(emailLabels).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`email-${key}`} className="cursor-pointer">
                {label}
              </Label>
              <Switch
                id={`email-${key}`}
                checked={prefs.email[key as keyof typeof prefs.email]}
                onCheckedChange={(checked) => handleEmailToggle(key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>
                Choose which events show in-app notifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(inAppLabels).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`inapp-${key}`} className="cursor-pointer">
                {label}
              </Label>
              <Switch
                id={`inapp-${key}`}
                checked={prefs.inApp[key as keyof typeof prefs.inApp]}
                onCheckedChange={(checked) => handleInAppToggle(key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
        {success && (
          <span className="text-sm text-green-600">
            Preferences saved successfully!
          </span>
        )}
      </div>
    </form>
  );
}
