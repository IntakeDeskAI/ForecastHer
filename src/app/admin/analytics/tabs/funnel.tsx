"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDown, AlertTriangle, Lightbulb } from "lucide-react";
import type { AnalyticsData } from "./types";

interface FunnelStep {
  label: string;
  value: number;
  conversionToNext?: number;
  dropOff?: number;
}

export function FunnelTab({ data }: { data: AnalyticsData }) {
  const { current } = data;

  const visitors = current.sessions;
  const ctaClicks = current.ctaClicks;
  const signups = current.signups;

  const steps: FunnelStep[] = [
    {
      label: "Visitors (Sessions)",
      value: visitors,
      conversionToNext: visitors > 0 ? (ctaClicks / visitors) * 100 : 0,
      dropOff: visitors > 0 ? ((visitors - ctaClicks) / visitors) * 100 : 0,
    },
    {
      label: "Waitlist CTA Clicks",
      value: ctaClicks,
      conversionToNext: ctaClicks > 0 ? (signups / ctaClicks) * 100 : 0,
      dropOff: ctaClicks > 0 ? ((ctaClicks - signups) / ctaClicks) * 100 : 0,
    },
    {
      label: "Waitlist Signups",
      value: signups,
    },
  ];

  const hasData = visitors > 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Three-step funnel: Visitors → CTA Clicks → Signups. Identify the biggest drop-off and fix it.
      </p>

      {/* Funnel visualization — only render when real data exists */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Conversion Funnel ({data.range})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {steps.map((step, i) => {
                const widthPct = Math.max(5, (step.value / visitors) * 100);
                const isLastStep = i === steps.length - 1;

                return (
                  <div key={step.label}>
                    {/* Step bar */}
                    <div className="flex items-center gap-3">
                      <div className="w-40 shrink-0 text-right">
                        <span className="text-sm font-medium">{step.label}</span>
                      </div>
                      <div className="flex-1 relative">
                        <div
                          className="h-10 rounded-lg flex items-center px-3 transition-all"
                          style={{
                            width: `${widthPct}%`,
                            background: i === 0
                              ? "hsl(271, 91%, 65%)"
                              : i === 1
                                ? "hsl(271, 91%, 55%)"
                                : "hsl(142, 71%, 45%)",
                          }}
                        >
                          <span className="text-white font-bold font-mono text-sm">
                            {step.value.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Drop-off arrow */}
                    {!isLastStep && (
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-40 shrink-0" />
                        <div className="flex items-center gap-2 text-xs pl-2">
                          <ArrowDown className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {step.conversionToNext?.toFixed(1)}% convert
                          </span>
                          <span className="text-red-500 font-medium">
                            {step.dropOff?.toFixed(1)}% drop-off
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fix-it recommendations */}
      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CTA Click drop-off */}
          {steps[0].dropOff !== undefined && steps[0].dropOff > 90 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="py-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Low CTA visibility</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Only {steps[0].conversionToNext?.toFixed(1)}% of visitors click a CTA.
                    Consider adding more prominent waitlist CTAs, sticky banners, or exit-intent popups.
                  </p>
                  <Button variant="outline" size="sm" className="text-xs mt-2 h-7 gap-1">
                    <Lightbulb className="h-3 w-3" /> Add CTA placement task
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signup drop-off */}
          {steps[1].dropOff !== undefined && steps[1].dropOff > 70 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardContent className="py-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Form friction detected</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {steps[1].dropOff?.toFixed(0)}% of CTA clickers don&apos;t complete signup.
                    Reduce form fields, improve social proof near the form, or clarify the beta credits offer.
                  </p>
                  <Button variant="outline" size="sm" className="text-xs mt-2 h-7 gap-1">
                    <Lightbulb className="h-3 w-3" /> Optimize landing page
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasData && (
        <Card>
          <CardContent className="py-8 text-center">
            <ArrowDown className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <h3 className="font-semibold text-base">No funnel data yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The conversion funnel will populate once GA4 analytics ingestion is running and site traffic is being tracked.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Steps: Connect GA4 → Run analytics import → Traffic data flows in automatically.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
