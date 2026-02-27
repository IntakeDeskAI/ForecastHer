"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

interface CalendarDay {
  day: number;
  weekday: string;
  week: number;
  theme: string;
  tasks: string[];
}

/* ═══════════════════════════════════════════════════════════════════════
   30-DAY EXECUTION CALENDAR
   ═══════════════════════════════════════════════════════════════════════ */

const CALENDAR_DATA: CalendarDay[] = [
  // Week 1: Setup and volume
  { day: 1, weekday: "Mon", week: 1, theme: "Setup + Volume", tasks: [
    "Create 5 market preview cards + 5 short scripts",
    "Post Market of the Day on X and LinkedIn",
    "Post IG card",
    "Post TikTok hook video",
    "20 X comments, 10 LinkedIn comments, 10 DMs",
    "Send Weekly Digest email",
  ]},
  { day: 2, weekday: "Tue", week: 1, theme: "Setup + Volume", tasks: [
    "Market of the Day — all platforms",
    "Post \"Suggest a market\" thread on X",
    "20 X comments, 5 Reddit value replies, 10 DMs",
  ]},
  { day: 3, weekday: "Wed", week: 1, theme: "Setup + Volume", tasks: [
    "Market of the Day — all platforms",
    "Outreach sprint: 15 femtech founders, 10 creators",
    "20 X comments, 10 LinkedIn comments",
  ]},
  { day: 4, weekday: "Thu", week: 1, theme: "Setup + Volume", tasks: [
    "Market of the Day — all platforms",
    "Reddit post: \"Forecast question of the week\" in 1 subreddit",
    "20 X comments, 10 DMs",
  ]},
  { day: 5, weekday: "Fri", week: 1, theme: "Setup + Volume", tasks: [
    "Market of the Day — all platforms",
    "\"Week recap\" X thread with 5 markets",
    "20 X comments, 10 LinkedIn comments",
  ]},
  { day: 6, weekday: "Sat", week: 1, theme: "Setup + Volume", tasks: [
    "One post on X only: \"Weekend market\"",
    "30 comments total across X + Reddit",
    "Reply to all inbound DMs and comments",
  ]},
  { day: 7, weekday: "Sun", week: 1, theme: "Setup + Volume", tasks: [
    "Prep next week: 7 markets, 7 cards, 7 scripts",
    "Update Script Library based on best hooks",
    "Report weekly metrics",
  ]},
  // Week 2: Tighten hooks and build community loop
  { day: 8, weekday: "Mon", week: 2, theme: "Hooks + Community Loop", tasks: [
    "Market of the Day — all platforms",
    "Weekly Digest email",
    "DMs: 20 total",
    "Comments: 30 total",
  ]},
  { day: 9, weekday: "Tue", week: 2, theme: "Hooks + Community Loop", tasks: [
    "Market of the Day — all platforms",
    "Market suggestion thread",
    "20 X comments, 5 Reddit, 10 DMs",
  ]},
  { day: 10, weekday: "Wed", week: 2, theme: "Hooks + Community Loop", tasks: [
    "Market of the Day — all platforms",
    "Partner outreach: 20 podcast and newsletter pitches",
    "20 X comments, 10 LinkedIn",
  ]},
  { day: 11, weekday: "Thu", week: 2, theme: "Hooks + Community Loop", tasks: [
    "Market of the Day — all platforms",
    "Reddit value posts: 3 subreddits",
    "20 X comments, 10 DMs",
  ]},
  { day: 12, weekday: "Fri", week: 2, theme: "Hooks + Community Loop", tasks: [
    "Market of the Day — all platforms",
    "\"Community picks\" thread featuring submitted markets",
    "20 X comments, 10 LinkedIn",
  ]},
  { day: 13, weekday: "Sat", week: 2, theme: "Hooks + Community Loop", tasks: [
    "Weekend market post on X",
    "30 comments total",
    "Reply to all inbound",
  ]},
  { day: 14, weekday: "Sun", week: 2, theme: "Hooks + Community Loop", tasks: [
    "Prep next week: assets, markets, scripts",
    "A/B review: which hooks worked best?",
    "Report weekly metrics",
  ]},
  // Week 3: Social proof and referrals
  { day: 15, weekday: "Mon", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Market of the Day — all platforms",
    "Weekly Digest email",
    "Feature community contributors who suggested markets",
    "Comments: 30, DMs: 10",
  ]},
  { day: 16, weekday: "Tue", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Market of the Day — all platforms",
    "Creator outreach: 20 short collab asks",
    "20 X comments, 10 DMs",
  ]},
  { day: 17, weekday: "Wed", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Market of the Day — all platforms",
    "TikTok clip: \"Resolution you can audit\"",
    "20 X comments, 10 LinkedIn",
  ]},
  { day: 18, weekday: "Thu", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Market of the Day — all platforms",
    "Reddit: \"What would you predict about women in tech?\"",
    "20 comments, 10 DMs",
  ]},
  { day: 19, weekday: "Fri", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Market of the Day — all platforms",
    "\"Founding 500\" callout thread + referral ask",
    "20 X comments, 10 LinkedIn",
  ]},
  { day: 20, weekday: "Sat", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Weekend market on X",
    "30 comments total",
    "Reply to all inbound",
  ]},
  { day: 21, weekday: "Sun", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Prep next week assets",
    "Review collab replies and schedule follow-ups",
    "Report weekly metrics",
  ]},
  // Week 4: Scale what worked
  { day: 22, weekday: "Mon", week: 4, theme: "Scale What Worked", tasks: [
    "Market of the Day — all platforms",
    "Weekly Digest email",
    "Double down on best channel from analytics",
    "Comments: 30, DMs: 10",
  ]},
  { day: 23, weekday: "Tue", week: 4, theme: "Scale What Worked", tasks: [
    "Market of the Day — all platforms",
    "Press outreach: 20 pitches to writers and newsletters",
    "20 X comments, 10 DMs",
  ]},
  { day: 24, weekday: "Wed", week: 4, theme: "Scale What Worked", tasks: [
    "Market of the Day — all platforms",
    "Collab follow-ups from Week 3",
    "20 comments, 10 LinkedIn",
  ]},
  { day: 25, weekday: "Thu", week: 4, theme: "Scale What Worked", tasks: [
    "Market of the Day — all platforms",
    "\"Founding 500\" update + referral reminder",
    "20 comments, 10 DMs",
  ]},
  { day: 26, weekday: "Fri", week: 4, theme: "Scale What Worked", tasks: [
    "Market of the Day — all platforms",
    "Month recap X thread",
    "20 X comments, 10 LinkedIn",
  ]},
  { day: 27, weekday: "Sat", week: 4, theme: "Scale What Worked", tasks: [
    "Weekend market post",
    "30 comments total",
    "Reply to all inbound",
  ]},
  { day: 28, weekday: "Sun", week: 4, theme: "Scale What Worked", tasks: [
    "Month-end review: compile all metrics",
    "Plan Month 2 playbook based on data",
    "Report monthly metrics",
  ]},
];

const WEEK_THEMES: Record<number, string> = {
  1: "Setup + Volume",
  2: "Hooks + Community Loop",
  3: "Social Proof + Referrals",
  4: "Scale What Worked",
};

export default function CalendarPage() {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  function toggleDay(day: number) {
    setExpandedDay((prev) => (prev === day ? null : day));
  }

  function toggleWeek(week: number) {
    setExpandedWeek((prev) => (prev === week ? null : week));
  }

  const weeks = [1, 2, 3, 4];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          30-day execution calendar. Use this for planning — execution happens in Today.
        </p>
      </div>

      {weeks.map((week) => {
        const weekDays = CALENDAR_DATA.filter((d) => d.week === week);
        const isExpanded = expandedWeek === week;

        return (
          <Card key={week}>
            <CardHeader
              className="pb-2 cursor-pointer select-none"
              onClick={() => toggleWeek(week)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <CardTitle className="text-base font-serif">
                    Week {week}
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">
                    {WEEK_THEMES[week]}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Days {weekDays[0].day}–{weekDays[weekDays.length - 1].day}
                </span>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {weekDays.map((day) => {
                    const isDayExpanded = expandedDay === day.day;

                    return (
                      <div key={day.day}>
                        <button
                          onClick={() => toggleDay(day.day)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                        >
                          {isDayExpanded ? (
                            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                          )}
                          <span className="text-xs font-mono text-muted-foreground w-12 shrink-0">
                            Day {day.day}
                          </span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {day.weekday}
                          </Badge>
                          <span className="text-sm text-muted-foreground truncate">
                            {day.tasks.length} tasks
                          </span>
                        </button>
                        {isDayExpanded && (
                          <div className="ml-10 pl-3 border-l-2 border-border space-y-1 py-2">
                            {day.tasks.map((task, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-sm"
                              >
                                <Clock className="h-3 w-3 text-muted-foreground mt-1 shrink-0" />
                                <span>{task}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
