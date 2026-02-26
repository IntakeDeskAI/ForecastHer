"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WaitlistFormProps {
  /** Visual variant — "hero" uses purple gradient button, "dark" uses white-on-dark styling */
  variant?: "hero" | "dark";
}

export function WaitlistForm({ variant = "hero" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() || null }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={`text-center py-4 ${variant === "dark" ? "text-white" : "text-foreground"}`}>
        <p className="text-lg font-semibold mb-1">You&apos;re on the list!</p>
        <p className={`text-sm ${variant === "dark" ? "text-white/60" : "text-muted-foreground"}`}>
          We&apos;ll reach out when beta opens.
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
        placeholder="Phone number (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
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
