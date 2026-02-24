export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  balance: number;
  is_admin: boolean;
  created_at: string;
}

export interface Market {
  id: string;
  title: string;
  description: string | null;
  category: string;
  resolution_criteria: string;
  resolution_source: string | null;
  closes_at: string;
  resolves_at: string;
  resolution: number | null; // null=open, 1=yes, 0=no
  resolved_at: string | null;
  created_by: string | null;
  liquidity_param: number;
  yes_shares: number;
  no_shares: number;
  volume: number;
  status: "open" | "closed" | "resolved" | "cancelled";
  featured: boolean;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  market_id: string;
  side: "yes" | "no";
  action: "buy" | "sell";
  shares: number;
  cost: number;
  price: number;
  created_at: string;
}

export interface Position {
  id: string;
  user_id: string;
  market_id: string;
  yes_shares: number;
  no_shares: number;
  avg_yes_price: number | null;
  avg_no_price: number | null;
  realized_pnl: number;
}

export interface Comment {
  id: string;
  market_id: string;
  user_id: string;
  body: string;
  created_at: string;
  // joined
  profiles?: Pick<Profile, "username" | "avatar_url">;
}

export interface Category {
  slug: string;
  name: string;
  emoji: string;
  color: string;
  sort_order: number;
}

export type MarketWithCategory = Market & {
  categories?: Category;
};

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_profit: number;
  total_trades: number;
  win_rate: number;
}
