import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
};

interface LeaderboardRow {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_profit: number;
  total_trades: number;
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{rank}</span>;
}

export default async function LeaderboardPage() {
  let leaderboard: LeaderboardRow[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_leaderboard", { p_limit: 50 });
    if (data && data.length > 0) {
      leaderboard = data;
    }
  } catch {
    // No data yet
  }

  // If there are real users with trades, show the real leaderboard
  if (leaderboard.length > 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-serif text-3xl font-bold">
            Leaderboard
          </h1>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            Play-money beta
          </span>
        </div>
        <p className="text-muted-foreground mb-1">
          Top forecasters ranked by play-money profit.
        </p>
        <p className="text-xs text-muted-foreground/70 mb-8">
          All profits are in free play-money beta beta credits. Rankings carry over when real-money trading launches.
        </p>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {leaderboard.slice(0, 3).map((entry, i) => {
            const rank = i + 1;
            const colors = [
              "from-yellow-100 to-yellow-50 border-yellow-200",
              "from-gray-100 to-gray-50 border-gray-200",
              "from-amber-100 to-amber-50 border-amber-200",
            ];
            return (
              <Card key={entry.user_id} className={`bg-gradient-to-b ${colors[i]} text-center`}>
                <CardContent className="pt-6 pb-4">
                  <div className="flex justify-center mb-2">
                    {getRankIcon(rank)}
                  </div>
                  <Avatar className="mx-auto mb-2 h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-semibold truncate">{entry.username}</p>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    +{entry.total_profit.toFixed(0)} beta credits
                  </p>
                  <p className="text-xs text-muted-foreground">{entry.total_trades} trades</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Full Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>All Forecasters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {leaderboard.map((entry, i) => {
                const rank = i + 1;
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      rank <= 3 ? "bg-muted/50" : "hover:bg-muted/50"
                    } transition-colors`}
                  >
                    <div className="w-8 flex justify-center">
                      {getRankIcon(rank)}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                        {entry.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{entry.username}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        +{entry.total_profit.toFixed(0)} beta credits
                      </p>
                      <p className="text-xs text-muted-foreground">{entry.total_trades} trades</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pre-launch: no real users yet — show Season Zero state
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-serif text-3xl font-bold">
          Leaderboard
        </h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Top forecasters, ranked by accuracy and profit.
      </p>

      <Card className="mb-8">
        <CardContent className="py-16 text-center">
          <div className="text-5xl mb-4">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto" />
          </div>
          <h2 className="font-serif text-2xl font-semibold mb-3">
            Season Zero starts soon
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            The leaderboard is empty because we haven&apos;t launched yet.
            Join the waitlist to be one of the first forecasters ranked when beta opens.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/signup">
              <Button className="gradient-purple text-white">
                Join the Waitlist
              </Button>
            </Link>
            <Link href="/markets">
              <Button variant="outline">
                Preview Markets
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 pb-5 text-center">
            <p className="text-sm font-semibold text-foreground mb-1">Founding Members</p>
            <p className="text-xs text-muted-foreground">Get a permanent badge + priority ranking</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 pb-5 text-center">
            <p className="text-sm font-semibold text-foreground mb-1">Play-Money Beta</p>
            <p className="text-xs text-muted-foreground">Build your track record risk-free</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 pb-5 text-center">
            <p className="text-sm font-semibold text-foreground mb-1">Rankings Carry Over</p>
            <p className="text-xs text-muted-foreground">Your beta record follows you to real money</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
