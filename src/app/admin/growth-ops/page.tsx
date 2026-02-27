"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  MessageSquare,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Copy,
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  Pencil,
  ExternalLink,
  Hash,
  Mail,
  Megaphone,
  Sparkles,
  Eye,
  MousePointerClick,
  UserPlus,
  AlertTriangle,
  Wand2,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react";
import { HowItWorks } from "@/components/how-it-works";

/* ═══════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════ */

type TaskStatus = "not_started" | "in_progress" | "posted" | "done" | "blocked";
type Channel = "x" | "ig" | "tiktok" | "linkedin" | "reddit" | "pinterest" | "email" | "dm";

interface GrowthTask {
  id: string;
  name: string;
  owner: string;
  dueDate: string;
  day: number;
  channel: Channel;
  assetNeeded: boolean;
  utmLink: string;
  status: TaskStatus;
  impressions: number | null;
  clicks: number | null;
  signups: number | null;
  notes: string;
}

interface DailyScorecard {
  date: string;
  postsPublished: number;
  commentsDelivered: number;
  dmsSent: number;
  waitlistSignups: number;
  topPostLink: string;
}

interface Script {
  id: string;
  name: string;
  channel: Channel | "multi";
  template: string;
  variables: string[];
  notes: string;
}

interface Lead {
  id: string;
  name: string;
  type: "founder" | "creator" | "podcast" | "newsletter" | "press";
  channel: Channel;
  status: "not_contacted" | "contacted" | "replied" | "converted" | "declined";
  lastContact: string | null;
  notes: string;
}

/* ═══════════════════════════════════════════════════════════════════════
   CHANNEL HELPERS
   ═══════════════════════════════════════════════════════════════════════ */

const CHANNEL_LABELS: Record<Channel | "multi", string> = {
  x: "X",
  ig: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  reddit: "Reddit",
  pinterest: "Pinterest",
  email: "Email",
  dm: "DM",
  multi: "Multi",
};

const CHANNEL_COLORS: Record<Channel | "multi", string> = {
  x: "bg-black text-white",
  ig: "bg-pink-600 text-white",
  tiktok: "bg-black text-white",
  linkedin: "bg-blue-600 text-white",
  reddit: "bg-orange-600 text-white",
  pinterest: "bg-red-600 text-white",
  email: "bg-green-600 text-white",
  dm: "bg-purple-600 text-white",
  multi: "bg-gray-600 text-white",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  posted: "Posted",
  done: "Done",
  blocked: "Blocked",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  not_started: "border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  in_progress: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  posted: "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  done: "border-green-300 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  blocked: "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

/* ═══════════════════════════════════════════════════════════════════════
   30-DAY CALENDAR DATA
   ═══════════════════════════════════════════════════════════════════════ */

interface CalendarDay {
  day: number;
  weekday: string;
  week: number;
  theme: string;
  tasks: string[];
}

// Maps task keywords to admin page links
const TASK_LINKS: { pattern: RegExp; href: string; label: string }[] = [
  { pattern: /market preview cards|market cards/i, href: "/admin/content?tab=assets", label: "Asset Generator" },
  { pattern: /scripts|script library/i, href: "/admin/growth-ops?tab=scripts", label: "Script Library" },
  { pattern: /market of the day/i, href: "/admin/content?tab=editor", label: "Content Editor" },
  { pattern: /weekly digest email/i, href: "/admin/growth-ops?tab=scripts", label: "Email Template" },
  { pattern: /suggest a market.*thread/i, href: "/admin/growth-ops?tab=scripts", label: "Thread Template" },
  { pattern: /reddit.*post|reddit.*value/i, href: "/admin/growth-ops?tab=scripts", label: "Reddit Template" },
  { pattern: /outreach.*sprint|partner outreach|creator outreach|press outreach|collab/i, href: "/admin/growth-ops?tab=leads", label: "Leads & Outreach" },
  { pattern: /dms|dm follow/i, href: "/admin/growth-ops?tab=leads", label: "Leads & Outreach" },
  { pattern: /prep.*week|prep.*assets|prep.*markets/i, href: "/admin/ai-studio", label: "AI Studio" },
  { pattern: /report|weekly report|monthly report|weekly metrics|month recap/i, href: "/admin/growth-ops?tab=reporting", label: "Reporting" },
  { pattern: /update script library|best hooks/i, href: "/admin/growth-ops?tab=scripts", label: "Script Library" },
  { pattern: /analytics/i, href: "/admin/analytics", label: "Analytics" },
  { pattern: /x thread|week recap.*thread/i, href: "/admin/content?tab=editor", label: "Content Editor" },
  { pattern: /tiktok|clip for tiktok/i, href: "/admin/content?tab=assets", label: "Asset Generator" },
  { pattern: /social proof|waitlist count/i, href: "/admin/analytics", label: "Analytics" },
  { pattern: /founding 500/i, href: "/admin/content?tab=assets", label: "Asset Generator" },
];

function getTaskLink(task: string): { href: string; label: string } | null {
  for (const link of TASK_LINKS) {
    if (link.pattern.test(task)) return { href: link.href, label: link.label };
  }
  return null;
}

const CALENDAR: CalendarDay[] = [
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
    'Post "Suggest a market" thread on X',
    "20 X comments, 5 Reddit value replies, 10 DMs",
  ]},
  { day: 3, weekday: "Wed", week: 1, theme: "Setup + Volume", tasks: [
    "Market of the Day — all platforms",
    "Outreach sprint: 15 femtech founders, 10 creators",
    "20 X comments, 10 LinkedIn comments",
  ]},
  { day: 4, weekday: "Thu", week: 1, theme: "Setup + Volume", tasks: [
    "Market of the Day — all platforms",
    'Reddit post: "Forecast question of the week" in 1 subreddit',
    "20 X comments, 10 DMs",
  ]},
  { day: 5, weekday: "Fri", week: 1, theme: "Setup + Volume", tasks: [
    "Market of the Day — all platforms",
    '"Week recap" X thread with 5 markets',
    "20 X comments, 10 LinkedIn comments",
  ]},
  { day: 6, weekday: "Sat", week: 1, theme: "Setup + Volume", tasks: [
    'One post on X only: "Weekend market"',
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
    'Create 3 "community suggested" market cards',
  ]},
  { day: 10, weekday: "Wed", week: 2, theme: "Hooks + Community Loop", tasks: [
    "Market of the Day — all platforms",
    "Partner outreach: podcasts + newsletters, 20 pitches",
    "Comments: 30",
  ]},
  { day: 11, weekday: "Thu", week: 2, theme: "Hooks + Community Loop", tasks: [
    "Market of the Day — all platforms",
    "Reddit value post in a second subreddit",
    "Comments: 30",
  ]},
  { day: 12, weekday: "Fri", week: 2, theme: "Hooks + Community Loop", tasks: [
    "Market of the Day — all platforms",
    'X thread: "Most mispriced market this week"',
    "Comments: 30",
  ]},
  { day: 13, weekday: "Sat", week: 2, theme: "Hooks + Community Loop", tasks: [
    "Light post + comment day",
    "DM follow-ups only",
  ]},
  { day: 14, weekday: "Sun", week: 2, theme: "Hooks + Community Loop", tasks: [
    'Prep week 3 assets + "Founding 500" push graphic',
    "Weekly report",
  ]},
  // Week 3: Social proof and referral push
  { day: 15, weekday: "Mon", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Market of the Day — all platforms",
    "Weekly Digest email",
    "Post social proof snippet: waitlist count or top market proposer",
    "DMs: 20",
  ]},
  { day: 16, weekday: "Tue", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Market of the Day — all platforms",
    "Market suggestion thread",
    "Feature 3 community handles who suggested markets",
  ]},
  { day: 17, weekday: "Wed", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Market of the Day — all platforms",
    "Creator outreach: 20 short collab asks",
    "Comments: 30",
  ]},
  { day: 18, weekday: "Thu", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Market of the Day — all platforms",
    "Reddit value post",
    'Build one "Resolution you can audit" clip for TikTok',
  ]},
  { day: 19, weekday: "Fri", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Market of the Day — all platforms",
    'X thread: "How resolution works in 60 seconds"',
    "Comments: 30",
  ]},
  { day: 20, weekday: "Sat", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Light post",
    "Reply and community day",
  ]},
  { day: 21, weekday: "Sun", week: 3, theme: "Social Proof + Referrals", tasks: [
    "Prep week 4 assets",
    "Weekly report",
  ]},
  // Week 4: Scale what worked
  { day: 22, weekday: "Mon", week: 4, theme: "Scale What Worked", tasks: [
    "Market of the Day — all platforms",
    "Weekly Digest email",
    "Double down on best channel from analytics",
  ]},
  { day: 23, weekday: "Tue", week: 4, theme: "Scale What Worked", tasks: [
    "Market of the Day — all platforms",
    "Market suggestion thread",
    "Add referral reminder post",
  ]},
  { day: 24, weekday: "Wed", week: 4, theme: "Scale What Worked", tasks: [
    "Market of the Day — all platforms",
    "Press outreach: 20 pitches to writers + newsletters",
  ]},
  { day: 25, weekday: "Thu", week: 4, theme: "Scale What Worked", tasks: [
    "Market of the Day — all platforms",
    "Reddit post",
    "Collab follow-ups",
  ]},
  { day: 26, weekday: "Fri", week: 4, theme: "Scale What Worked", tasks: [
    "Market of the Day — all platforms",
    '"Week recap" thread + "Founding 500" callout',
  ]},
  { day: 27, weekday: "Sat", week: 4, theme: "Scale What Worked", tasks: [
    "Light post",
    "Community replies",
  ]},
  { day: 28, weekday: "Sun", week: 4, theme: "Scale What Worked", tasks: [
    "Prep",
    "Weekly report",
  ]},
  // Final 2 days
  { day: 29, weekday: "Mon", week: 5, theme: "Month Close", tasks: [
    "Market of the Day — all platforms",
    "Weekly Digest email",
    '"Top 10 markets requested so far" list post',
  ]},
  { day: 30, weekday: "Tue", week: 5, theme: "Month Close", tasks: [
    "Market of the Day — all platforms",
    "Market suggestion thread",
    "Month recap: signups, top markets, next month plan",
  ]},
];

/* ═══════════════════════════════════════════════════════════════════════
   TASK QUEUE SEED DATA
   ═══════════════════════════════════════════════════════════════════════ */

const SEED_TASKS: GrowthTask[] = [
  { id: "t-1", name: "Create 5 market preview cards", owner: "Growth Lead", dueDate: "2026-03-02", day: 1, channel: "x", assetNeeded: true, utmLink: "utm_source=x&utm_medium=social&utm_campaign=wk1&utm_content=asset_batch_01", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
  { id: "t-2", name: "Market of the Day — X + LinkedIn", owner: "Growth Lead", dueDate: "2026-03-02", day: 1, channel: "x", assetNeeded: true, utmLink: "utm_source=x&utm_medium=social&utm_campaign=wk1&utm_content=motd_x_01", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
  { id: "t-3", name: "Post IG card", owner: "Growth Lead", dueDate: "2026-03-02", day: 1, channel: "ig", assetNeeded: true, utmLink: "utm_source=ig&utm_medium=social&utm_campaign=wk1&utm_content=motd_ig_01", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
  { id: "t-4", name: "Post TikTok hook video", owner: "Growth Lead", dueDate: "2026-03-02", day: 1, channel: "tiktok", assetNeeded: true, utmLink: "utm_source=tiktok&utm_medium=social&utm_campaign=wk1&utm_content=motd_tt_01", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
  { id: "t-5", name: "20 X comments, 10 LinkedIn comments, 10 DMs", owner: "Growth Lead", dueDate: "2026-03-02", day: 1, channel: "dm", assetNeeded: false, utmLink: "", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
  { id: "t-6", name: "Send Weekly Digest email", owner: "Growth Lead", dueDate: "2026-03-02", day: 1, channel: "email", assetNeeded: false, utmLink: "utm_source=email&utm_medium=email&utm_campaign=wk1&utm_content=digest_01", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
  { id: "t-7", name: "Market of the Day — all platforms", owner: "Growth Lead", dueDate: "2026-03-03", day: 2, channel: "x", assetNeeded: true, utmLink: "utm_source=x&utm_medium=social&utm_campaign=wk1&utm_content=motd_x_02", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
  { id: "t-8", name: '"Suggest a market" thread on X', owner: "Growth Lead", dueDate: "2026-03-03", day: 2, channel: "x", assetNeeded: false, utmLink: "utm_source=x&utm_medium=social&utm_campaign=wk1&utm_content=suggest_thread_01", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
  { id: "t-9", name: "20 X comments, 5 Reddit replies, 10 DMs", owner: "Growth Lead", dueDate: "2026-03-03", day: 2, channel: "dm", assetNeeded: false, utmLink: "", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
  { id: "t-10", name: "Market of the Day — all platforms", owner: "Growth Lead", dueDate: "2026-03-04", day: 3, channel: "x", assetNeeded: true, utmLink: "utm_source=x&utm_medium=social&utm_campaign=wk1&utm_content=motd_x_03", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
  { id: "t-11", name: "Outreach: 15 femtech founders, 10 creators", owner: "Growth Lead", dueDate: "2026-03-04", day: 3, channel: "dm", assetNeeded: false, utmLink: "", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
  { id: "t-12", name: "20 X comments, 10 LinkedIn comments", owner: "Growth Lead", dueDate: "2026-03-04", day: 3, channel: "x", assetNeeded: false, utmLink: "", status: "not_started", impressions: null, clicks: null, signups: null, notes: "" },
];

/* ═══════════════════════════════════════════════════════════════════════
   SCRIPT LIBRARY
   ═══════════════════════════════════════════════════════════════════════ */

const SCRIPTS: Script[] = [
  {
    id: "s-1",
    name: "Market of the Day — X Post",
    channel: "x",
    template: `Market of the Day:
Will [event] happen by [date]?

Why YES
1. [reason]
2. [reason]

Why NO
1. [reason]
2. [reason]

Rules: resolves via [primary source].
Join the waitlist for beta credits: [UTM link]

Pre-launch. Beta credits have no cash value.`,
    variables: ["event", "date", "reason (x4)", "primary source", "UTM link"],
    notes: "Keep under 280 chars for single-tweet version. Thread version can expand each reason.",
  },
  {
    id: "s-2",
    name: "Market of the Day — LinkedIn",
    channel: "linkedin",
    template: `A forecast worth arguing about:
Will [event] happen by [date]?

What matters:
1. [key driver]
2. [key driver]

How it resolves:
Primary source: [source]
Criteria: [one sentence]

We're pre-launch and building with play money credits first.
Join the waitlist: [UTM link]`,
    variables: ["event", "date", "key driver (x2)", "source", "criteria", "UTM link"],
    notes: "LinkedIn rewards longer posts. Add 2-3 paragraph commentary above the template for best reach.",
  },
  {
    id: "s-3",
    name: "IG Caption",
    channel: "ig",
    template: `Market of the Day
Will [event] happen by [date]?

2 reasons yes:
• [reason]
• [reason]

2 reasons no:
• [reason]
• [reason]

Resolves via: [source]
Join the waitlist: link in bio

Beta credits only. No cash value.`,
    variables: ["event", "date", "reason (x4)", "source"],
    notes: "Pair with a market card asset. Use 5-10 hashtags in first comment, not caption.",
  },
  {
    id: "s-4",
    name: "TikTok 20-Second Script",
    channel: "tiktok",
    template: `[HOOK]
Most people guess about this. Let's price it.

[MARKET]
Will [event] happen by [date]?

[YES CASE]
Two reasons yes: [reason], [reason]

[NO CASE]
Two reasons no: [reason], [reason]

[CLOSE]
We resolve it with [source]. Join the waitlist to get beta credits.`,
    variables: ["event", "date", "reason (x4)", "source"],
    notes: "Hook must be under 3 seconds. Film talking head or text overlay. Always end with CTA.",
  },
  {
    id: "s-5",
    name: '"Suggest a Market" X Thread',
    channel: "x",
    template: `We're building ForecastHer in public.

Drop a question you want turned into a market.
Women's health, femtech, women's sports, culture, consumer trends.

Best ideas get published this week and you'll get credited.

Join the waitlist: [UTM link]`,
    variables: ["UTM link"],
    notes: "Post every Tuesday and Friday. Pin the best reply. Turn top 3 suggestions into market cards within 24h.",
  },
  {
    id: "s-6",
    name: "DM to Femtech Founder",
    channel: "dm",
    template: `Hey [Name], quick one.
We're building ForecastHer — prediction markets around women's health and femtech.
We're pre-launch with play money credits and strict resolution rules.
What's one question in this space you wish the world would forecast?
If you send one, I'll turn it into a market preview and credit you.`,
    variables: ["Name"],
    notes: "Keep under 5 sentences. Don't ask for shares. Ask for input. People respond to requests for expertise.",
  },
  {
    id: "s-7",
    name: "DM to Creator",
    channel: "dm",
    template: `Hey [Name], I run ForecastHer.
We turn women's trends into forecast markets with clear resolution rules.
I think your audience would love this question:
Will [market] happen by [date]?
Want me to send you a clean market card you can post, and we'll credit you as the source?`,
    variables: ["Name", "market", "date"],
    notes: "Offer the card asset upfront. Makes it easy for them to say yes. Follow up once after 3 days.",
  },
  {
    id: "s-8",
    name: "Reddit Value Post",
    channel: "reddit",
    template: `Title: Forecast question: Will [event] happen by [date]?

Body:
I'm testing a forecasting format and want smart input.
Here's the question: [market]
Here's how it resolves: [source and criteria]
Two reasons yes: [reasons]
Two reasons no: [reasons]
What am I missing?`,
    variables: ["event", "date", "market", "source and criteria", "reasons (x4)"],
    notes: "Only add your link in a comment if people engage. Do NOT drop it in the main post unless the subreddit allows it.",
  },
  {
    id: "s-9",
    name: "Weekly Digest Email",
    channel: "email",
    template: `Subject: This week's ForecastHer markets

Top markets this week:
1. [market] — resolves [date]
2. [market] — resolves [date]
3. [market] — resolves [date]

What changed since last week:
1. [signal]
2. [signal]

Community picks:
Top suggestions and who suggested them.

Join the waitlist: [link]
Beta credits only, no cash value.`,
    variables: ["market (x3)", "date (x3)", "signal (x2)", "link"],
    notes: "Keep email under 200 words. Subject line A/B test: use numbers or controversy. Send Monday morning.",
  },
  {
    id: "s-10",
    name: "Pinterest Pin",
    channel: "pinterest",
    template: `[Pin Title]
Will [event] happen by [date]?

The forecast:
• YES because: [reason]
• NO because: [reason]

How this market resolves:
Source: [source]
Criteria: [one sentence]

ForecastHer — prediction markets for women's health.
Pre-launch. Beta credits only, no cash value.
Join the waitlist: [UTM link]`,
    variables: ["event", "date", "reason (x2)", "source", "criteria", "UTM link"],
    notes: "Use a vertical market card image (1000×1500px). Add to a \"ForecastHer Markets\" board. Keyword-rich title helps Pinterest SEO. Add 5-10 relevant hashtags.",
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   LEADS SEED DATA
   ═══════════════════════════════════════════════════════════════════════ */

const SEED_LEADS: Lead[] = [
  { id: "l-1", name: "", type: "founder", channel: "dm", status: "not_contacted", lastContact: null, notes: "Add femtech founder name" },
  { id: "l-2", name: "", type: "creator", channel: "dm", status: "not_contacted", lastContact: null, notes: "Add creator name" },
  { id: "l-3", name: "", type: "podcast", channel: "email", status: "not_contacted", lastContact: null, notes: "Add podcast name" },
  { id: "l-4", name: "", type: "newsletter", channel: "email", status: "not_contacted", lastContact: null, notes: "Add newsletter name" },
  { id: "l-5", name: "", type: "press", channel: "email", status: "not_contacted", lastContact: null, notes: "Add writer name" },
];

/* ═══════════════════════════════════════════════════════════════════════
   DAILY SCORECARD SEED
   ═══════════════════════════════════════════════════════════════════════ */

const SEED_SCORECARDS: DailyScorecard[] = [];

/* ═══════════════════════════════════════════════════════════════════════
   TAB 1: CALENDAR
   ═══════════════════════════════════════════════════════════════════════ */

function CalendarTab() {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const weeks = [
    { num: 1, label: "Week 1: Setup + Volume", days: CALENDAR.filter((d) => d.week === 1) },
    { num: 2, label: "Week 2: Hooks + Community Loop", days: CALENDAR.filter((d) => d.week === 2) },
    { num: 3, label: "Week 3: Social Proof + Referrals", days: CALENDAR.filter((d) => d.week === 3) },
    { num: 4, label: "Week 4: Scale What Worked", days: CALENDAR.filter((d) => d.week === 4) },
    { num: 5, label: "Final 2 Days: Month Close", days: CALENDAR.filter((d) => d.week === 5) },
  ];

  const filtered = selectedWeek ? weeks.filter((w) => w.num === selectedWeek) : weeks;

  return (
    <div className="space-y-4">
      {/* Weekly cadence summary */}
      <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Weekly Cadence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div><span className="font-semibold">Mon:</span> Weekly Digest + MOTD + outreach sprint</div>
            <div><span className="font-semibold">Tue:</span> MOTD + community thread</div>
            <div><span className="font-semibold">Wed:</span> MOTD + partner outreach</div>
            <div><span className="font-semibold">Thu:</span> MOTD + Reddit value post</div>
            <div><span className="font-semibold">Fri:</span> MOTD + week recap thread</div>
            <div><span className="font-semibold">Sat:</span> Light posting + engagement</div>
            <div><span className="font-semibold">Sun:</span> Planning + asset prep</div>
          </div>
        </CardContent>
      </Card>

      {/* Week filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedWeek === null ? "default" : "outline"}
          className={`text-xs ${selectedWeek === null ? "gradient-purple text-white" : ""}`}
          onClick={() => setSelectedWeek(null)}
        >
          All Weeks
        </Button>
        {[1, 2, 3, 4, 5].map((w) => (
          <Button
            key={w}
            size="sm"
            variant={selectedWeek === w ? "default" : "outline"}
            className={`text-xs ${selectedWeek === w ? "gradient-purple text-white" : ""}`}
            onClick={() => setSelectedWeek(w)}
          >
            {w <= 4 ? `Week ${w}` : "Final"}
          </Button>
        ))}
      </div>

      {/* Calendar */}
      {filtered.map((week) => (
        <div key={week.num} className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            {week.label}
          </h3>
          <div className="space-y-1">
            {week.days.map((day) => {
              const isExpanded = expandedDay === day.day;
              return (
                <Card key={day.day} className={isExpanded ? "border-purple-200" : ""}>
                  <button
                    className="w-full flex items-center gap-3 p-3 text-left cursor-pointer"
                    onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                  >
                    <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">{day.day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Day {day.day}</span>
                        <Badge variant="outline" className="text-[10px]">{day.weekday}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {day.tasks.length} tasks &middot; {day.theme}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <CardContent className="pt-0 pb-3 px-3 pl-14">
                      <ol className="space-y-1.5">
                        {day.tasks.map((task, i) => {
                          const link = getTaskLink(task);
                          return (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-xs font-mono text-muted-foreground mt-0.5 w-4 shrink-0">{i + 1}.</span>
                              <span className="flex-1">{task}</span>
                              {link && (
                                <Link href={link.href} className="shrink-0">
                                  <Badge variant="outline" className="text-[10px] gap-1 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/20">
                                    <ExternalLink className="h-2.5 w-2.5" />
                                    {link.label}
                                  </Badge>
                                </Link>
                              )}
                            </li>
                          );
                        })}
                      </ol>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Employee daily checklist reference */}
      <Card className="border-amber-200 bg-amber-50/30 dark:bg-amber-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" /> Daily Checklist (Every Weekday)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span>Market of the Day posted to X, IG, TikTok, LinkedIn</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span>30 comments total across X and LinkedIn</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span>10 DMs total to founders and creators</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span>Log all UTMs and results in Growth Ops</span>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground italic">
            Every Tuesday &amp; Friday: Run market suggestion thread. Turn top 3 replies into market cards within 24h.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Every Sunday: Prep 7 markets, 7 cards, 7 scripts. Submit weekly report.
          </p>
          <Separator />
          <p className="text-xs font-semibold text-red-600">
            Hiring proof standard: If they miss two consecutive weekdays, they are not the person. Consistency is the job.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 2: TASK QUEUE
   ═══════════════════════════════════════════════════════════════════════ */

function TaskQueueTab() {
  const [tasks, setTasks] = useState<GrowthTask[]>(SEED_TASKS);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterDay, setFilterDay] = useState<string>("all");
  const [editingTask, setEditingTask] = useState<string | null>(null);

  // Daily scorecard
  const [scorecards, setScorecards] = useState<DailyScorecard[]>(SEED_SCORECARDS);
  const [scorecardForm, setScorecardForm] = useState<DailyScorecard>({
    date: new Date().toISOString().split("T")[0],
    postsPublished: 0,
    commentsDelivered: 0,
    dmsSent: 0,
    waitlistSignups: 0,
    topPostLink: "",
  });

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterDay !== "all" && t.day !== parseInt(filterDay)) return false;
    return true;
  });

  function updateTaskStatus(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  }

  function updateTaskField(id: string, field: keyof GrowthTask, value: string | number | null) {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));
  }

  function addScorecard() {
    setScorecards((prev) => [scorecardForm, ...prev]);
    setScorecardForm({
      date: new Date().toISOString().split("T")[0],
      postsPublished: 0,
      commentsDelivered: 0,
      dmsSent: 0,
      waitlistSignups: 0,
      topPostLink: "",
    });
  }

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done" || t.status === "posted").length;

  return (
    <div className="space-y-6">
      {/* Progress overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold font-mono">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold font-mono text-green-600">{doneTasks}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold font-mono text-blue-600">{tasks.filter((t) => t.status === "in_progress").length}</div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold font-mono text-red-600">{tasks.filter((t) => t.status === "blocked").length}</div>
            <p className="text-xs text-muted-foreground">Blocked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold font-mono">{totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}%</div>
            <p className="text-xs text-muted-foreground">Progress</p>
            <Progress value={totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as TaskStatus | "all")}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDay} onValueChange={setFilterDay}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Days</SelectItem>
            {Array.from({ length: 30 }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>Day {i + 1}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Day</TableHead>
                <TableHead className="text-xs">Task</TableHead>
                <TableHead className="text-xs">Channel</TableHead>
                <TableHead className="text-xs">Asset</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Impr.</TableHead>
                <TableHead className="text-xs text-right">Clicks</TableHead>
                <TableHead className="text-xs text-right">Signups</TableHead>
                <TableHead className="text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-mono text-xs">{task.day}</TableCell>
                  <TableCell className="text-sm max-w-[240px]">
                    <p className="truncate">{task.name}</p>
                    {task.utmLink && (
                      <p className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">{task.utmLink}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${CHANNEL_COLORS[task.channel]}`}>
                      {CHANNEL_LABELS[task.channel]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.assetNeeded ? (
                      <Badge variant="outline" className="text-[10px]">Yes</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status}
                      onValueChange={(v) => updateTaskStatus(task.id, v as TaskStatus)}
                    >
                      <SelectTrigger className="h-7 text-[10px] w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    {editingTask === task.id ? (
                      <Input
                        type="number"
                        className="h-6 w-16 text-xs"
                        value={task.impressions ?? ""}
                        onChange={(e) => updateTaskField(task.id, "impressions", e.target.value ? parseInt(e.target.value) : null)}
                      />
                    ) : (
                      <span className="font-mono text-xs">{task.impressions ?? "—"}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingTask === task.id ? (
                      <Input
                        type="number"
                        className="h-6 w-16 text-xs"
                        value={task.clicks ?? ""}
                        onChange={(e) => updateTaskField(task.id, "clicks", e.target.value ? parseInt(e.target.value) : null)}
                      />
                    ) : (
                      <span className="font-mono text-xs">{task.clicks ?? "—"}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {editingTask === task.id ? (
                      <Input
                        type="number"
                        className="h-6 w-16 text-xs"
                        value={task.signups ?? ""}
                        onChange={(e) => updateTaskField(task.id, "signups", e.target.value ? parseInt(e.target.value) : null)}
                      />
                    ) : (
                      <span className="font-mono text-xs">{task.signups ?? "—"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Daily Scorecard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" /> Daily Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                className="h-8 text-xs"
                value={scorecardForm.date}
                onChange={(e) => setScorecardForm({ ...scorecardForm, date: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Posts</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={scorecardForm.postsPublished}
                onChange={(e) => setScorecardForm({ ...scorecardForm, postsPublished: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Comments</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={scorecardForm.commentsDelivered}
                onChange={(e) => setScorecardForm({ ...scorecardForm, commentsDelivered: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">DMs</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={scorecardForm.dmsSent}
                onChange={(e) => setScorecardForm({ ...scorecardForm, dmsSent: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Signups</Label>
              <Input
                type="number"
                className="h-8 text-xs"
                value={scorecardForm.waitlistSignups}
                onChange={(e) => setScorecardForm({ ...scorecardForm, waitlistSignups: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">&nbsp;</Label>
              <Button size="sm" className="gradient-purple text-white text-xs w-full h-8" onClick={addScorecard}>
                <Plus className="h-3 w-3 mr-1" /> Log
              </Button>
            </div>
          </div>

          {scorecards.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs text-right">Posts</TableHead>
                  <TableHead className="text-xs text-right">Comments</TableHead>
                  <TableHead className="text-xs text-right">DMs</TableHead>
                  <TableHead className="text-xs text-right">Signups</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scorecards.map((sc, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{sc.date}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{sc.postsPublished}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{sc.commentsDelivered}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{sc.dmsSent}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{sc.waitlistSignups}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {scorecards.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No scorecards logged yet. Fill in today&apos;s numbers above and click Log.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 3: SCRIPT LIBRARY
   ═══════════════════════════════════════════════════════════════════════ */

interface ApprovedDraft {
  id: string;
  scriptName: string;
  channel: Channel | "multi";
  text: string;
  approvedAt: string;
}

interface AIDraftState {
  scriptId: string;
  status: "context" | "generating" | "review" | "error";
  draft: string;
  editedDraft: string;
  error: string | null;
  model: string | null;
  context: {
    marketQuestion: string;
    resolveDate: string;
    source: string;
    category: string;
    recipientName: string;
  };
}

function ScriptLibraryTab() {
  const [expandedScript, setExpandedScript] = useState<string | null>("s-1");
  const [copied, setCopied] = useState<string | null>(null);
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [aiDraft, setAiDraft] = useState<AIDraftState | null>(null);
  const [approvedDrafts, setApprovedDrafts] = useState<ApprovedDraft[]>([]);
  const [showApproved, setShowApproved] = useState(false);

  function handleCopy(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function startAIDraft(script: Script) {
    setAiDraft({
      scriptId: script.id,
      status: "context",
      draft: "",
      editedDraft: "",
      error: null,
      model: null,
      context: {
        marketQuestion: "",
        resolveDate: "",
        source: "",
        category: "Women's Health",
        recipientName: "",
      },
    });
  }

  function cancelAIDraft() {
    setAiDraft(null);
  }

  async function generateDraft(script: Script) {
    if (!aiDraft) return;
    setAiDraft({ ...aiDraft, status: "generating", error: null });

    try {
      const res = await fetch("/api/admin/growth-ops/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: script.template,
          scriptName: script.name,
          channel: script.channel,
          context: aiDraft.context,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setAiDraft({
          ...aiDraft,
          status: "error",
          error: data.error || "Generation failed. Try again.",
        });
        return;
      }

      setAiDraft({
        ...aiDraft,
        status: "review",
        draft: data.draft,
        editedDraft: data.draft,
        model: data.model || null,
        error: null,
      });
    } catch (err) {
      setAiDraft({
        ...aiDraft,
        status: "error",
        error: err instanceof Error ? err.message : "Network error. Try again.",
      });
    }
  }

  function approveDraft(script: Script) {
    if (!aiDraft) return;
    const approved: ApprovedDraft = {
      id: `ad-${Date.now()}`,
      scriptName: script.name,
      channel: script.channel,
      text: aiDraft.editedDraft,
      approvedAt: new Date().toISOString(),
    };
    setApprovedDrafts((prev) => [approved, ...prev]);
    handleCopy(`approved-${approved.id}`, aiDraft.editedDraft);
    setAiDraft(null);
  }

  const filtered = filterChannel === "all"
    ? SCRIPTS
    : SCRIPTS.filter((s) => s.channel === filterChannel);

  const hasDMs = (scriptId: string) => scriptId === "s-6" || scriptId === "s-7";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {SCRIPTS.length} reusable templates. Click to expand, use AI Draft to auto-fill, then approve or edit.
        </p>
        <div className="flex gap-2">
          {approvedDrafts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1"
              onClick={() => setShowApproved(!showApproved)}
            >
              <ThumbsUp className="h-3 w-3" />
              Approved ({approvedDrafts.length})
            </Button>
          )}
          <Select value={filterChannel} onValueChange={setFilterChannel}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="x">X</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="ig">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="pinterest">Pinterest</SelectItem>
              <SelectItem value="reddit">Reddit</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="dm">DM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Approved drafts drawer */}
      {showApproved && approvedDrafts.length > 0 && (
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" /> Approved Drafts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvedDrafts.map((draft) => (
              <div key={draft.id} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] ${CHANNEL_COLORS[draft.channel]}`}>
                      {CHANNEL_LABELS[draft.channel]}
                    </Badge>
                    <span className="text-xs font-medium">{draft.scriptName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(draft.approvedAt).toLocaleDateString()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] gap-1"
                      onClick={() => handleCopy(draft.id, draft.text)}
                    >
                      {copied === draft.id ? (
                        <><CheckCircle className="h-2.5 w-2.5 text-green-600" /> Copied</>
                      ) : (
                        <><Copy className="h-2.5 w-2.5" /> Copy</>
                      )}
                    </Button>
                  </div>
                </div>
                <pre className="text-xs whitespace-pre-wrap bg-muted/30 rounded p-2 font-mono max-h-32 overflow-y-auto">
                  {draft.text}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {filtered.map((script) => {
        const isExpanded = expandedScript === script.id;
        const isAIDrafting = aiDraft?.scriptId === script.id;

        return (
          <Card key={script.id} className={isExpanded ? "border-purple-200" : ""}>
            <button
              className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
              onClick={() => {
                setExpandedScript(isExpanded ? null : script.id);
                if (isAIDrafting && isExpanded) setAiDraft(null);
              }}
            >
              <Badge className={`text-[10px] shrink-0 ${CHANNEL_COLORS[script.channel]}`}>
                {CHANNEL_LABELS[script.channel]}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{script.name}</p>
                <p className="text-xs text-muted-foreground">
                  Variables: {script.variables.join(", ")}
                </p>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </button>
            {isExpanded && (
              <CardContent className="pt-0 pb-4 space-y-3">
                {/* Template display */}
                <div className="relative">
                  <pre className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-4 border border-border font-mono leading-relaxed">
                    {script.template}
                  </pre>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1 h-7"
                      onClick={() => handleCopy(script.id, script.template)}
                    >
                      {copied === script.id ? (
                        <><CheckCircle className="h-3 w-3 text-green-600" /> Copied</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copy</>
                      )}
                    </Button>
                  </div>
                </div>

                {script.notes && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-3">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{script.notes}</p>
                  </div>
                )}

                {/* AI Draft Button — shows when not drafting */}
                {!isAIDrafting && (
                  <Button
                    className="gradient-purple text-white text-xs gap-1.5"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); startAIDraft(script); }}
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    AI Draft — Fill Variables Automatically
                  </Button>
                )}

                {/* AI Draft Flow */}
                {isAIDrafting && aiDraft && (
                  <div className="rounded-lg border-2 border-purple-200 bg-purple-50/30 dark:bg-purple-950/10 p-4 space-y-4">
                    {/* Step 1: Context */}
                    {(aiDraft.status === "context" || aiDraft.status === "error") && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wand2 className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                              AI Draft — Provide Context
                            </span>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelAIDraft}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1 md:col-span-2">
                            <Label className="text-xs">Market Question *</Label>
                            <Textarea
                              className="text-xs h-16"
                              placeholder="Will a new non-hormonal menopause treatment receive full FDA approval in 2026?"
                              value={aiDraft.context.marketQuestion}
                              onChange={(e) => setAiDraft({
                                ...aiDraft,
                                context: { ...aiDraft.context, marketQuestion: e.target.value },
                              })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Resolve Date</Label>
                            <Input
                              type="date"
                              className="h-8 text-xs"
                              value={aiDraft.context.resolveDate}
                              onChange={(e) => setAiDraft({
                                ...aiDraft,
                                context: { ...aiDraft.context, resolveDate: e.target.value },
                              })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Category</Label>
                            <Select
                              value={aiDraft.context.category}
                              onValueChange={(v) => setAiDraft({
                                ...aiDraft,
                                context: { ...aiDraft.context, category: v },
                              })}
                            >
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Women's Health">Women&apos;s Health</SelectItem>
                                <SelectItem value="Fertility">Fertility</SelectItem>
                                <SelectItem value="FemTech">FemTech</SelectItem>
                                <SelectItem value="Wellness">Wellness</SelectItem>
                                <SelectItem value="Culture">Culture</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Resolution Source / Criteria</Label>
                            <Input
                              className="h-8 text-xs"
                              placeholder="FDA press release or official approval letter"
                              value={aiDraft.context.source}
                              onChange={(e) => setAiDraft({
                                ...aiDraft,
                                context: { ...aiDraft.context, source: e.target.value },
                              })}
                            />
                          </div>
                          {hasDMs(script.id) && (
                            <div className="space-y-1">
                              <Label className="text-xs">Recipient Name</Label>
                              <Input
                                className="h-8 text-xs"
                                placeholder="Name or handle"
                                value={aiDraft.context.recipientName}
                                onChange={(e) => setAiDraft({
                                  ...aiDraft,
                                  context: { ...aiDraft.context, recipientName: e.target.value },
                                })}
                              />
                            </div>
                          )}
                        </div>

                        {aiDraft.error && (
                          <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 p-3">
                            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700 dark:text-red-400">{aiDraft.error}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            className="gradient-purple text-white text-xs gap-1.5"
                            size="sm"
                            disabled={!aiDraft.context.marketQuestion.trim()}
                            onClick={() => generateDraft(script)}
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Generate Draft
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs" onClick={cancelAIDraft}>
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Step 2: Generating */}
                    {aiDraft.status === "generating" && (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                        <div className="text-center">
                          <p className="text-sm font-medium">Generating draft...</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            AI is filling in the template variables with real content.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Review */}
                    {aiDraft.status === "review" && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-semibold text-purple-900 dark:text-purple-300">
                              AI Draft — Review &amp; Approve
                            </span>
                          </div>
                          {aiDraft.model && (
                            <Badge variant="outline" className="text-[10px]">
                              {aiDraft.model}
                            </Badge>
                          )}
                        </div>

                        <Textarea
                          className="font-mono text-sm leading-relaxed min-h-[200px]"
                          value={aiDraft.editedDraft}
                          onChange={(e) => setAiDraft({ ...aiDraft, editedDraft: e.target.value })}
                        />

                        {aiDraft.editedDraft !== aiDraft.draft && (
                          <p className="text-[10px] text-amber-600 flex items-center gap-1">
                            <Pencil className="h-3 w-3" /> You&apos;ve made edits to the AI draft.
                          </p>
                        )}

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            className="text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => approveDraft(script)}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            Approve &amp; Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1.5"
                            onClick={() => generateDraft(script)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Regenerate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs gap-1.5"
                            onClick={() => setAiDraft({ ...aiDraft, status: "context" })}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Change Context
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1.5 text-red-600 hover:text-red-700"
                            onClick={cancelAIDraft}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            Discard
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 4: LEADS & OUTREACH
   ═══════════════════════════════════════════════════════════════════════ */

function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterLeadStatus, setFilterLeadStatus] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: "",
    type: "founder",
    channel: "dm",
    status: "not_contacted",
    notes: "",
  });

  const filtered = leads.filter((l) => {
    if (filterType !== "all" && l.type !== filterType) return false;
    if (filterLeadStatus !== "all" && l.status !== filterLeadStatus) return false;
    return true;
  });

  function addLead() {
    if (!newLead.name?.trim()) return;
    const lead: Lead = {
      id: `l-${Date.now()}`,
      name: newLead.name || "",
      type: (newLead.type as Lead["type"]) || "founder",
      channel: (newLead.channel as Channel) || "dm",
      status: "not_contacted",
      lastContact: null,
      notes: newLead.notes || "",
    };
    setLeads((prev) => [...prev, lead]);
    setNewLead({ name: "", type: "founder", channel: "dm", status: "not_contacted", notes: "" });
    setShowAdd(false);
  }

  function updateLeadStatus(id: string, status: Lead["status"]) {
    setLeads((prev) => prev.map((l) =>
      l.id === id ? { ...l, status, lastContact: new Date().toISOString().split("T")[0] } : l
    ));
  }

  const TYPE_LABELS: Record<Lead["type"], string> = {
    founder: "Founder",
    creator: "Creator",
    podcast: "Podcast",
    newsletter: "Newsletter",
    press: "Press",
  };

  const LEAD_STATUS_LABELS: Record<Lead["status"], string> = {
    not_contacted: "Not Contacted",
    contacted: "Contacted",
    replied: "Replied",
    converted: "Converted",
    declined: "Declined",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterLeadStatus} onValueChange={setFilterLeadStatus}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(LEAD_STATUS_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" className="gradient-purple text-white text-xs" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="h-3 w-3 mr-1" /> Add Lead
        </Button>
      </div>

      {showAdd && (
        <Card className="border-purple-200">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  className="h-8 text-xs"
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="Name or handle"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={newLead.type} onValueChange={(v) => setNewLead({ ...newLead, type: v as Lead["type"] })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Channel</Label>
                <Select value={newLead.channel} onValueChange={(v) => setNewLead({ ...newLead, channel: v as Channel })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dm">DM</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="x">X</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="pinterest">Pinterest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Input
                  className="h-8 text-xs"
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Context..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="text-xs" onClick={addLead}>Save</Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads pipeline summary */}
      <div className="grid grid-cols-5 gap-2">
        {(Object.entries(LEAD_STATUS_LABELS) as [Lead["status"], string][]).map(([status, label]) => {
          const count = leads.filter((l) => l.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="pt-3 pb-3 text-center">
                <div className="text-lg font-bold font-mono">{count}</div>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Channel</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Last Contact</TableHead>
              <TableHead className="text-xs">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium text-sm">{lead.name || <span className="text-muted-foreground italic">Not set</span>}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">{TYPE_LABELS[lead.type]}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${CHANNEL_COLORS[lead.channel]}`}>
                    {CHANNEL_LABELS[lead.channel]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    value={lead.status}
                    onValueChange={(v) => updateLeadStatus(lead.id, v as Lead["status"])}
                  >
                    <SelectTrigger className="h-7 text-[10px] w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(LEAD_STATUS_LABELS).map(([val, label]) => (
                        <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="font-mono text-xs">{lead.lastContact ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{lead.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Outreach targets */}
      <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Weekly Outreach Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-2xl font-bold font-mono">15</span>
              <p className="text-xs text-muted-foreground">Femtech founders</p>
            </div>
            <div>
              <span className="text-2xl font-bold font-mono">10</span>
              <p className="text-xs text-muted-foreground">Creators</p>
            </div>
            <div>
              <span className="text-2xl font-bold font-mono">20</span>
              <p className="text-xs text-muted-foreground">Podcast / newsletter pitches</p>
            </div>
            <div>
              <span className="text-2xl font-bold font-mono">20</span>
              <p className="text-xs text-muted-foreground">Press pitches (Week 4)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 5: REPORTING
   ═══════════════════════════════════════════════════════════════════════ */

function ReportingTab() {
  const [selectedWeek, setSelectedWeek] = useState(1);

  // Sample weekly data
  const weeklyData: Record<number, {
    signups: number;
    posts: number;
    comments: number;
    dms: number;
    topChannel: string;
    topPost: string;
    conversionRate: string;
    notes: string;
  }> = {
    1: { signups: 0, posts: 0, comments: 0, dms: 0, topChannel: "—", topPost: "—", conversionRate: "—", notes: "Week 1 not started. Complete setup and begin execution." },
    2: { signups: 0, posts: 0, comments: 0, dms: 0, topChannel: "—", topPost: "—", conversionRate: "—", notes: "Week 2 not started." },
    3: { signups: 0, posts: 0, comments: 0, dms: 0, topChannel: "—", topPost: "—", conversionRate: "—", notes: "Week 3 not started." },
    4: { signups: 0, posts: 0, comments: 0, dms: 0, topChannel: "—", topPost: "—", conversionRate: "—", notes: "Week 4 not started." },
  };

  const data = weeklyData[selectedWeek] ?? weeklyData[1];

  return (
    <div className="space-y-6">
      {/* Week selector */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((w) => (
          <Button
            key={w}
            size="sm"
            variant={selectedWeek === w ? "default" : "outline"}
            className={`text-xs ${selectedWeek === w ? "gradient-purple text-white" : ""}`}
            onClick={() => setSelectedWeek(w)}
          >
            Week {w}
          </Button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <UserPlus className="h-5 w-5 mx-auto text-purple-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{data.signups}</div>
            <p className="text-xs text-muted-foreground">Waitlist Signups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <FileText className="h-5 w-5 mx-auto text-blue-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{data.posts}</div>
            <p className="text-xs text-muted-foreground">Posts Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <MessageSquare className="h-5 w-5 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{data.comments}</div>
            <p className="text-xs text-muted-foreground">Comments Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Send className="h-5 w-5 mx-auto text-orange-600 mb-1" />
            <div className="text-2xl font-bold font-mono">{data.dms}</div>
            <p className="text-xs text-muted-foreground">DMs Sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Channel Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Top channel</span>
              <span className="font-semibold">{data.topChannel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Conversion rate</span>
              <span className="font-mono font-semibold">{data.conversionRate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Top post</span>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{data.topPost}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{data.notes}</p>
          </CardContent>
        </Card>
      </div>

      {/* UTM rule reference */}
      <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">UTM Convention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">Every post uses a unique UTM. No exceptions.</p>
          <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
            <div>utm_source = <span className="text-purple-600">platform</span></div>
            <div>utm_medium = <span className="text-purple-600">social | email</span></div>
            <div>utm_campaign = <span className="text-purple-600">wk1 | wk2 | wk3 | wk4</span></div>
            <div>utm_content = <span className="text-purple-600">motd_x_01 | suggest_thread_01 | digest_01</span></div>
          </div>
          <p className="text-xs text-muted-foreground">
            Example: <code className="bg-muted px-1 rounded">utm_source=x&amp;utm_medium=social&amp;utm_campaign=wk1&amp;utm_content=motd_x_01</code>
          </p>
        </CardContent>
      </Card>

      {/* Monthly targets */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">30-Day Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold font-mono">500</div>
              <p className="text-xs text-muted-foreground">Waitlist signups</p>
              <Progress value={0} className="h-1.5 mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono">120</div>
              <p className="text-xs text-muted-foreground">Posts published</p>
              <Progress value={0} className="h-1.5 mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono">600</div>
              <p className="text-xs text-muted-foreground">Comments delivered</p>
              <Progress value={0} className="h-1.5 mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold font-mono">200</div>
              <p className="text-xs text-muted-foreground">DMs sent</p>
              <Progress value={0} className="h-1.5 mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════════════ */

const VALID_TABS = ["calendar", "tasks", "scripts", "leads", "reporting"];

export default function GrowthOpsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const activeTab = VALID_TABS.includes(tabParam ?? "") ? tabParam! : "calendar";

  function setActiveTab(tab: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Growth Ops</h1>
        <p className="text-sm text-muted-foreground">
          30-day execution calendar, task queue, scripts, outreach, and reporting. Designed to produce signups, not content.
        </p>
      </div>

      <HowItWorks
        steps={[
          "Calendar: View the full 30-day execution plan organized by week. Expand any day to see all tasks. The daily checklist at the bottom is the non-negotiable baseline.",
          "Task Queue: Track every task with status, channel, UTM, and results. Log daily scorecards (posts, comments, DMs, signups) at the bottom.",
          "Script Library: 9 reusable templates for every channel. Click to expand, copy the template, fill in variables. Notes have tactical tips for each format.",
          "Leads & Outreach: Track founder, creator, podcast, newsletter, and press contacts. Update status as you contact them. Weekly targets are at the bottom.",
          "Reporting: Weekly and monthly metrics. UTM convention reference. 30-day targets with progress bars that update as you log scorecards.",
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="tasks">Task Queue</TabsTrigger>
          <TabsTrigger value="scripts">Script Library</TabsTrigger>
          <TabsTrigger value="leads">Leads &amp; Outreach</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-4"><CalendarTab /></TabsContent>
        <TabsContent value="tasks" className="mt-4"><TaskQueueTab /></TabsContent>
        <TabsContent value="scripts" className="mt-4"><ScriptLibraryTab /></TabsContent>
        <TabsContent value="leads" className="mt-4"><LeadsTab /></TabsContent>
        <TabsContent value="reporting" className="mt-4"><ReportingTab /></TabsContent>
      </Tabs>
    </div>
  );
}
