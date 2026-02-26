"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { PlatformToken, AdminUser, AuditLogEntry, Platform } from "@/lib/types";
import {
  Key,
  Users,
  ScrollText,
  ShieldOff,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  Power,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Shield,
  Wifi,
} from "lucide-react";

// ── Enhanced Token Data ─────────────────────────────────────────────

type EnhancedToken = PlatformToken & {
  scopes_granted: string[];
  last_successful_post: string | null;
  token_expires_at: string | null;
  connected_account: string | null;
  health_status: "healthy" | "warning" | "error" | "disconnected";
  health_detail: string;
};

const PLATFORM_TOKENS: EnhancedToken[] = [
  {
    platform: "x",
    account_name: "Not connected",
    status: "revoked",
    last_used: null,
    expires_at: null,
    scopes_granted: [],
    last_successful_post: null,
    token_expires_at: null,
    connected_account: null,
    health_status: "disconnected",
    health_detail: "No account connected. Connect to enable X posting.",
  },
  {
    platform: "instagram",
    account_name: "Not connected",
    status: "revoked",
    last_used: null,
    expires_at: null,
    scopes_granted: [],
    last_successful_post: null,
    token_expires_at: null,
    connected_account: null,
    health_status: "disconnected",
    health_detail: "No account connected. Requires Facebook Business account.",
  },
  {
    platform: "tiktok",
    account_name: "Not connected",
    status: "revoked",
    last_used: null,
    expires_at: null,
    scopes_granted: [],
    last_successful_post: null,
    token_expires_at: null,
    connected_account: null,
    health_status: "disconnected",
    health_detail: "No account connected. TikTok API requires creator account.",
  },
  {
    platform: "linkedin",
    account_name: "Not connected",
    status: "revoked",
    last_used: null,
    expires_at: null,
    scopes_granted: [],
    last_successful_post: null,
    token_expires_at: null,
    connected_account: null,
    health_status: "disconnected",
    health_detail: "No account connected. Requires LinkedIn company page admin access.",
  },
  {
    platform: "email",
    account_name: "Not configured",
    status: "revoked",
    last_used: null,
    expires_at: null,
    scopes_granted: [],
    last_successful_post: null,
    token_expires_at: null,
    connected_account: null,
    health_status: "disconnected",
    health_detail: "No email provider configured. Set up SendGrid, Resend, or Postmark.",
  },
];

// Platform display config
const PLATFORM_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  x: { label: "X (Twitter)", color: "bg-black text-white", icon: "X" },
  instagram: { label: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white", icon: "IG" },
  tiktok: { label: "TikTok", color: "bg-black text-white", icon: "TT" },
  linkedin: { label: "LinkedIn", color: "bg-blue-600 text-white", icon: "in" },
  email: { label: "Email", color: "bg-green-600 text-white", icon: "@" },
};

function HealthBadge({ status }: { status: EnhancedToken["health_status"] }) {
  const config = {
    healthy: { label: "Healthy", className: "bg-green-100 text-green-700 border-green-200" },
    warning: { label: "Warning", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    error: { label: "Error", className: "bg-red-100 text-red-700 border-red-200" },
    disconnected: { label: "Disconnected", className: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const c = config[status];
  return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>;
}

function TokensTab() {
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null);

  const connectedCount = PLATFORM_TOKENS.filter((t) => t.status !== "revoked").length;

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
          {connectedCount}/{PLATFORM_TOKENS.length} connected
        </Badge>
      </div>

      {/* Warning banner when nothing is connected */}
      {connectedCount === 0 && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">No platforms connected</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              The system cannot post any content until at least one platform token is configured.
              Connect a platform below to enable automated posting.
            </p>
          </div>
        </div>
      )}

      {/* Token cards */}
      <div className="space-y-4">
        {PLATFORM_TOKENS.map((token) => {
          const cfg = PLATFORM_CONFIG[token.platform];
          const isConnected = token.status !== "revoked";
          const isTesting = testingPlatform === token.platform;

          return (
            <Card
              key={token.platform}
              className={`${
                !isConnected ? "border-dashed" : ""
              }`}
            >
              <CardContent className="p-5">
                {/* Top row: platform info + health + actions */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-bold ${cfg.color}`}>
                      {cfg.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{cfg.label}</p>
                      {token.connected_account ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Connected as <span className="font-medium">{token.connected_account}</span>
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-gray-400" />
                          {token.account_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <HealthBadge status={token.health_status} />
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      <ExternalLink className="h-3 w-3" />
                      {isConnected ? "Reauth" : "Connect"}
                    </Button>
                  </div>
                </div>

                {/* Detail grid - shown for all tokens */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Scopes granted</span>
                    <p className="font-medium mt-0.5">
                      {token.scopes_granted.length > 0 ? (
                        <span className="text-green-600">{token.scopes_granted.join(", ")}</span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last successful post</span>
                    <p className="font-medium mt-0.5">
                      {token.last_successful_post ? (
                        new Date(token.last_successful_post).toLocaleDateString()
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Token expires</span>
                    <p className="font-medium mt-0.5">
                      {token.token_expires_at ? (
                        <span className={
                          new Date(token.token_expires_at) < new Date()
                            ? "text-red-600"
                            : ""
                        }>
                          {new Date(token.token_expires_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status detail</span>
                    <p className="font-medium mt-0.5 text-muted-foreground">{token.health_detail}</p>
                  </div>
                </div>

                {/* Test post button */}
                {isConnected && (
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Send a test to verify the connection works end-to-end.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1"
                      disabled={isTesting}
                      onClick={() => {
                        setTestingPlatform(token.platform);
                        setTimeout(() => setTestingPlatform(null), 2000);
                      }}
                    >
                      <Send className="h-3 w-3" />
                      {isTesting ? "Testing..." : "Send Test Post"}
                    </Button>
                  </div>
                )}

                {/* Connect CTA for disconnected */}
                {!isConnected && (
                  <div className="mt-4 pt-3 border-t border-dashed border-border">
                    <p className="text-xs text-muted-foreground">{token.health_detail}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Users & Roles Tab ────────────────────────────────────────────────

function UsersTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage admin users and their roles.</p>
        <Button size="sm" className="gradient-purple text-white">
          <Users className="h-4 w-4 mr-1" /> Invite User
        </Button>
      </div>

      <Card>
        <div className="p-4 text-center text-muted-foreground">
          <Users className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Only the owner account is configured.</p>
          <p className="text-xs mt-1">Invite editors, reviewers, or analysts to collaborate.</p>
        </div>
      </Card>

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

  function togglePlatform(p: Platform) {
    setPlatformStates((prev) => ({ ...prev, [p]: !prev[p] }));
  }

  return (
    <div className="space-y-6 max-w-lg">
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

          <Button variant="destructive" size="sm" className="w-full">
            <Power className="h-4 w-4 mr-1" /> Revoke All Tokens
          </Button>
        </div>
      </div>
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
