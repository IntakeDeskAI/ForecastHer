import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    // Normalize phone to digits only; reject if provided but not 10 digits
    const phoneDigits = typeof phone === "string" ? phone.replace(/\D/g, "") : "";
    if (phoneDigits && phoneDigits.length !== 10) {
      return NextResponse.json({ error: "Phone number must be 10 digits." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase.from("waitlist").insert({
      email: email.toLowerCase().trim(),
      phone: phoneDigits || null,
    });

    if (error) {
      // Unique constraint violation — already signed up
      if (error.code === "23505") {
        return NextResponse.json({ error: "You're already on the waitlist!" }, { status: 409 });
      }
      console.error("Waitlist insert error:", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
