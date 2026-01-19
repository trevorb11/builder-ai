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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Link2,
  Unlink,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Clock,
  Play,
} from "lucide-react";

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
    helpUrl: "https://knowledge.hubspot.com/integrations/how-do-i-get-my-hubspot-api-key",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Enterprise CRM platform",
    logo: "/salesforce-logo.svg",
    color: "bg-blue-500",
    helpUrl: "https://help.salesforce.com/s/articleView?id=sf.connected_app_create_api_integration.htm",
  },
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    description: "All-in-one marketing platform",
    logo: "/ghl-logo.svg",
    color: "bg-green-500",
    helpUrl: "https://help.gohighlevel.com/support/solutions/articles/48001222395",
  },
];

export function CRMConnections({
  integrations,
  organizationId,
}: CRMConnectionsProps) {
  const router = useRouter();
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const connectedProviders = integrations.reduce(
    (acc, i) => {
      acc[i.provider] = i;
      return acc;
    },
    {} as Record<string, Integration>
  );

  async function handleConnect(provider: string) {
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }

    setIsLoading(true);
    setError(null);

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

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to connect");
        return;
      }

      // Test the connection
      setIsTesting(true);
      const testResponse = await fetch(`/api/crm/${data.id}/test`, {
        method: "POST",
      });

      const testData = await testResponse.json();

      if (testData.success) {
        setTestResult({ success: true, message: "Connection verified successfully!" });
        setTimeout(() => {
          setConnectingProvider(null);
          setApiKey("");
          setTestResult(null);
          router.refresh();
        }, 1500);
      } else {
        setTestResult({ success: false, message: testData.error || "Connection test failed" });
      }
    } catch (err) {
      setError("An error occurred while connecting");
      console.error("Error connecting CRM:", err);
    } finally {
      setIsLoading(false);
      setIsTesting(false);
    }
  }

  async function handleTestConnection(integrationId: string) {
    setIsTesting(true);
    setError(null);

    try {
      const response = await fetch(`/api/crm/${integrationId}/test`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setTestResult({ success: true, message: "Connection is working!" });
      } else {
        setTestResult({ success: false, message: data.error || "Connection test failed" });
      }

      setTimeout(() => setTestResult(null), 3000);
      router.refresh();
    } catch (err) {
      setError("Failed to test connection");
      console.error("Error testing connection:", err);
    } finally {
      setIsTesting(false);
    }
  }

  async function handleSync(integrationId: string, retryFailed = false) {
    setIsSyncing(integrationId);
    setError(null);

    try {
      const response = await fetch(`/api/crm/${integrationId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retryFailed }),
      });

      const data = await response.json();

      if (data.success || data.synced > 0) {
        setTestResult({
          success: true,
          message: `Synced ${data.synced} leads${data.failed > 0 ? `, ${data.failed} failed` : ""}`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || data.message || "Sync failed",
        });
      }

      setTimeout(() => setTestResult(null), 3000);
      router.refresh();
    } catch (err) {
      setError("Failed to sync");
      console.error("Error syncing:", err);
    } finally {
      setIsSyncing(null);
    }
  }

  async function handleDisconnect(integrationId: string) {
    if (!confirm("Are you sure you want to disconnect this CRM? Sync history will be preserved.")) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/crm/${integrationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Error disconnecting CRM:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function formatLastSync(date: Date | null) {
    if (!date) return "Never";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  }

  function getSyncStatusBadge(status: string) {
    switch (status) {
      case "success":
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Synced</Badge>;
      case "error":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Error</Badge>;
      case "syncing":
        return <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Syncing</Badge>;
      case "partial":
        return <Badge variant="outline" className="gap-1 border-yellow-300 text-yellow-700"><AlertTriangle className="h-3 w-3" /> Partial</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    }
  }

  const currentProvider = crmProviders.find((p) => p.id === connectingProvider);

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          {testResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{testResult.message}</AlertDescription>
        </Alert>
      )}

      {/* Provider Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {crmProviders.map((provider) => {
          const connected = connectedProviders[provider.id];

          return (
            <div
              key={provider.id}
              className={`rounded-lg border p-4 sm:p-6 transition-colors ${
                connected?.isActive
                  ? "border-green-200 bg-green-50"
                  : "hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg ${provider.color} text-lg sm:text-xl font-bold text-white flex-shrink-0`}
                  >
                    {provider.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-gray-900">{provider.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
                      {provider.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {connected?.isActive ? (
                  <div className="space-y-3">
                    {/* Status Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-700">Connected</span>
                      </div>
                      {getSyncStatusBadge(connected.syncStatus)}
                    </div>

                    {/* Last Sync */}
                    <p className="text-xs text-gray-500">
                      Last sync: {formatLastSync(connected.lastSyncAt)}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => handleSync(connected.id)}
                          disabled={isSyncing === connected.id}
                        >
                          {isSyncing === connected.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                          <span className="hidden sm:inline">Sync Now</span>
                          <span className="sm:hidden">Sync</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => handleTestConnection(connected.id)}
                          disabled={isTesting}
                        >
                          {isTesting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Wifi className="h-3.5 w-3.5" />
                          )}
                          Test
                        </Button>
                      </div>

                      {/* Retry Failed */}
                      {connected.syncStatus === "error" || connected.syncStatus === "partial" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5 border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                          onClick={() => handleSync(connected.id, true)}
                          disabled={isSyncing === connected.id}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Retry Failed
                        </Button>
                      ) : null}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDisconnect(connected.id)}
                      >
                        <Unlink className="mr-2 h-3.5 w-3.5" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-500">
                      <WifiOff className="h-4 w-4" />
                      <span className="text-sm">Not connected</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => setConnectingProvider(provider.id)}
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      Connect
                    </Button>
                  </div>
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
          setError(null);
          setTestResult(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentProvider && (
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${currentProvider.color} text-sm font-bold text-white`}
                >
                  {currentProvider.name.charAt(0)}
                </div>
              )}
              Connect {currentProvider?.name}
            </DialogTitle>
            <DialogDescription>
              Enter your API key to sync leads and conversations with your CRM.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                autoComplete="off"
              />
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <p className="font-medium">Where to find your API key:</p>
              <p className="mt-1">
                Go to Settings → Integrations → API Keys in your{" "}
                {currentProvider?.name} dashboard.
              </p>
              {currentProvider?.helpUrl && (
                <a
                  href={currentProvider.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 underline hover:text-blue-800"
                >
                  View documentation →
                </a>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConnectingProvider(null);
                setApiKey("");
                setError(null);
                setTestResult(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => connectingProvider && handleConnect(connectingProvider)}
              disabled={!apiKey.trim() || isLoading || isTesting}
            >
              {isLoading || isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isTesting ? "Verifying..." : "Connecting..."}
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  Connect & Verify
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
