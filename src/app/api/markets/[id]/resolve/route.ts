import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/markets/:id/resolve
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await req.json();

  if (body.resolution === undefined || (body.resolution !== 0 && body.resolution !== 1)) {
    return NextResponse.json({ error: "resolution must be 0 or 1" }, { status: 400 });
  }

  const { error } = await supabase.rpc("resolve_market", {
    p_market_id: id,
    p_resolution: body.resolution,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, market_id: id, resolution: body.resolution });
}
