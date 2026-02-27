"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function MfaVerifyPage() {
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadFactor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadFactor() {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verifiedFactor = factors?.totp?.find(
      (f) => f.status === "verified"
    );

    if (!verifiedFactor) {
      // No verified factor — redirect to enrollment
      router.push("/admin/mfa/enroll");
      return;
    }

    setFactorId(verifiedFactor.id);
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setError("");

    // Check rate limit server-side
    const rateRes = await fetch("/api/admin/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check_rate_limit" }),
    });

    if (!rateRes.ok) {
      const rateData = await rateRes.json();
      setError(rateData.error || "Too many attempts. Try again later.");
      setVerifying(false);
      return;
    }

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError || !challengeData) {
      setError("Failed to create challenge. Please try again.");
      setVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyError) {
      setAttempts((a) => a + 1);

      // Record failed attempt
      await fetch("/api/admin/mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "record_attempt", success: false }),
      });

      // Audit log
      await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "audit_log",
          event: "mfa_challenge_failure",
        }),
      });

      setError(
        attempts >= 4
          ? "Too many failed attempts. Please wait and try again."
          : "Invalid code. Please try again."
      );
      setCode("");
      setVerifying(false);
      return;
    }

    // Record success
    await fetch("/api/admin/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "record_attempt", success: true }),
    });

    // Audit log
    await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "audit_log",
        event: "mfa_challenge_success",
      }),
    });

    router.push("/admin");
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <ShieldAlert className="h-6 w-6 text-purple-700" />
          </div>
          <CardTitle className="font-serif text-2xl">
            Two-Factor Authentication
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
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
                autoFocus
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
                "Verify"
              )}
            </Button>
          </form>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            Lost your authenticator? Contact the account owner to reset your
            2FA.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
