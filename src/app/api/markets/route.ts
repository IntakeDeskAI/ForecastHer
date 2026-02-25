import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/markets — list markets with optional filters
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = req.nextUrl;

  let query = supabase.from("markets").select("*").order("created_at", { ascending: false });

  const category = searchParams.get("category");
  if (category) query = query.eq("category", category);

  const status = searchParams.get("status");
  if (status) query = query.eq("status", status);

  const due = searchParams.get("due");
  if (due === "true") {
    query = query.eq("status", "open").lte("resolves_at", new Date().toISOString());
  }

  const windowDays = searchParams.get("window_days");
  if (windowDays) {
    const since = new Date();
    since.setDate(since.getDate() - parseInt(windowDays, 10));
    query = query.gte("created_at", since.toISOString());
  }

  const limit = searchParams.get("limit");
  if (limit) query = query.limit(parseInt(limit, 10));

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/markets — create a new market
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const required = ["title", "resolution_criteria", "closes_at", "resolves_at"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("markets")
    .insert({
      title: body.title,
      description: body.description || null,
      category: body.category || "womens-health",
      resolution_criteria: body.resolution_criteria,
      resolution_source: body.resolution_source || null,
      closes_at: body.closes_at,
      resolves_at: body.resolves_at,
      liquidity_param: body.liquidity_param || 100,
      featured: body.featured || false,
      status: "open",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
