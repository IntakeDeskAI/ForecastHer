"use client";

import { Fragment, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  MousePointerClick,
  UserPlus,
  Link2,
  ImageIcon,
  Hash,
  Trophy,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Loader2,
  Lightbulb,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { HowItWorks } from "@/components/how-it-works";

/* ─── Sample data ─── */

const SIGNUP_DATA_7D = [
  { day: "Mon", signups: 12 },
  { day: "Tue", signups: 19 },
  { day: "Wed", signups: 14 },
  { day: "Thu", signups: 31 },
  { day: "Fri", signups: 27 },
  { day: "Sat", signups: 18 },
  { day: "Sun", signups: 22 },
];

const SIGNUP_DATA_14D = [
  { day: "Feb 14", signups: 8 },
  { day: "Feb 15", signups: 11 },
  { day: "Feb 16", signups: 5 },
  { day: "Feb 17", signups: 15 },
  { day: "Feb 18", signups: 22 },
  { day: "Feb 19", signups: 17 },
  { day: "Feb 20", signups: 9 },
  { day: "Feb 21", signups: 12 },
  { day: "Feb 22", signups: 19 },
  { day: "Feb 23", signups: 14 },
  { day: "Feb 24", signups: 31 },
  { day: "Feb 25", signups: 27 },
  { day: "Feb 26", signups: 18 },
  { day: "Feb 27", signups: 22 },
];

const SIGNUP_DATA_30D = [
  { day: "Jan 28", signups: 3 },
  { day: "Jan 30", signups: 7 },
  { day: "Feb 1", signups: 5 },
  { day: "Feb 3", signups: 10 },
  { day: "Feb 5", signups: 14 },
  { day: "Feb 7", signups: 8 },
  { day: "Feb 9", signups: 12 },
  { day: "Feb 11", signups: 6 },
  { day: "Feb 13", signups: 9 },
  { day: "Feb 15", signups: 11 },
  { day: "Feb 17", signups: 15 },
  { day: "Feb 19", signups: 17 },
  { day: "Feb 21", signups: 12 },
  { day: "Feb 23", signups: 14 },
  { day: "Feb 25", signups: 27 },
  { day: "Feb 27", signups: 22 },
];

const SIGNUP_MAP: Record<string, typeof SIGNUP_DATA_7D> = {
  "7d": SIGNUP_DATA_7D,
  "14d": SIGNUP_DATA_14D,
  "30d": SIGNUP_DATA_30D,
};

const KPI_MAP: Record<string, { signups: number; ctr: string; topPost: string }> = {
  "7d": { signups: 143, ctr: "3.2%", topPost: "Will GLP-1 drugs get FDA..." },
  "14d": { signups: 228, ctr: "2.8%", topPost: "Fertility tracking accuracy..." },
  "30d": { signups: 391, ctr: "3.0%", topPost: "Will GLP-1 drugs get FDA..." },
};

const UTM_DATA = [
  { source: "twitter", medium: "social", campaign: "launch_week", signups: 64, ctr: "4.1%", trend: "up" },
  { source: "instagram", medium: "social", campaign: "fertility_series", signups: 41, ctr: "3.8%", trend: "up" },
  { source: "threads", medium: "social", campaign: "daily_market", signups: 22, ctr: "2.4%", trend: "down" },
  { source: "newsletter", medium: "email", campaign: "weekly_digest", signups: 38, ctr: "6.2%", trend: "up" },
  { source: "linkedin", medium: "social", campaign: "thought_leadership", signups: 15, ctr: "1.9%", trend: "down" },
  { source: "tiktok", medium: "social", campaign: "explainer_clips", signups: 29, ctr: "2.7%", trend: "up" },
  { source: "google", medium: "organic", campaign: "(none)", signups: 12, ctr: "1.2%", trend: "up" },
];

const FORMAT_DATA = [
  { format: "Thread (3-5 posts)", posts: 18, avgCTR: 4.1, avgEngagement: 312 },
  { format: "Single Image Post", posts: 24, avgCTR: 2.8, avgEngagement: 187 },
  { format: "Story Card", posts: 12, avgCTR: 3.5, avgEngagement: 245 },
  { format: "Video / Reel", posts: 6, avgCTR: 5.2, avgEngagement: 489 },
  { format: "Text-only Post", posts: 15, avgCTR: 1.9, avgEngagement: 98 },
];

const TEMPLATE_DATA = [
  { template: "Market Card (Purple)", uses: 22, avgCTR: 3.8, winner: true },
  { template: "Stat Highlight", uses: 14, avgCTR: 4.2, winner: true },
  { template: "Quote Card", uses: 10, avgCTR: 2.1, winner: false },
  { template: "Countdown Timer", uses: 8, avgCTR: 3.3, winner: false },
  { template: "Resolution Reveal", uses: 6, avgCTR: 5.1, winner: true },
];

const TOPIC_DATA = [
  { category: "Fertility & IVF", posts: 14, signups: 52, avgCTR: "4.3%", topPost: "Will at-home fertility tests reach 90% accuracy by 2027?" },
  { category: "GLP-1 & Weight Loss", posts: 11, signups: 41, avgCTR: "3.9%", topPost: "Will GLP-1 drugs get FDA approval for teens by Dec 2026?" },
  { category: "Menstrual Health", posts: 9, signups: 28, avgCTR: "3.1%", topPost: "Will menstrual leave become law in any US state by 2027?" },
  { category: "Mental Health", posts: 8, signups: 19, avgCTR: "2.5%", topPost: "Will perimenopause screening be standard by 2028?" },
  { category: "Pregnancy & Postpartum", posts: 7, signups: 23, avgCTR: "3.4%", topPost: "Will maternal mortality drop 20% by 2028?" },
  { category: "Longevity & Aging", posts: 5, signups: 11, avgCTR: "2.2%", topPost: "Will menopause HRT guidelines change by end of 2026?" },
];

const TOP_HOOKS = [
  { rank: 1, hook: "Hot take: GLP-1 drugs will be approved for teens within 18 months. Here's why the data backs it up →", ctr: "6.8%", impressions: "12.4K", engagements: 843 },
  { rank: 2, hook: "The fertility industry doesn't want you to know this number. At-home tests are now 87% accurate.", ctr: "6.1%", impressions: "9.8K", engagements: 598 },
  { rank: 3, hook: "I asked 500 women what they'd bet on in women's health. The #1 answer surprised me.", ctr: "5.7%", impressions: "11.2K", engagements: 639 },
  { rank: 4, hook: "Menstrual leave just became law in Spain. Is the US next? The odds say...", ctr: "5.4%", impressions: "8.1K", engagements: 437 },
  { rank: 5, hook: "Your cycle tracker knows more about you than your doctor. Here's the prediction market on that.", ctr: "5.1%", impressions: "7.6K", engagements: 388 },
  { rank: 6, hook: "Resolution alert: We called it. Maternal mortality IS dropping. Here's the proof →", ctr: "4.9%", impressions: "6.2K", engagements: 304 },
  { rank: 7, hook: "What if you could bet (play money) on whether menopause treatment will change? Now you can.", ctr: "4.7%", impressions: "5.8K", engagements: 273 },
  { rank: 8, hook: "The FDA just dropped a bombshell about women's health trials. Our market saw it coming.", ctr: "4.5%", impressions: "8.4K", engagements: 378 },
];

const BOTTOM_HOOKS = [
  { rank: 1, hook: "New market alert! Check it out.", ctr: "0.4%", impressions: "3.2K", engagements: 13 },
  { rank: 2, hook: "We just launched a new prediction market.", ctr: "0.6%", impressions: "2.8K", engagements: 17 },
  { rank: 3, hook: "Health update: here's what's happening.", ctr: "0.7%", impressions: "4.1K", engagements: 29 },
  { rank: 4, hook: "Interesting article about women's health outcomes this week.", ctr: "0.8%", impressions: "2.4K", engagements: 19 },
  { rank: 5, hook: "Link in bio for more details on our latest market.", ctr: "0.9%", impressions: "1.9K", engagements: 17 },
];

/* ─── Components ─── */

function Overview({ range }: { range: string }) {
  const data = SIGNUP_MAP[range] ?? SIGNUP_DATA_7D;
  const kpi = KPI_MAP[range] ?? KPI_MAP["7d"];
  const rangeLabel = range === "7d" ? "Last 7 days" : range === "14d" ? "Last 14 days" : "Last 30 days";

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserPlus className="h-4 w-4" /> Waitlist Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{kpi.signups}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +12% vs prior period &middot; {rangeLabel}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" /> Avg CTR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{kpi.ctr}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              Above industry avg (2.1%) &middot; {rangeLabel}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Top Post
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">{kpi.topPost}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Eye className="h-3 w-3" /> 12.4K impressions &middot; 6.8% CTR
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Eye className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Total Impressions</span>
            </div>
            <div className="text-lg font-bold font-mono">84.2K</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Heart className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Total Likes</span>
            </div>
            <div className="text-lg font-bold font-mono">3,847</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Total Comments</span>
            </div>
            <div className="text-lg font-bold font-mono">612</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Share2 className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Total Shares</span>
            </div>
            <div className="text-lg font-bold font-mono">1,204</div>
          </CardContent>
        </Card>
      </div>

      {/* Signup chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Waitlist Signups by Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="signups"
                  stroke="hsl(271, 91%, 65%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(271, 91%, 65%)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Platform breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Signups by Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { platform: "Twitter", signups: 64 },
                  { platform: "Instagram", signups: 41 },
                  { platform: "Newsletter", signups: 38 },
                  { platform: "TikTok", signups: 29 },
                  { platform: "Threads", signups: 22 },
                  { platform: "LinkedIn", signups: 15 },
                  { platform: "Organic", signups: 12 },
                ]}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="signups" radius={[4, 4, 0, 0]}>
                  {[
                    "hsl(271, 91%, 65%)",
                    "hsl(271, 91%, 60%)",
                    "hsl(271, 91%, 55%)",
                    "hsl(271, 91%, 50%)",
                    "hsl(271, 91%, 45%)",
                    "hsl(271, 91%, 40%)",
                    "hsl(271, 91%, 35%)",
                  ].map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground italic">
        Sample data shown for demonstration. Live data will replace these once connected to platform APIs.
      </p>
    </div>
  );
}

function Attribution() {
  const [sortBy, setSortBy] = useState<"signups" | "ctr">("signups");
  const sorted = [...UTM_DATA].sort((a, b) =>
    sortBy === "signups" ? b.signups - a.signups : parseFloat(b.ctr) - parseFloat(a.ctr)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">UTM breakdown and post-to-signup conversion.</p>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "signups" ? "default" : "outline"}
            size="sm"
            className={sortBy === "signups" ? "gradient-purple text-white text-xs" : "text-xs"}
            onClick={() => setSortBy("signups")}
          >
            Sort by Signups
          </Button>
          <Button
            variant={sortBy === "ctr" ? "default" : "outline"}
            size="sm"
            className={sortBy === "ctr" ? "gradient-purple text-white text-xs" : "text-xs"}
            onClick={() => setSortBy("ctr")}
          >
            Sort by CTR
          </Button>
        </div>
      </div>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Source</TableHead>
              <TableHead className="text-xs">Medium</TableHead>
              <TableHead className="text-xs">Campaign</TableHead>
              <TableHead className="text-xs text-right">Signups</TableHead>
              <TableHead className="text-xs text-right">CTR</TableHead>
              <TableHead className="text-xs text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.source + row.campaign}>
                <TableCell className="font-medium text-sm">{row.source}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {row.medium}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">{row.campaign}</TableCell>
                <TableCell className="text-right font-mono text-sm">{row.signups}</TableCell>
                <TableCell className="text-right font-mono text-sm">{row.ctr}</TableCell>
                <TableCell className="text-right">
                  {row.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500 inline" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400 inline" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Conversion funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Conversion Funnel (All Sources)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { stage: "Impressions", value: "84,200", pct: "100%" },
              { stage: "Link Clicks", value: "2,694", pct: "3.2%" },
              { stage: "Landing Page Views", value: "2,156", pct: "80% of clicks" },
              { stage: "Waitlist Signups", value: "391", pct: "18.1% of views" },
            ].map((step, i) => (
              <div key={step.stage} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{step.stage}</span>
                    <span className="text-sm font-mono">{step.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-all"
                      style={{ width: i === 0 ? "100%" : i === 1 ? "32%" : i === 2 ? "26%" : "5%" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{step.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground italic">
        Sample data shown for demonstration.
      </p>
    </div>
  );
}

function CreativePerformance() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Format and asset template performance comparison.</p>

      {/* Format performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Performance by Format</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Format</TableHead>
                <TableHead className="text-xs text-right">Posts</TableHead>
                <TableHead className="text-xs text-right">Avg CTR</TableHead>
                <TableHead className="text-xs text-right">Avg Engagement</TableHead>
                <TableHead className="text-xs text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FORMAT_DATA.map((row) => (
                <TableRow key={row.format}>
                  <TableCell className="font-medium text-sm">{row.format}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.posts}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.avgCTR}%</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.avgEngagement}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={row.avgCTR >= 4 ? "default" : row.avgCTR >= 3 ? "secondary" : "outline"}
                      className={`text-xs ${row.avgCTR >= 4 ? "bg-green-600" : ""}`}
                    >
                      {row.avgCTR >= 4 ? "Top" : row.avgCTR >= 3 ? "Good" : "Low"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Format chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">CTR by Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={FORMAT_DATA}
                layout="vertical"
                margin={{ top: 5, right: 20, bottom: 5, left: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 12 }} unit="%" />
                <YAxis dataKey="format" type="category" tick={{ fontSize: 11 }} width={95} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value}%`, "Avg CTR"]}
                />
                <Bar dataKey="avgCTR" radius={[0, 4, 4, 0]}>
                  {FORMAT_DATA.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.avgCTR >= 4 ? "hsl(142, 71%, 45%)" : entry.avgCTR >= 3 ? "hsl(271, 91%, 65%)" : "hsl(var(--muted-foreground))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Template performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Performance by Asset Template</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Template</TableHead>
                <TableHead className="text-xs text-right">Uses</TableHead>
                <TableHead className="text-xs text-right">Avg CTR</TableHead>
                <TableHead className="text-xs text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TEMPLATE_DATA.map((row) => (
                <TableRow key={row.template}>
                  <TableCell className="font-medium text-sm flex items-center gap-2">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {row.template}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.uses}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.avgCTR}%</TableCell>
                  <TableCell className="text-right">
                    {row.winner ? (
                      <Badge className="text-xs bg-green-600">Winner</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Test more</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
        <CardContent className="py-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">AI Insight</p>
            <p className="text-xs text-muted-foreground mt-1">
              Video/Reel format has the highest CTR (5.2%) but lowest volume (6 posts). Consider increasing video content production.
              &quot;Resolution Reveal&quot; template outperforms others at 5.1% CTR — use it for all market resolution posts.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground italic">
        Sample data shown for demonstration.
      </p>
    </div>
  );
}

function TopicPerformance() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Category and resolution post performance.</p>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs text-right">Posts</TableHead>
              <TableHead className="text-xs text-right">Signups</TableHead>
              <TableHead className="text-xs text-right">Avg CTR</TableHead>
              <TableHead className="text-xs">Top Post</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TOPIC_DATA.map((row) => (
              <TableRow key={row.category}>
                <TableCell className="font-medium text-sm">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-purple-500" />
                    {row.category}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">{row.posts}</TableCell>
                <TableCell className="text-right font-mono text-sm">{row.signups}</TableCell>
                <TableCell className="text-right font-mono text-sm">{row.avgCTR}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[260px] truncate">
                  {row.topPost}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Topic chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Signups by Topic</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={TOPIC_DATA}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="signups" fill="hsl(271, 91%, 65%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
        <CardContent className="py-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">AI Insight</p>
            <p className="text-xs text-muted-foreground mt-1">
              &quot;Fertility &amp; IVF&quot; and &quot;GLP-1 &amp; Weight Loss&quot; are your highest-converting categories, driving 24% of all signups.
              Consider doubling content output in these verticals. &quot;Longevity &amp; Aging&quot; underperforms — test different hooks before scaling.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground italic">
        Sample data shown for demonstration.
      </p>
    </div>
  );
}

function HookLeaderboard() {
  const [showSuggestion, setShowSuggestion] = useState<number | null>(null);

  const suggestions: Record<number, string> = {
    1: "Try leading with a specific stat instead of 'New market alert'. Example: '73% of women don't know this about fertility tests. We built a market around it →'",
    2: "Add a hook or question. Instead of announcing the launch, create curiosity: 'What happens when you let the crowd predict FDA timelines? We just found out →'",
    3: "Be specific. 'Health update' is too vague. Name the topic: 'Menopause HRT guidelines are changing. Here's what the prediction market says →'",
    4: "Remove 'interesting' — show don't tell. Lead with the most surprising finding from the article.",
    5: "Never use 'link in bio' as the hook. Front-load the value: share the key takeaway, then direct to the link.",
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Top and bottom performing hooks with AI improvement suggestions.
      </p>

      {/* Top hooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowUp className="h-4 w-4 text-green-500" /> Top Performing Hooks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-10">#</TableHead>
                <TableHead className="text-xs">Hook</TableHead>
                <TableHead className="text-xs text-right">CTR</TableHead>
                <TableHead className="text-xs text-right">Impressions</TableHead>
                <TableHead className="text-xs text-right">Engagements</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_HOOKS.map((row) => (
                <TableRow key={row.rank}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{row.rank}</TableCell>
                  <TableCell className="text-sm max-w-[400px]">
                    <p className="line-clamp-2">{row.hook}</p>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-green-600 font-medium">
                    {row.ctr}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.impressions}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{row.engagements}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bottom hooks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ArrowDown className="h-4 w-4 text-red-400" /> Bottom Performing Hooks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-10">#</TableHead>
                <TableHead className="text-xs">Hook</TableHead>
                <TableHead className="text-xs text-right">CTR</TableHead>
                <TableHead className="text-xs text-right">Impressions</TableHead>
                <TableHead className="text-xs text-right">Engagements</TableHead>
                <TableHead className="text-xs text-right">Fix</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BOTTOM_HOOKS.map((row) => (
                <Fragment key={row.rank}>
                  <TableRow>
                    <TableCell className="font-mono text-xs text-muted-foreground">{row.rank}</TableCell>
                    <TableCell className="text-sm max-w-[400px]">
                      <p className="line-clamp-2">{row.hook}</p>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-red-500 font-medium">
                      {row.ctr}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.impressions}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{row.engagements}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() =>
                          setShowSuggestion(showSuggestion === row.rank ? null : row.rank)
                        }
                      >
                        <Lightbulb className="h-3.5 w-3.5 mr-1 text-yellow-500" />
                        {showSuggestion === row.rank ? "Hide" : "Improve"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {showSuggestion === row.rank && suggestions[row.rank] && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-yellow-50 dark:bg-yellow-950/20 border-l-2 border-yellow-400">
                        <div className="flex items-start gap-2 py-1">
                          <Sparkles className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">{suggestions[row.rank]}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
        <CardContent className="py-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">AI Insight</p>
            <p className="text-xs text-muted-foreground mt-1">
              Top hooks share common patterns: specific numbers, controversy (&quot;hot take&quot;), and curiosity gaps (&quot;surprised me&quot;).
              Bottom hooks are generic announcements. Always lead with the most surprising fact or a bold claim, not a feature update.
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground italic">
        Sample data shown for demonstration.
      </p>
    </div>
  );
}

function GA4LiveTab() {
  const GA4_PROPERTY = "G-DL4ZFV877E";
  const GA4_BASE = "https://analytics.google.com/analytics/web";

  const reports = [
    { label: "Realtime", desc: "Active users right now", url: `${GA4_BASE}/#/p/${GA4_PROPERTY}/realtime/overview` },
    { label: "Acquisition Overview", desc: "Where visitors come from", url: `${GA4_BASE}/#/p/${GA4_PROPERTY}/reports/acquisition-overview` },
    { label: "Traffic Acquisition", desc: "Source / medium / campaign breakdown", url: `${GA4_BASE}/#/p/${GA4_PROPERTY}/reports/acquisition-traffic-acquisition-v2` },
    { label: "Pages & Screens", desc: "Top pages by views", url: `${GA4_BASE}/#/p/${GA4_PROPERTY}/reports/content-pages-and-screens` },
    { label: "Events", desc: "All tracked events (signups, CTA clicks, etc.)", url: `${GA4_BASE}/#/p/${GA4_PROPERTY}/reports/events-in-events` },
    { label: "Conversions", desc: "Key events marked as conversions", url: `${GA4_BASE}/#/p/${GA4_PROPERTY}/reports/conversions` },
  ];

  const trackedEvents = [
    { name: "waitlist_cta_click", desc: "User clicks any \"Join Waitlist\" button", locations: "Navbar, homepage social strip, advisor CTA" },
    { name: "waitlist_signup", desc: "Waitlist form submitted successfully", locations: "Hero form, footer form" },
    { name: "market_view", desc: "Market detail page loaded", locations: "/markets/[id]" },
    { name: "how_it_works_view", desc: "How It Works page loaded", locations: "/how-it-works" },
    { name: "outbound_click", desc: "External link clicked", locations: "Footer, growth ops quick links" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer">
            <Card className="hover:border-purple-300 transition-colors cursor-pointer h-full">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{r.label}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {/* Tracked Events Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" /> Tracked Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Event Name</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Fires On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trackedEvents.map((evt) => (
                <TableRow key={evt.name}>
                  <TableCell className="font-mono text-xs text-purple-600">{evt.name}</TableCell>
                  <TableCell className="text-xs">{evt.desc}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{evt.locations}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* UTM Attribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Link2 className="h-4 w-4" /> UTM Attribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            UTMs are automatically captured from incoming URLs and stored in a <code className="text-xs bg-muted px-1 py-0.5 rounded">fh_utm</code> cookie (7-day expiry).
            On waitlist signup, UTM values are sent as GA4 event parameters for attribution.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium mb-1">Recommended UTM format</p>
              <div className="text-xs text-muted-foreground font-mono space-y-0.5">
                <p>utm_source: x, instagram, linkedin, email</p>
                <p>utm_medium: social, dm, email</p>
                <p>utm_campaign: wk1, wk2, evergreen</p>
                <p>utm_content: motd_x_day01, recap_thread</p>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium mb-1">Example link</p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                forecasther.ai/?utm_source=x&amp;utm_medium=social&amp;utm_campaign=wk1&amp;utm_content=motd_day01
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key metrics definition */}
      <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
        <CardContent className="py-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">CTR Definition</p>
            <p className="text-xs text-muted-foreground mt-1">
              CTR = <code className="bg-muted px-1 rounded">waitlist_signups / waitlist_cta_clicks</code>.
              This is the conversion rate from CTA click to actual signup.
              Do not confuse with impressions-to-clicks (you don&apos;t have reliable impression data without platform APIs).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState("7d");
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track performance across platforms, content formats, and topics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <div className="flex rounded-md border border-border overflow-hidden">
            {(["7d", "14d", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  range === r
                    ? "bg-purple-600 text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {r === "7d" ? "7 days" : r === "14d" ? "14 days" : "30 days"}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* GA4 Status */}
      <div className="rounded-lg border-2 border-green-300 bg-green-50 dark:bg-green-950/20 p-4 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800 dark:text-green-400">GA4 Connected</p>
          <p className="text-xs text-green-700 dark:text-green-500 mt-0.5">
            Google Analytics 4 is tracking pageviews, waitlist CTA clicks, waitlist signups, market views, and UTM attribution on the public site.
            Use the &quot;GA4 Live&quot; tab to open your real-time dashboard.
          </p>
        </div>
        <a
          href="https://analytics.google.com/analytics/web/#/p/G-DL4ZFV877E"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <ExternalLink className="h-3 w-3" /> Open GA4
          </Button>
        </a>
      </div>

      {/* Demo data note for sample tabs */}
      <div className="rounded-lg border border-amber-300 bg-amber-50/50 dark:bg-amber-950/10 px-4 py-2 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-amber-500 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Overview/Attribution/Creative/Topic tabs show sample data for layout demo. The <strong>GA4 Live</strong> tab links to real analytics.
        </p>
      </div>

      <HowItWorks
        steps={[
          "Overview: Check waitlist signups, click-through rates, and top posts at a glance. Charts populate once posts go live.",
          "Attribution: See UTM breakdown showing which posts and platforms drive the most signups.",
          "Creative: Compare performance across content formats (thread vs. single post) and asset templates (square vs. story card).",
          "Topic: See which market categories and resolution posts perform best to guide future content.",
          "Hook Leaderboard: Review the top and bottom performing hooks. Click \"Improve\" on underperforming hooks for AI rewrite suggestions.",
        ]}
      />

      <Tabs defaultValue="ga4-live">
        <TabsList>
          <TabsTrigger value="ga4-live" className="gap-1"><Activity className="h-3.5 w-3.5" /> GA4 Live</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="creative">Creative</TabsTrigger>
          <TabsTrigger value="topic">Topic</TabsTrigger>
          <TabsTrigger value="hooks">Hook Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="ga4-live" className="mt-4"><GA4LiveTab /></TabsContent>
        <TabsContent value="overview" className="mt-4"><Overview range={range} /></TabsContent>
        <TabsContent value="attribution" className="mt-4"><Attribution /></TabsContent>
        <TabsContent value="creative" className="mt-4"><CreativePerformance /></TabsContent>
        <TabsContent value="topic" className="mt-4"><TopicPerformance /></TabsContent>
        <TabsContent value="hooks" className="mt-4"><HookLeaderboard /></TabsContent>
      </Tabs>
    </div>
  );
}
