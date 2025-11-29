"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Loader2, Link2, Unlink } from "lucide-react";

interface Integration {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  lastSyncAt: Date | null;
  syncStatus: string;
}

interface CRMConnectionsProps {
  integrations: Integration[];
  organizationId: string;
}

const crmProviders = [
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Marketing, sales, and service platform",
    logo: "/hubspot-logo.svg",
    color: "bg-orange-500",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Enterprise CRM platform",
    logo: "/salesforce-logo.svg",
    color: "bg-blue-500",
  },
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    description: "All-in-one marketing platform",
    logo: "/ghl-logo.svg",
    color: "bg-green-500",
  },
];

export function CRMConnections({
  integrations,
  organizationId,
}: CRMConnectionsProps) {
  const router = useRouter();
  const [connectingProvider, setConnectingProvider] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const connectedProviders = integrations.reduce(
    (acc, i) => {
      acc[i.provider] = i;
      return acc;
    },
    {} as Record<string, Integration>
  );

  async function handleConnect(provider: string) {
    if (!apiKey.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/crm/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          provider,
          apiKey,
        }),
      });

      if (response.ok) {
        setConnectingProvider(null);
        setApiKey("");
        router.refresh();
      }
    } catch (error) {
      console.error("Error connecting CRM:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDisconnect(integrationId: string) {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/crm/${integrationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error disconnecting CRM:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {crmProviders.map((provider) => {
          const connected = connectedProviders[provider.id];

          return (
            <div
              key={provider.id}
              className={`rounded-lg border p-6 ${
                connected?.isActive ? "border-green-200 bg-green-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${provider.color} text-xl font-bold text-white`}
                  >
                    {provider.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {provider.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {connected?.isActive ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">
                        Connected
                      </span>
                    </div>
                    <Badge
                      variant={
                        connected.syncStatus === "success"
                          ? "success"
                          : connected.syncStatus === "error"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {connected.syncStatus}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDisconnect(connected.id)}
                    >
                      <Unlink className="mr-2 h-4 w-4" />
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => setConnectingProvider(provider.id)}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Dialog */}
      <Dialog
        open={!!connectingProvider}
        onOpenChange={() => {
          setConnectingProvider(null);
          setApiKey("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Connect{" "}
              {crmProviders.find((p) => p.id === connectingProvider)?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your API key to connect your CRM
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
              />
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <p className="font-medium">Where to find your API key:</p>
              <p className="mt-1">
                Go to Settings → Integrations → API Keys in your CRM dashboard
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setConnectingProvider(null);
                  setApiKey("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() =>
                  connectingProvider && handleConnect(connectingProvider)
                }
                disabled={!apiKey.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
