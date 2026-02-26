"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Strip to digits, enforce 10-digit US format: (XXX) XXX-XXXX */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const EARLY_ACCESS_CAP = 500;

interface WaitlistFormProps {
  /** Visual variant — "hero" uses purple gradient button, "dark" uses white-on-dark styling */
  variant?: "hero" | "dark";
}

export function WaitlistForm({ variant = "hero" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [position, setPosition] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    // Validate phone if provided — must be a full 10-digit US number
    const phoneDigits = phone.replace(/\D/g, "");
    if (phone && phoneDigits.length !== 10) {
      setErrorMsg("Please enter a full 10-digit phone number.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), phone: phoneDigits || null }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      const data = await res.json();
      setPosition(data.position ?? null);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    const gotCredits = position !== null && position <= EARLY_ACCESS_CAP;
    return (
      <div className={`text-center py-4 ${variant === "dark" ? "text-white" : "text-foreground"}`}>
        <p className="text-lg font-semibold mb-1">You&apos;re in!</p>
        <p className={`text-sm ${variant === "dark" ? "text-white/60" : "text-muted-foreground"}`}>
          {gotCredits
            ? "Your 1,000 beta credits are reserved. We\u2019ll reach out when beta opens."
            : "We\u2019ll reach out when beta opens."}
        </p>
      </div>
    );
  }

  const isDark = variant === "dark";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-3">
      <Input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={isDark ? "bg-white/10 border-white/20 text-white placeholder:text-white/40" : "bg-white"}
      />
      <Input
        type="tel"
        placeholder="Phone number (optional) — (555) 123-4567"
        value={phone}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        maxLength={14}
        className={isDark ? "bg-white/10 border-white/20 text-white placeholder:text-white/40" : "bg-white"}
      />

      {status === "error" && (
        <p className="text-sm text-red-400 text-center">{errorMsg}</p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === "loading"}
        className={`w-full text-base ${
          isDark
            ? "bg-white text-[#1a1a2e] hover:bg-white/90"
            : "gradient-purple text-white shadow-lg shadow-purple/30 hover:shadow-purple/50"
        }`}
      >
        {status === "loading" ? "Joining..." : "Join the Waitlist"}
      </Button>
    </form>
  );
}
