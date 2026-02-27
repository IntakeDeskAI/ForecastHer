"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, Loader2, CheckCircle } from "lucide-react";

export default function MfaEnrollPage() {
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    enrollFactor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enrollFactor() {
    setLoading(true);
    setError("");

    // Clean up any existing unverified TOTP factors first
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if (factors?.totp) {
      for (const factor of factors.totp) {
        if ((factor.status as string) !== "verified") {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }
    }

    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `forecasther-admin-${Date.now()}`,
    });

    if (enrollError || !data) {
      setError(enrollError?.message || "Failed to start MFA enrollment.");
      setLoading(false);
      return;
    }

    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError("");

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError || !challengeData) {
      setError(challengeError?.message || "Failed to create MFA challenge.");
      setVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      setError("Invalid code. Please try again.");
      setCode("");
      setVerifying(false);
      return;
    }

    // Mark MFA as enabled in admin record
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mfa_enrolled" }),
    });

    // Log audit event
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "audit_log", event: "mfa_enroll" }),
    });

    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <ShieldAlert className="h-6 w-6 text-purple-700" />
          </div>
          <CardTitle className="font-serif text-2xl">
            Secure Your Admin Access
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Two-factor authentication is required for all admin accounts.
            <br />
            Scan the QR code with your authenticator app.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div
              className="rounded-lg border bg-white p-4"
              dangerouslySetInnerHTML={{ __html: qrCode }}
            />
          </div>

          {/* Manual secret */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Can&apos;t scan? Enter this code manually:
            </Label>
            <code className="block break-all rounded bg-muted px-3 py-2 text-xs font-mono">
              {secret}
            </code>
          </div>

          {/* Verify code */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Enter 6-digit code to confirm</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                autoComplete="one-time-code"
                className="text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full gradient-purple text-white"
              disabled={verifying || code.length !== 6}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm &amp; Enable 2FA
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Supported apps: Google Authenticator, 1Password, Authy, or any TOTP
            app.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
