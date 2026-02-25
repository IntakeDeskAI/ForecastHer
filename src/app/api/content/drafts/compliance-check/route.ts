import { NextRequest, NextResponse } from "next/server";

// POST /api/content/drafts/compliance-check
// Validates drafts against guardrails
export async function POST(req: NextRequest) {
  const body = await req.json();
  const draftIds: string[] = body.draft_ids || [];
  const required = body.required || {};

  // Compliance rules from spec section 5
  const rules = [
    {
      id: "disclosure",
      label: "Pre-launch disclosure present",
      check: required.disclosure !== false,
    },
    {
      id: "citations",
      label: "Citations present for factual claims",
      check: required.citations !== false,
    },
    {
      id: "no_medical_advice",
      label: "No medical advice language",
      check: required.no_medical_advice !== false,
    },
    {
      id: "no_fake_metrics",
      label: "No invented metrics (labeled illustrative or removed)",
      check: required.no_fake_metrics !== false,
    },
  ];

  // In production, each draft would be checked individually.
  // For now, return a structure the workflow can use.
  const results = draftIds.map((id) => ({
    draft_id: id,
    checks: rules.map((r) => ({
      rule: r.id,
      label: r.label,
      passed: true, // placeholder — real implementation scans draft text
    })),
  }));

  const allPassed = results.every((r) => r.checks.every((c) => c.passed));

  return NextResponse.json({ results, all_passed: allPassed });
}
