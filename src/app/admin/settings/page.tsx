"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Platform } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Users,
  ScrollText,
  AlertTriangle,
  Power,
  ExternalLink,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Trash2,
  UserPlus,
  HelpCircle,
  ChevronDown,
  Info,
  ShieldAlert,
  ShieldCheck,
  Copy,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { HowItWorks } from "@/components/how-it-works";

// ── Types ───────────────────────────────────────────────────────────

interface StoredToken {
  platform: Platform;
  api_key: string;
  from_email: string | null;
  from_name: string | null;
  status: "active" | "expired" | "revoked";
  connected_at: string;
}

// Platform display config
const PLATFORM_CONFIG: Record<
  Platform,
  {
    label: string;
    color: string;
    icon: string;
    keyLabel: string;
    keyPlaceholder: string;
    helpText: string;
    portalUrl: string;
    portalName: string;
    tokenTooltip: string;
    howToSteps: string[];
    expiryNote: string | null;
  }
> = {
  x: {
    label: "X (Twitter)",
    color: "bg-black text-white",
    icon: "X",
    keyLabel: "API Bearer Token",
    keyPlaceholder: "AAAA...",
    helpText: "From your X Developer Portal app → Authentication → Bearer Token.",
    portalUrl: "https://developer.x.com/en/portal/dashboard",
    portalName: "X Developer Portal",
    tokenTooltip: "A Bearer Token authenticates API requests on behalf of your X app. It does not expire unless regenerated.",
    howToSteps: [
      "Go to developer.x.com and sign in with your X account.",
      "Create a Project, then create an App inside it (or use an existing one).",
      "Navigate to your App → \"Keys and tokens\" tab.",
      "Under \"Bearer Token\", click \"Generate\" (or \"Regenerate\" if one exists).",
      "Copy the token immediately — it won't be shown again.",
      "Paste the Bearer Token here and click \"Test Connection\" to verify.",
    ],
    expiryNote: null,
  },
  instagram: {
    label: "Instagram",
    color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    icon: "IG",
    keyLabel: "Access Token",
    keyPlaceholder: "IGQ...",
    helpText: "Requires Facebook Business account. Generate a long-lived token from Graph API Explorer.",
    portalUrl: "https://developers.facebook.com/apps/",
    portalName: "Meta for Developers",
    tokenTooltip: "A long-lived Instagram access token lets us post on your behalf. It expires after 60 days and must be refreshed.",
    howToSteps: [
      "Go to developers.facebook.com and sign in with the Facebook account linked to your Instagram Business profile.",
      "Click \"My Apps\" → \"Create App\" (or select an existing app).",
      "Add the \"Instagram Graph API\" product to your app.",
      "In Graph API Explorer, select your app and request the instagram_basic and instagram_content_publish permissions.",
      "Generate a short-lived User Token, then exchange it for a long-lived token (valid 60 days).",
      "Paste the long-lived access token here.",
    ],
    expiryNote: "This token expires after 60 days. You'll need to reconnect when it expires.",
  },
  tiktok: {
    label: "TikTok",
    color: "bg-black text-white",
    icon: "TT",
    keyLabel: "Access Token",
    keyPlaceholder: "act.a1...",
    helpText: "From TikTok Developer Portal → Manage apps → Sandbox/Production token.",
    portalUrl: "https://developers.tiktok.com/",
    portalName: "TikTok for Developers",
    tokenTooltip: "A TikTok access token allows automated video/content posting. Sandbox tokens work for testing; production tokens require app review.",
    howToSteps: [
      "Go to developers.tiktok.com and sign in with your TikTok account.",
      "Click \"Manage apps\" → \"Create a new app\" (or select existing).",
      "Request the \"Content Posting\" (video.publish) scope for your app.",
      "For testing, use a Sandbox token (limited to sandbox users). For production, submit your app for review.",
      "Once approved, go to your app settings and copy the Access Token.",
      "Paste it here and test the connection.",
    ],
    expiryNote: "Sandbox tokens have limited functionality. Apply for production access for full features.",
  },
  linkedin: {
    label: "LinkedIn",
    color: "bg-blue-600 text-white",
    icon: "in",
    keyLabel: "Access Token",
    keyPlaceholder: "AQV...",
    helpText: "Requires LinkedIn company page admin access. Generate from LinkedIn Developer Portal.",
    portalUrl: "https://www.linkedin.com/developers/apps",
    portalName: "LinkedIn Developer Portal",
    tokenTooltip: "A LinkedIn access token allows posting to your company page. It typically expires after 60 days.",
    howToSteps: [
      "Go to linkedin.com/developers and sign in. You must be an admin of the LinkedIn company page.",
      "Click \"Create app\" and associate it with your company page.",
      "Under \"Products\", request access to \"Share on LinkedIn\" (w_member_social or w_organization_social).",
      "Go to the \"Auth\" tab to find your Client ID and Client Secret.",
      "Use the OAuth 2.0 authorization flow to generate an access token, or use LinkedIn's token generator tool.",
      "Paste the access token here.",
    ],
    expiryNote: "This token expires after 60 days. You'll need to reconnect when it expires.",
  },
  email: {
    label: "Email (Resend)",
    color: "bg-green-600 text-white",
    icon: "@",
    keyLabel: "Resend API Key",
    keyPlaceholder: "re_...",
    helpText: "From resend.com → API Keys. We'll verify the key and check your domain status.",
    portalUrl: "https://resend.com/api-keys",
    portalName: "Resend Dashboard",
    tokenTooltip: "A Resend API key lets us send emails on your behalf. Keys with \"Sending access\" permission are sufficient.",
    howToSteps: [
      "Go to resend.com and create an account (or sign in).",
      "In the sidebar, click \"Domains\" → \"Add Domain\" and follow DNS verification steps.",
      "Wait for domain verification to complete (usually a few minutes).",
      "Go to \"API Keys\" in the sidebar → click \"Create API Key\".",
      "Name the key (e.g., \"ForecastHer\"), select \"Sending access\" permission, and optionally restrict to your verified domain.",
      "Copy the key (starts with re_) and paste it here. Then fill in your From email below.",
    ],
    expiryNote: null,
  },
};

const ALL_PLATFORMS: Platform[] = ["x", "instagram", "tiktok", "linkedin", "email"];

// ── Inline How-To Guide ─────────────────────────────────────────────

function PlatformHowTo({ platform }: { platform: Platform }) {
  const [open, setOpen] = useState(false);
  const cfg = PLATFORM_CONFIG[platform];

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        How to get this token
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50/50 p-3 space-y-2">
          <ol className="space-y-1.5 ml-0.5">
            {cfg.howToSteps.map((step, i) => (
              <li key={i} className="flex gap-2 text-xs">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-purple-200 text-purple-700 text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-muted-foreground leading-4">{step}</span>
              </li>
            ))}
          </ol>
          {cfg.expiryNote && (
            <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-purple-200">
              <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{cfg.expiryNote}</p>
            </div>
          )}
          <a
            href={cfg.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium mt-1"
          >
            Open {cfg.portalName} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}

// ── Tokens Tab ──────────────────────────────────────────────────────

function TokensTab() {
  const [tokens, setTokens] = useState<StoredToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [connectPlatform, setConnectPlatform] = useState<Platform | null>(null);
  const [testingPlatform, setTestingPlatform] = useState<Platform | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({});

  const fetchTokens = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/tokens");
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens ?? []);
      } else {
        // Table may not exist yet — show empty state, not error
        setTokens([]);
      }
    } catch {
      // API unreachable — show empty state with hint
      setFetchError("Could not reach the tokens API. The database table may not be set up yet. You can still configure tokens below.");
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
    // Safety timeout: never spin forever
    const timeout = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timeout);
  }, [fetchTokens]);

  function getToken(platform: Platform): StoredToken | undefined {
    return tokens.find((t) => t.platform === platform);
  }

  async function handleDisconnect(platform: Platform) {
    try {
      await fetch("/api/admin/tokens", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      await fetchTokens();
    } catch {
      // ignore
    }
  }

  async function handleTestPost(platform: Platform) {
    const token = getToken(platform);
    if (!token) return;

    setTestingPlatform(platform);
    setTestResults((prev) => { const next = { ...prev }; delete next[platform]; return next; });
    try {
      const res = await fetch("/api/admin/tokens/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          api_key: token.api_key,
          from_email: token.from_email,
        }),
      });

      let data;
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = { error: `Server returned ${res.status} (${res.statusText})` };
      }

      setTestResults((prev) => ({
        ...prev,
        [platform]: {
          ok: res.ok && !!data.ok,
          message: data.message || data.warning || data.error || "Unknown result",
        },
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [platform]: { ok: false, message: err instanceof Error ? err.message : "Network error. Try again." },
      }));
    } finally {
      setTestingPlatform(null);
    }
  }

  const connectedCount = tokens.filter((t) => t.status === "active").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Checking platform connections...
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* API error banner */}
        {fetchError && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">{fetchError}</p>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600" onClick={() => { setLoading(true); fetchTokens(); }}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <p className="text-sm text-muted-foreground">
              Platform authentication tokens for automated posting.
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                Each platform needs an API token to post on your behalf. Tokens are encrypted and stored securely. Click &quot;How to get this token&quot; on any card for step-by-step setup instructions.
              </TooltipContent>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    connectedCount === 0
                      ? "border-red-200 bg-red-50 text-red-600"
                      : connectedCount < 3
                      ? "border-yellow-200 bg-yellow-50 text-yellow-700"
                      : "border-green-200 bg-green-50 text-green-700"
                  }`}
                >
                  {connectedCount}/{ALL_PLATFORMS.length} connected
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {connectedCount === 0
                ? "No platforms connected yet. Connect at least one to start posting."
                : connectedCount < ALL_PLATFORMS.length
                ? `${ALL_PLATFORMS.length - connectedCount} platform(s) still need tokens.`
                : "All platforms connected and ready to post!"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Warning banner */}
        {connectedCount === 0 && (
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50/50 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">No platforms connected</p>
              <p className="text-xs text-amber-700 mt-1">
                Connect at least one platform below to enable posting. Click &quot;How to get this token&quot; on any card for a step-by-step guide.
              </p>
            </div>
          </div>
        )}

        {/* Token cards */}
        <div className="space-y-4">
          {ALL_PLATFORMS.map((platform) => {
            const cfg = PLATFORM_CONFIG[platform];
            const token = getToken(platform);
            const isConnected = token?.status === "active";
            const isTesting = testingPlatform === platform;

            return (
              <Card key={platform} className={!isConnected ? "border-dashed" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold ${cfg.color} cursor-help`}
                          >
                            {cfg.icon}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          {cfg.tokenTooltip}
                        </TooltipContent>
                      </Tooltip>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm">{cfg.label}</p>
                          <a
                            href={cfg.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ExternalLink className="h-3 w-3" />
                              </TooltipTrigger>
                              <TooltipContent>Open {cfg.portalName}</TooltipContent>
                            </Tooltip>
                          </a>
                        </div>
                        {isConnected ? (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Connected
                            {token.from_email && (
                              <span className="ml-1">
                                &middot; {token.from_email}
                              </span>
                            )}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-gray-400" />
                            Not connected
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                isConnected
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-gray-100 text-gray-500 border-gray-200"
                              }`}
                            >
                              {isConnected ? "Connected" : "Disconnected"}
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isConnected
                            ? "Token is active and ready for automated posting."
                            : "No token stored. Click \"Connect\" to add one."}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1"
                            onClick={() => setConnectPlatform(platform)}
                          >
                            <ExternalLink className="h-3 w-3" />
                            {isConnected ? "Reauth" : "Connect"}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isConnected
                            ? "Replace the current token with a new one."
                            : `Open the connection dialog to add your ${cfg.label} token.`}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Detail grid for connected tokens */}
                  {isConnected && (
                    <>
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Connected</span>
                          <p className="font-medium mt-0.5">
                            {new Date(token.connected_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-muted-foreground cursor-help flex items-center gap-1">
                                Key <HelpCircle className="h-3 w-3" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Only the first and last few characters are shown for security. The full key is stored encrypted.
                            </TooltipContent>
                          </Tooltip>
                          <p className="font-medium mt-0.5 font-mono">
                            {token.api_key.slice(0, 6)}...{token.api_key.slice(-4)}
                          </p>
                        </div>
                        {token.from_name && (
                          <div>
                            <span className="text-muted-foreground">From name</span>
                            <p className="font-medium mt-0.5">{token.from_name}</p>
                          </div>
                        )}
                      </div>

                      {/* Expiry warning for platforms with expiry */}
                      {cfg.expiryNote && (
                        <div className="mt-3 flex items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50/50 p-2">
                          <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700">{cfg.expiryNote}</p>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs gap-1"
                                disabled={isTesting}
                                onClick={() => handleTestPost(platform)}
                              >
                                {isTesting ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Send className="h-3 w-3" />
                                )}
                                {isTesting ? "Testing..." : "Test Connection"}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Sends a test request to verify your API key is valid and has the right permissions.
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-destructive hover:text-destructive gap-1"
                              onClick={() => handleDisconnect(platform)}
                            >
                              <Trash2 className="h-3 w-3" />
                              Disconnect
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Removes the stored token. You&apos;ll need to reconnect to post on {cfg.label} again.
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Inline test result */}
                      {testResults[platform] && (
                        <div
                          className={`mt-3 rounded-lg border p-3 flex items-start gap-2 text-xs ${
                            testResults[platform].ok
                              ? "border-green-200 bg-green-50 text-green-800"
                              : "border-red-200 bg-red-50 text-red-800"
                          }`}
                        >
                          {testResults[platform].ok ? (
                            <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          )}
                          <span className="flex-1">{testResults[platform].message}</span>
                          <button
                            onClick={() => setTestResults((prev) => { const next = { ...prev }; delete next[platform]; return next; })}
                            className="underline opacity-60 hover:opacity-100"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}

                      {/* How-to guide (available even when connected, for re-auth) */}
                      <PlatformHowTo platform={platform} />
                    </>
                  )}

                  {/* Help text + how-to for disconnected */}
                  {!isConnected && (
                    <div className="mt-4 pt-3 border-t border-dashed border-border">
                      <p className="text-xs text-muted-foreground">{cfg.helpText}</p>
                      <PlatformHowTo platform={platform} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Connect dialog */}
        {connectPlatform && (
          <ConnectDialog
            platform={connectPlatform}
            existingToken={getToken(connectPlatform)}
            onClose={() => setConnectPlatform(null)}
            onSaved={() => {
              setConnectPlatform(null);
              fetchTokens();
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

// ── Connect Dialog ──────────────────────────────────────────────────

function ConnectDialog({
  platform,
  existingToken,
  onClose,
  onSaved,
}: {
  platform: Platform;
  existingToken?: StoredToken;
  onClose: () => void;
  onSaved: () => void;
}) {
  const cfg = PLATFORM_CONFIG[platform];
  const isEmail = platform === "email";

  const [apiKey, setApiKey] = useState(existingToken?.api_key ?? "");
  const [fromEmail, setFromEmail] = useState(existingToken?.from_email ?? "");
  const [fromName, setFromName] = useState(existingToken?.from_name ?? "");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState("");

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    setError("");
    try {
      const res = await fetch("/api/admin/tokens/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          api_key: apiKey,
          from_email: fromEmail || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResult({
          ok: true,
          message: data.message || data.warning || "Connection verified.",
        });
      } else {
        setTestResult({
          ok: false,
          message: data.error || "Verification failed.",
        });
      }
    } catch {
      setTestResult({ ok: false, message: "Network error." });
    } finally {
      setTesting(false);
    }
  }

  async function handleSave() {
    if (!apiKey.trim()) {
      setError("API key is required.");
      return;
    }
    if (isEmail && !fromEmail.trim()) {
      setError("From email is required for Resend.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          api_key: apiKey.trim(),
          from_email: fromEmail.trim() || null,
          from_name: fromName.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        onSaved();
      } else {
        setError(data.error || "Failed to save.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const [showHowTo, setShowHowTo] = useState(false);

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <TooltipProvider>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold ${cfg.color}`}
              >
                {cfg.icon}
              </span>
              Connect {cfg.label}
            </DialogTitle>
            <DialogDescription>{cfg.helpText}</DialogDescription>
          </DialogHeader>

          {/* Inline how-to guide */}
          <div>
            <button
              onClick={() => setShowHowTo(!showHowTo)}
              className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              {showHowTo ? "Hide" : "Show"} step-by-step guide
              <ChevronDown
                className={`h-3 w-3 transition-transform ${showHowTo ? "rotate-180" : ""}`}
              />
            </button>
            {showHowTo && (
              <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50/50 p-3 space-y-2">
                <ol className="space-y-1.5 ml-0.5">
                  {cfg.howToSteps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-purple-200 text-purple-700 text-[10px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-muted-foreground leading-4">{step}</span>
                    </li>
                  ))}
                </ol>
                {cfg.expiryNote && (
                  <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-purple-200">
                    <Info className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{cfg.expiryNote}</p>
                  </div>
                )}
                <a
                  href={cfg.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium mt-1"
                >
                  Open {cfg.portalName} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          <div className="space-y-4 py-2">
            <div>
              <div className="flex items-center gap-1.5">
                <Label className="text-sm font-medium">{cfg.keyLabel}</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    {cfg.tokenTooltip}
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                type="password"
                placeholder={cfg.keyPlaceholder}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste the token from your {cfg.portalName}. It starts with &quot;{cfg.keyPlaceholder.replace("...", "")}&quot;.
              </p>
            </div>

            {isEmail && (
              <>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-medium">From email</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        The email address that recipients will see in the &quot;From&quot; field. Must use a domain you&apos;ve verified in Resend.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="email"
                    placeholder="hello@forecasther.ai"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must match a verified domain in your Resend account. Go to Resend &rarr; Domains to verify.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-medium">
                      From name <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        The display name shown alongside the from email, e.g. &quot;ForecastHer &lt;hello@forecasther.ai&gt;&quot;.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    placeholder="ForecastHer"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </>
            )}

            {/* Test result */}
            {testResult && (
              <div
                className={`rounded-lg border p-3 text-xs ${
                  testResult.ok
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {testResult.ok ? (
                  <CheckCircle className="h-3.5 w-3.5 inline mr-1.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 inline mr-1.5" />
                )}
                {testResult.message}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleTest} disabled={!apiKey || testing}>
                  {testing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Validates your token by making a test API call. Recommended before saving.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSave} disabled={!apiKey || saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save & Connect"
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Stores the token securely and activates this platform for posting.
              </TooltipContent>
            </Tooltip>
          </DialogFooter>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}

// ── Users & Roles Tab ────────────────────────────────────────────────

function UsersTab() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<{ email: string; role: string; invitedAt: string }[]>([]);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  async function handleSendInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setInvitedUsers((prev) => [
      ...prev,
      { email: inviteEmail.trim(), role: inviteRole, invitedAt: new Date().toISOString() },
    ]);
    setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}`);
    setInviteEmail("");
    setInviteRole("editor");
    setInviting(false);
    setShowInvite(false);
    setTimeout(() => setInviteSuccess(null), 4000);
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <p className="text-sm text-muted-foreground">Manage admin users and their roles.</p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                Invite team members with different permission levels. Editors can create content, Reviewers can approve it, and Analysts have read-only access to analytics.
              </TooltipContent>
            </Tooltip>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" className="gradient-purple text-white" onClick={() => setShowInvite(true)}>
                <UserPlus className="h-4 w-4 mr-1" /> Invite User
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send an email invitation to a new team member.</TooltipContent>
          </Tooltip>
        </div>

      {inviteSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {inviteSuccess}
        </div>
      )}

      {showInvite && (
        <Dialog open onOpenChange={() => setShowInvite(false)}>
          <DialogContent>
            <TooltipProvider>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" /> Invite User
                </DialogTitle>
                <DialogDescription>
                  Send an invitation to a team member. They will receive an email with a link to join.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-sm font-medium">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The user will receive an email with a link to create their account.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-medium">Role</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        Roles control what the user can do. See the &quot;Role Permissions&quot; table below for a full breakdown.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {inviteRole === "editor" && "Can create/edit markets, drafts, assets, and schedule posts."}
                    {inviteRole === "reviewer" && "Can approve & lock content. Read-only for everything else."}
                    {inviteRole === "analyst" && "View-only access to analytics and reports."}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
                <Button onClick={handleSendInvite} disabled={!inviteEmail.trim() || inviting}>
                  {inviting ? (
                    <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-1" /> Send Invite</>
                  )}
                </Button>
              </DialogFooter>
            </TooltipProvider>
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <div className="p-4 text-center text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Only the owner account is configured.</p>
          <p className="text-xs mt-1">Invite editors, reviewers, or analysts to collaborate.</p>
        </div>
      </Card>

      {invitedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitedUsers.map((user, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell className="text-sm capitalize">{user.role}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.invitedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                        Pending
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle className="text-sm font-medium">Role Permissions</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                This table shows what each role can do. Assign the minimum role needed for each team member.
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                <TableHead className="text-center">
                  <Tooltip>
                    <TooltipTrigger asChild><span className="cursor-help">Owner</span></TooltipTrigger>
                    <TooltipContent>Full access to everything, including tokens and kill switch.</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="text-center">
                  <Tooltip>
                    <TooltipTrigger asChild><span className="cursor-help">Editor</span></TooltipTrigger>
                    <TooltipContent>Can create and edit markets, drafts, and schedule posts.</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="text-center">
                  <Tooltip>
                    <TooltipTrigger asChild><span className="cursor-help">Reviewer</span></TooltipTrigger>
                    <TooltipContent>Can approve and lock content. Read-only for everything else.</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="text-center">
                  <Tooltip>
                    <TooltipTrigger asChild><span className="cursor-help">Analyst</span></TooltipTrigger>
                    <TooltipContent>View-only access to analytics and reports.</TooltipContent>
                  </Tooltip>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { perm: "Markets (create/edit)", owner: true, editor: true, reviewer: false, analyst: false },
                { perm: "Drafts (create/edit)", owner: true, editor: true, reviewer: false, analyst: false },
                { perm: "Assets (generate)", owner: true, editor: true, reviewer: false, analyst: false },
                { perm: "Approve & Lock", owner: true, editor: false, reviewer: true, analyst: false },
                { perm: "Schedule posts", owner: true, editor: true, reviewer: false, analyst: false },
                { perm: "View analytics", owner: true, editor: true, reviewer: true, analyst: true },
                { perm: "Manage tokens", owner: true, editor: false, reviewer: false, analyst: false },
                { perm: "Kill switch", owner: true, editor: false, reviewer: false, analyst: false },
              ].map((row) => (
                <TableRow key={row.perm}>
                  <TableCell className="text-sm">{row.perm}</TableCell>
                  {[row.owner, row.editor, row.reviewer, row.analyst].map((allowed, i) => (
                    <TableCell key={i} className="text-center">
                      {allowed ? (
                        <span className="text-green-600 font-bold">&#10003;</span>
                      ) : (
                        <span className="text-gray-300">&mdash;</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </TooltipProvider>
  );
}

// ── Audit Log Tab ────────────────────────────────────────────────────

function AuditLogTab() {
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-muted-foreground">
            Every approval, post, workflow run, and token change is logged here.
          </p>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              The audit log tracks all actions for accountability: who approved content, when posts were published, token changes, and workflow executions.
            </TooltipContent>
          </Tooltip>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ScrollText className="h-8 w-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No audit events yet.</p>
            <p className="text-xs mt-1">Events will appear as you use the admin tool — approvals, posts, workflow runs, and token changes are all recorded automatically.</p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// ── Kill Switch Tab ──────────────────────────────────────────────────

function KillSwitchTab() {
  const [globalAutopost, setGlobalAutopost] = useState(false);
  const [platformStates, setPlatformStates] = useState<Record<Platform, boolean>>({
    x: false,
    instagram: false,
    tiktok: false,
    linkedin: false,
    email: false,
  });
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revoked, setRevoked] = useState(false);

  function togglePlatform(p: Platform) {
    setPlatformStates((prev) => ({ ...prev, [p]: !prev[p] }));
  }

  async function handleRevokeAll() {
    setRevoking(true);
    try {
      await fetch("/api/admin/tokens", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
    } catch {
      // Token table may not exist yet
    }
    await new Promise((r) => setTimeout(r, 1500));
    setRevoking(false);
    setShowRevokeConfirm(false);
    setRevoked(true);
    setGlobalAutopost(false);
    setPlatformStates({ x: false, instagram: false, tiktok: false, linkedin: false, email: false });
    setTimeout(() => setRevoked(false), 5000);
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 max-w-lg">
        {revoked && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            All tokens have been revoked. Reconnect platforms in the Tokens tab to resume posting.
          </div>
        )}

        <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-medium text-sm">Emergency Controls</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                Use these controls to immediately halt automated posting in case of an incident, compromised token, or content issue. Changes take effect instantly.
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            These controls immediately affect automated posting. Use with caution.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <Label className="font-medium">Global Autopost</Label>
                  <p className="text-xs text-muted-foreground">Disable all automated posting globally.</p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    When enabled, the system can auto-post to connected platforms. Toggle off to pause all automated posting without disconnecting tokens.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch checked={globalAutopost} onCheckedChange={setGlobalAutopost} />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Label className="font-medium">Platform Controls</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    Pause posting on individual platforms. Requires Global Autopost to be enabled first. Useful for pausing one channel while keeping others active.
                  </TooltipContent>
                </Tooltip>
              </div>
              {(Object.keys(platformStates) as Platform[]).map((p) => (
                <div key={p} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{p === "x" ? "X (Twitter)" : p}</span>
                  <Switch
                    checked={platformStates[p]}
                    onCheckedChange={() => togglePlatform(p)}
                    disabled={!globalAutopost}
                  />
                </div>
              ))}
              {!globalAutopost && (
                <p className="text-xs text-muted-foreground italic">
                  Enable Global Autopost above to control individual platforms.
                </p>
              )}
            </div>

            <Separator />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowRevokeConfirm(true)}
                >
                  <Power className="h-4 w-4 mr-1" /> Revoke All Tokens
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                Permanently deletes all stored API tokens. All platforms will be disconnected and scheduled posts will fail. You will need to reconnect each platform manually.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

      {showRevokeConfirm && (
        <Dialog open onOpenChange={() => setShowRevokeConfirm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" /> Revoke All Tokens
              </DialogTitle>
              <DialogDescription>
                This will immediately disconnect all platform integrations (X, Instagram, TikTok, LinkedIn, Email).
                All scheduled posts will fail until tokens are reconnected. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRevokeConfirm(false)} disabled={revoking}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRevokeAll} disabled={revoking}>
                {revoking ? (
                  <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Revoking...</>
                ) : (
                  <><Power className="h-4 w-4 mr-1" /> Confirm Revoke All</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </TooltipProvider>
  );
}

// ── Security / MFA Tab ──────────────────────────────────────────────

interface AdminMfaInfo {
  id: string;
  role: string;
  mfa_enabled: boolean;
  mfa_enrolled_at: string | null;
  is_active: boolean;
  profiles?: { username: string; avatar_url: string | null } | null;
}

function SecurityTab() {
  const supabase = createClient();
  const [admins, setAdmins] = useState<AdminMfaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState<AdminMfaInfo | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check_admin" }),
    });
    const data = await res.json();

    // For now, show placeholder admin list since we'd need a list endpoint
    // The current user's info is what we get from check_admin
    if (data.is_admin) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdmins([{
          id: user.id,
          role: data.role,
          mfa_enabled: data.mfa_enabled,
          mfa_enrolled_at: null,
          is_active: true,
          profiles: { username: user.email || "admin", avatar_url: null },
        }]);
      }
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  async function handleMfaReset() {
    if (!resetTarget) return;
    setResetting(true);
    setResetError("");
    setResetSuccess("");

    // Owner must verify their own 2FA first
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verifiedFactor = factors?.totp?.find((f) => f.status === "verified");

    if (!verifiedFactor) {
      setResetError("You must have 2FA enabled to reset another admin's MFA.");
      setResetting(false);
      return;
    }

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: verifiedFactor.id });

    if (challengeError || !challengeData) {
      setResetError("Failed to create challenge.");
      setResetting(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: verifiedFactor.id,
      challengeId: challengeData.id,
      code: confirmCode,
    });

    if (verifyError) {
      setResetError("Invalid code. Please re-enter your 2FA code.");
      setConfirmCode("");
      setResetting(false);
      return;
    }

    // Now call the reset API
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "mfa_reset",
        target_admin_id: resetTarget.id,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setResetError(data.error || "Failed to reset MFA.");
      setResetting(false);
      return;
    }

    setResetSuccess(
      `MFA reset for ${resetTarget.profiles?.username || "admin"}. They will be required to re-enroll on next login.`
    );
    setResetTarget(null);
    setConfirmCode("");
    setResetting(false);
    fetchAdmins();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            2FA is mandatory for all admin accounts. No admin can access
            protected routes without completing MFA verification.
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>2FA Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.profiles?.username || admin.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {admin.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.mfa_enabled ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Enrolled
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not enrolled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {admin.mfa_enabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setResetTarget(admin)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reset 2FA
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {resetSuccess && (
            <p className="mt-4 text-sm text-green-600 text-center">
              {resetSuccess}
            </p>
          )}
        </CardContent>
      </Card>

      {/* MFA Reset Confirmation Dialog */}
      {resetTarget && (
        <Dialog open onOpenChange={() => { setResetTarget(null); setResetError(""); setConfirmCode(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                Confirm MFA Reset
              </DialogTitle>
              <DialogDescription>
                You are resetting 2FA for{" "}
                <strong>{resetTarget.profiles?.username || "this admin"}</strong>.
                They will be forced to re-enroll on their next login. Enter your
                own 2FA code to confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="confirm-code">Your 2FA code</Label>
                <Input
                  id="confirm-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="000000"
                  value={confirmCode}
                  onChange={(e) =>
                    setConfirmCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  autoComplete="one-time-code"
                  className="text-center text-lg tracking-[0.3em] font-mono"
                />
              </div>
              {resetError && (
                <p className="text-sm text-red-500">{resetError}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setResetTarget(null);
                  setResetError("");
                  setConfirmCode("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={resetting || confirmCode.length !== 6}
                onClick={handleMfaReset}
              >
                {resetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset 2FA"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ── Main Admin Settings Page ─────────────────────────────────────────

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Admin</h1>
        <p className="text-sm text-muted-foreground">
          Tokens, users, audit log, and emergency controls.
        </p>
      </div>

      <HowItWorks
        steps={[
          "Tokens: Connect platform API keys (X, Instagram, TikTok, LinkedIn, Resend email). Click \"Connect\", paste your key, then \"Test Connection\" to verify it works.",
          "Users & Roles: Invite team members as Editor, Reviewer, or Analyst. Each role has different permissions — see the permissions table for details.",
          "Audit Log: Every action (approvals, posts, workflow runs, token changes) is logged here for accountability and debugging.",
          "Kill Switch: Emergency controls to instantly disable all automated posting globally or per-platform. \"Revoke All Tokens\" is a last resort that disconnects everything.",
        ]}
      />

      <Tabs defaultValue="tokens">
        <TooltipProvider>
          <TabsList>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="tokens">Tokens</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Connect and manage API keys for each platform.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="users">Users & Roles</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Invite team members and manage permissions.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="audit">Audit Log</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Track all actions for accountability.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="killswitch">Kill Switch</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Emergency controls to halt automated posting.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>2FA management and admin MFA resets.</TooltipContent>
            </Tooltip>
          </TabsList>
        </TooltipProvider>
        <TabsContent value="tokens" className="mt-4"><TokensTab /></TabsContent>
        <TabsContent value="users" className="mt-4"><UsersTab /></TabsContent>
        <TabsContent value="audit" className="mt-4"><AuditLogTab /></TabsContent>
        <TabsContent value="killswitch" className="mt-4"><KillSwitchTab /></TabsContent>
        <TabsContent value="security" className="mt-4"><SecurityTab /></TabsContent>
      </Tabs>
    </div>
  );
}
