import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/admin/content?status=all&platform=all&limit=50
 *
 * Fetch content drafts from the database.
 */
export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status") ?? "all";
  const platform = request.nextUrl.searchParams.get("platform") ?? "all";
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "50");

  const supabase = createAdminClient();

  let query = supabase
    .from("content_drafts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status !== "all") {
    query = query.eq("status", status);
  }
  if (platform !== "all") {
    query = query.eq("platform", platform);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch drafts.", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ drafts: data ?? [] });
}

/**
 * POST /api/admin/content
 *
 * Create one or more content drafts.
 * Body: { drafts: ContentDraft[] } or a single draft object.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = createAdminClient();

  const drafts = Array.isArray(body.drafts) ? body.drafts : [body];

  const rows = drafts.map((d: Record<string, unknown>) => ({
    market_id: d.market_id ?? null,
    market_title: d.market_title ?? null,
    platform: d.platform ?? "x",
    format: d.format ?? "card_caption",
    status: d.status ?? "new",
    hook: d.hook ?? "",
    body: d.body ?? "",
    cta: d.cta ?? "",
    hashtags: d.hashtags ?? [],
    first_comment: d.first_comment ?? null,
    disclosure_line: d.disclosure_line ?? null,
    utm_link: d.utm_link ?? null,
    confidence: d.confidence ?? 0,
    risk_level: d.risk_level ?? "low",
    citations: d.citations ?? [],
    compliance_checks: d.compliance_checks ?? [],
    asset_ids: d.asset_ids ?? [],
    approval_history: d.approval_history ?? [],
    prompt_used: d.prompt_used ?? null,
    model_used: d.model_used ?? null,
    final_text: d.final_text ?? null,
  }));

  const { data, error } = await supabase
    .from("content_drafts")
    .insert(rows)
    .select();

  if (error) {
    return NextResponse.json({ error: "Failed to create drafts.", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, drafts: data });
}

/**
 * PATCH /api/admin/content
 *
 * Update a content draft.
 * Body: { id: string, ...fields }
 */
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "id required." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("content_drafts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to update draft.", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, draft: data });
}

/**
 * DELETE /api/admin/content?id=xxx
 *
 * Delete a content draft.
 */
export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("content_drafts")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete draft.", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
