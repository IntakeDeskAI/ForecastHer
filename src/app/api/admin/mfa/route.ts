import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 10;

/**
 * POST /api/admin/mfa — MFA rate limiting & attempt tracking
 * Actions: check_rate_limit, record_attempt
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;
    const adminDb = createAdminClient();

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    switch (action) {
      case "check_rate_limit": {
        const { data, error } = await adminDb.rpc(
          "count_recent_mfa_failures",
          {
            p_ip: ip,
            p_minutes: WINDOW_MINUTES,
          }
        );

        if (error) {
          // If the function doesn't exist yet, don't block
          return NextResponse.json({ ok: true });
        }

        if (data >= MAX_ATTEMPTS) {
          return NextResponse.json(
            {
              error: `Too many failed attempts. Try again in ${WINDOW_MINUTES} minutes.`,
            },
            { status: 429 }
          );
        }

        return NextResponse.json({ ok: true, remaining: MAX_ATTEMPTS - data });
      }

      case "record_attempt": {
        const success = body.success === true;

        await adminDb.from("admin_mfa_attempts").insert({
          ip_address: ip,
          admin_id: user.id,
          success,
        });

        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
