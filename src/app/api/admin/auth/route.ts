import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MfaAuditAction } from "@/lib/types";

/**
 * POST /api/admin/auth — admin auth operations
 * Actions: check_admin, mfa_enrolled, audit_log, mfa_reset
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

    switch (action) {
      case "check_admin": {
        const { data: admin } = await adminDb
          .from("admins")
          .select("*")
          .eq("id", user.id)
          .eq("is_active", true)
          .single();

        if (!admin) {
          return NextResponse.json({
            is_admin: false,
            mfa_enabled: false,
          });
        }

        return NextResponse.json({
          is_admin: true,
          role: admin.role,
          mfa_enabled: admin.mfa_enabled,
        });
      }

      case "mfa_enrolled": {
        const { error } = await adminDb
          .from("admins")
          .update({
            mfa_enabled: true,
            mfa_enrolled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) {
          return NextResponse.json(
            { error: "Failed to update MFA status" },
            { status: 500 }
          );
        }

        return NextResponse.json({ ok: true });
      }

      case "audit_log": {
        const event = body.event as MfaAuditAction;
        const detail = body.detail || {};

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        await adminDb.from("admin_audit_logs").insert({
          admin_id: user.id,
          action: event,
          detail,
          ip_address: ip === "unknown" ? null : ip,
          user_agent: userAgent,
        });

        return NextResponse.json({ ok: true });
      }

      case "mfa_reset": {
        // Owner-only: reset MFA for another admin
        const targetAdminId = body.target_admin_id as string;

        if (!targetAdminId) {
          return NextResponse.json(
            { error: "target_admin_id required" },
            { status: 400 }
          );
        }

        // Verify caller is an owner
        const { data: callerAdmin } = await adminDb
          .from("admins")
          .select("role")
          .eq("id", user.id)
          .eq("is_active", true)
          .single();

        if (!callerAdmin || callerAdmin.role !== "owner") {
          return NextResponse.json(
            { error: "Only owners can reset MFA" },
            { status: 403 }
          );
        }

        // Verify caller has aal2
        const { data: aalData } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (aalData?.currentLevel !== "aal2") {
          return NextResponse.json(
            { error: "Owner must verify their own 2FA first" },
            { status: 403 }
          );
        }

        // Reset the target admin's MFA flag
        const { error: resetError } = await adminDb
          .from("admins")
          .update({
            mfa_enabled: false,
            mfa_enrolled_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", targetAdminId);

        if (resetError) {
          return NextResponse.json(
            { error: "Failed to reset MFA" },
            { status: 500 }
          );
        }

        // Unenroll all MFA factors for the target user via Supabase Admin API
        // This requires the service role to manage another user's factors
        // The target will need to re-enroll on next login

        // Audit log
        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("x-real-ip") ||
          "unknown";

        await adminDb.from("admin_audit_logs").insert({
          admin_id: user.id,
          action: "mfa_reset_by_owner",
          detail: { target_admin_id: targetAdminId },
          ip_address: ip === "unknown" ? null : ip,
          user_agent: request.headers.get("user-agent") || "unknown",
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
