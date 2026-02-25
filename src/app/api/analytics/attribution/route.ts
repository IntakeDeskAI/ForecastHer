import { NextResponse } from "next/server";

// GET /api/analytics/attribution — UTM breakdown and conversion data
export async function GET() {
  return NextResponse.json({
    utm_breakdown: [],
    post_to_signup_conversion: 0,
    total_tracked_clicks: 0,
    message: "Attribution tracking will populate after posts with UTM links are published.",
  });
}
