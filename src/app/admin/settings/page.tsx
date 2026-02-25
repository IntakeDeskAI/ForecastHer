"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";

// ── Tokens Tab ───────────────────────────────────────────────────────

const PLATFORM_TOKENS: PlatformToken[] = [
  { platform: "x", account_name: "Not connected", status: "revoked", last_used: null, expires_at: null },
  { platform: "instagram", account_name: "Not connected", status: "revoked", last_used: null, expires_at: null },
  { platform: "tiktok", account_name: "Not connected", status: "revoked", last_used: null, expires_at: null },
  { platform: "linkedin", account_name: "Not connected", status: "revoked", last_used: null, expires_at: null },
  { platform: "email", account_name: "Not configured", status: "revoked", last_used: null, expires_at: null },
];

function TokensTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Platform authentication tokens for automated posting.
      </p>
      <div className="space-y-3">
        {PLATFORM_TOKENS.map((token) => (
          <Card key={token.platform}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Key className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm capitalize">{token.platform === "x" ? "X (Twitter)" : token.platform}</p>
                    <p className="text-xs text-muted-foreground">{token.account_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      token.status === "active"
                        ? "bg-green-100 text-green-700"
                        : token.status === "expired"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {token.status}
                  </Badge>
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {token.status === "revoked" ? "Connect" : "Reauth"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-300">—</span>
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
