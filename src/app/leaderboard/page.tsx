import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
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

// Demo leaderboard data
const demoLeaderboard: LeaderboardRow[] = [
  { user_id: "1", username: "wellness_maven", avatar_url: null, total_profit: 342.50, total_trades: 47 },
  { user_id: "2", username: "femtech_futures", avatar_url: null, total_profit: 289.20, total_trades: 38 },
  { user_id: "3", username: "health_oracle", avatar_url: null, total_profit: 215.80, total_trades: 52 },
  { user_id: "4", username: "cycle_seer", avatar_url: null, total_profit: 187.40, total_trades: 29 },
  { user_id: "5", username: "data_diva", avatar_url: null, total_profit: 156.90, total_trades: 41 },
  { user_id: "6", username: "trend_tracker", avatar_url: null, total_profit: 134.20, total_trades: 33 },
  { user_id: "7", username: "wise_woman", avatar_url: null, total_profit: 98.60, total_trades: 22 },
  { user_id: "8", username: "forecast_queen", avatar_url: null, total_profit: 76.30, total_trades: 18 },
  { user_id: "9", username: "insight_iris", avatar_url: null, total_profit: 54.10, total_trades: 15 },
  { user_id: "10", username: "predict_pro", avatar_url: null, total_profit: 32.80, total_trades: 12 },
];

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{rank}</span>;
}

export default async function LeaderboardPage() {
  let leaderboard: LeaderboardRow[] = demoLeaderboard;

  try {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_leaderboard", { p_limit: 50 });
    if (data && data.length > 0) {
      leaderboard = data;
    }
  } catch {
    // Use demo data
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold mb-2">
        Leaderboard
      </h1>
      <p className="text-muted-foreground mb-8">
        Top forecasters ranked by total profit.
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
                  +${entry.total_profit.toFixed(0)}
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
                      +${entry.total_profit.toFixed(2)}
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
