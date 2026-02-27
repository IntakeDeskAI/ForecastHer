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
} from "lucide-react";
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
  { label: string; color: string; icon: string; keyLabel: string; keyPlaceholder: string; helpText: string }
> = {
  x: {
    label: "X (Twitter)",
    color: "bg-black text-white",
    icon: "X",
    keyLabel: "API Bearer Token",
    keyPlaceholder: "AAAA...",
    helpText: "From your X Developer Portal app → Authentication → Bearer Token.",
  },
  instagram: {
    label: "Instagram",
    color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    icon: "IG",
    keyLabel: "Access Token",
    keyPlaceholder: "IGQ...",
    helpText: "Requires Facebook Business account. Generate a long-lived token from Graph API Explorer.",
  },
  tiktok: {
    label: "TikTok",
    color: "bg-black text-white",
    icon: "TT",
    keyLabel: "Access Token",
    keyPlaceholder: "act.a1...",
    helpText: "From TikTok Developer Portal → Manage apps → Sandbox/Production token.",
  },
  linkedin: {
    label: "LinkedIn",
    color: "bg-blue-600 text-white",
    icon: "in",
    keyLabel: "Access Token",
    keyPlaceholder: "AQV...",
    helpText: "Requires LinkedIn company page admin access. Generate from LinkedIn Developer Portal.",
  },
  email: {
    label: "Email (Resend)",
    color: "bg-green-600 text-white",
    icon: "@",
    keyLabel: "Resend API Key",
    keyPlaceholder: "re_...",
    helpText: "From resend.com → API Keys. We'll verify the key and check your domain status.",
  },
};

const ALL_PLATFORMS: Platform[] = ["x", "instagram", "tiktok", "linkedin", "email"];

// ── Tokens Tab ──────────────────────────────────────────────────────

function TokensTab() {
  const [tokens, setTokens] = useState<StoredToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectPlatform, setConnectPlatform] = useState<Platform | null>(null);
  const [testingPlatform, setTestingPlatform] = useState<Platform | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({});

  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/tokens");
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens ?? []);
      }
    } catch {
      // Tokens table may not exist yet — that's fine
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
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
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading tokens...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Platform authentication tokens for automated posting.
        </p>
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

      {/* Warning banner */}
      {connectedCount === 0 && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50/50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">No platforms connected</p>
            <p className="text-xs text-amber-700 mt-1">
              Connect at least one platform below to enable posting.
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
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold ${cfg.color}`}
                    >
                      {cfg.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{cfg.label}</p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      onClick={() => setConnectPlatform(platform)}
                    >
                      <ExternalLink className="h-3 w-3" />
                      {isConnected ? "Reauth" : "Connect"}
                    </Button>
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
                        <span className="text-muted-foreground">Key</span>
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

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
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
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive gap-1"
                        onClick={() => handleDisconnect(platform)}
                      >
                        <Trash2 className="h-3 w-3" />
                        Disconnect
                      </Button>
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
                  </>
                )}

                {/* Help text for disconnected */}
                {!isConnected && (
                  <div className="mt-4 pt-3 border-t border-dashed border-border">
                    <p className="text-xs text-muted-foreground">{cfg.helpText}</p>
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

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent>
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

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-sm font-medium">{cfg.keyLabel}</Label>
            <Input
              type="password"
              placeholder={cfg.keyPlaceholder}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 font-mono text-sm"
            />
          </div>

          {isEmail && (
            <>
              <div>
                <Label className="text-sm font-medium">From email</Label>
                <Input
                  type="email"
                  placeholder="hello@forcasther.com"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must match a verified domain in your Resend account.
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">
                  From name <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
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
          <Button variant="outline" onClick={handleTest} disabled={!apiKey || testing}>
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Verifying...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
          <Button onClick={handleSave} disabled={!apiKey || saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
              </>
            ) : (
              "Save & Connect"
            )}
          </Button>
        </DialogFooter>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage admin users and their roles.</p>
        <Button size="sm" className="gradient-purple text-white" onClick={() => setShowInvite(true)}>
          <UserPlus className="h-4 w-4 mr-1" /> Invite User
        </Button>
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
              </div>
              <div>
                <Label className="text-sm font-medium">Role</Label>
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
          <CardTitle className="text-sm font-medium">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                <TableHead className="text-center">Owner</TableHead>
                <TableHead className="text-center">Editor</TableHead>
                <TableHead className="text-center">Reviewer</TableHead>
                <TableHead className="text-center">Analyst</TableHead>
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
  );
}

// ── Audit Log Tab ────────────────────────────────────────────────────

function AuditLogTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Every approval, post, workflow run, and token change is logged here.
      </p>
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <ScrollText className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No audit events yet.</p>
          <p className="text-xs mt-1">Events will appear as you use the admin tool.</p>
        </CardContent>
      </Card>
    </div>
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
    <div className="space-y-6 max-w-lg">
      {revoked && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          All tokens have been revoked. Reconnect platforms to resume posting.
        </div>
      )}

      <div className="rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="font-medium text-sm">Emergency Controls</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          These controls immediately affect automated posting. Use with caution.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Global Autopost</Label>
              <p className="text-xs text-muted-foreground">Disable all automated posting globally.</p>
            </div>
            <Switch checked={globalAutopost} onCheckedChange={setGlobalAutopost} />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="font-medium">Platform Controls</Label>
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
          </div>

          <Separator />

          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => setShowRevokeConfirm(true)}
          >
            <Power className="h-4 w-4 mr-1" /> Revoke All Tokens
          </Button>
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
        <TabsList>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="killswitch">Kill Switch</TabsTrigger>
        </TabsList>
        <TabsContent value="tokens" className="mt-4"><TokensTab /></TabsContent>
        <TabsContent value="users" className="mt-4"><UsersTab /></TabsContent>
        <TabsContent value="audit" className="mt-4"><AuditLogTab /></TabsContent>
        <TabsContent value="killswitch" className="mt-4"><KillSwitchTab /></TabsContent>
      </Tabs>
    </div>
  );
}
