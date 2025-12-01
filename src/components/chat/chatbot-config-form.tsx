"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ChatbotConfig } from "@/generated/prisma/client";

interface ChatbotConfigFormProps {
  config: ChatbotConfig | null;
  organizationId: string;
}

export function ChatbotConfigForm({ config, organizationId }: ChatbotConfigFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: config?.name || "Website Assistant",
    welcomeMessage: config?.welcomeMessage || "Hi! I'm here to help you find your perfect new home. How can I assist you today?",
    primaryColor: config?.primaryColor || "#2563eb",
    accentColor: config?.accentColor || "#3b82f6",
    position: config?.position || "bottom-right",
    collectEmail: config?.collectEmail ?? true,
    collectPhone: config?.collectPhone ?? true,
    collectName: config?.collectName ?? true,
    autoOpen: config?.autoOpen ?? false,
    autoOpenDelay: config?.autoOpenDelay || 30,
    isActive: config?.isActive ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot/config", {
        method: config ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          organizationId,
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving config:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Assistant Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Website Assistant"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Widget Position</Label>
          <Select
            value={formData.position}
            onValueChange={(value) => setFormData({ ...formData, position: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom-right">Bottom Right</SelectItem>
              <SelectItem value="bottom-left">Bottom Left</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="welcomeMessage">Welcome Message</Label>
        <Textarea
          id="welcomeMessage"
          value={formData.welcomeMessage}
          onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
          placeholder="Enter the welcome message..."
          rows={3}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="primaryColor">Primary Color</Label>
          <div className="flex gap-2">
            <Input
              id="primaryColor"
              type="color"
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              className="h-10 w-14 p-1"
            />
            <Input
              value={formData.primaryColor}
              onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
              placeholder="#2563eb"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accentColor">Accent Color</Label>
          <div className="flex gap-2">
            <Input
              id="accentColor"
              type="color"
              value={formData.accentColor}
              onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
              className="h-10 w-14 p-1"
            />
            <Input
              value={formData.accentColor}
              onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
              placeholder="#3b82f6"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Lead Collection</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="collectName">Collect Name</Label>
              <p className="text-sm text-gray-500">Ask for visitor's name</p>
            </div>
            <Switch
              id="collectName"
              checked={formData.collectName}
              onCheckedChange={(checked) => setFormData({ ...formData, collectName: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="collectEmail">Collect Email</Label>
              <p className="text-sm text-gray-500">Ask for email address</p>
            </div>
            <Switch
              id="collectEmail"
              checked={formData.collectEmail}
              onCheckedChange={(checked) => setFormData({ ...formData, collectEmail: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="collectPhone">Collect Phone</Label>
              <p className="text-sm text-gray-500">Ask for phone number</p>
            </div>
            <Switch
              id="collectPhone"
              checked={formData.collectPhone}
              onCheckedChange={(checked) => setFormData({ ...formData, collectPhone: checked })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Behavior</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="autoOpen">Auto-Open Widget</Label>
              <p className="text-sm text-gray-500">
                Automatically open chat after delay
              </p>
            </div>
            <Switch
              id="autoOpen"
              checked={formData.autoOpen}
              onCheckedChange={(checked) => setFormData({ ...formData, autoOpen: checked })}
            />
          </div>
          {formData.autoOpen && (
            <div className="space-y-2">
              <Label htmlFor="autoOpenDelay">Delay (seconds)</Label>
              <Input
                id="autoOpenDelay"
                type="number"
                min={5}
                max={120}
                value={formData.autoOpenDelay}
                onChange={(e) =>
                  setFormData({ ...formData, autoOpenDelay: parseInt(e.target.value) || 30 })
                }
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
        <div>
          <Label htmlFor="isActive">Chatbot Active</Label>
          <p className="text-sm text-gray-600">
            Enable or disable the chatbot on your website
          </p>
        </div>
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </form>
  );
}
