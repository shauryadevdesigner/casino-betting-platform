import { createFileRoute } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { BarChart3, Crown, Trophy, Flame, Zap, Award, Star, Compass } from "lucide-react";
import { api, type LeaderboardEntry } from "@/lib/api/client";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboards — FastLuck" },
      { name: "description", content: "Check the top players on FastLuck casino. Daily, weekly, and monthly standings for wagering, biggest wins, and top multipliers." }
    ]
  }),
  component: LeaderboardPage,
});

const SORT_OPTIONS = [
  { key: "balance" as const, label: "Total Balance" },
  { key: "biggestWin" as const, label: "Biggest Win" },
  { key: "gamesPlayed" as const, label: "Most Games" },
];

const BIG_MULTIPLIERS = [
  { player: "DiceKing", multiplier: 9900, game: "Dice", payout: 99000, date: "1h ago" },
  { player: "CrashGamer", multiplier: 1450, game: "Crash", payout: 14500, date: "3h ago" },
  { player: "MinesMaster", multiplier: 580, game: "Mines", payout: 5800, date: "6h ago" },
  { player: "SlotsSpins", multiplier: 1200, game: "Slots", payout: 24000, date: "12h ago" },
];

function LeaderboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [sort, setSort] = useState<"balance" | "biggestWin" | "gamesPlayed">("balance");
  const [timePeriod, setTimePeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Call the backend API (we pass sort, the API accepts sort)
    api
      .leaderboard(sort)
      .then((r) => setEntries(r.leaderboard))
      .catch((err) => {
        console.error("Leaderboard fetch failed:", err.message);
        setError(err.message || "Failed to load leaderboard data");
        setEntries([]);
      })
      .finally(() => setLoading(false));
  }, [sort]);

  // Extract top 3 for the podium
  const top1 = entries.find((e) => e.rank === 1);
  const top2 = entries.find((e) => e.rank === 2);
  const top3 = entries.find((e) => e.rank === 3);

  // Extract others (ranks 4+)
  const restOfPlayers = entries.filter((e) => e.rank > 3);

  // Get current user's entry if they are in the list
  const myEntry = entries.find((e) => e.displayName === user?.displayName);

  return (
    <CasinoLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Title Header */}
        <div className="rounded-3xl glass p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-border/60">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-neon-gold to-warning grid place-items-center shadow-[var(--shadow-neon)]">
              <BarChart3 className="size-8 text-background" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black">Hall of Fame</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Track the top-performing players, highest wagerers, and biggest winners.</p>
            </div>
          </div>
          {/* Timeframe selector */}
          <div className="flex gap-1.5 bg-card/60 p-1.5 rounded-xl border border-border">
            {(["daily", "weekly", "monthly"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  timePeriod === period ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* User context card (if logged in) */}
        {isAuthenticated && user && (
          <div className="glass rounded-3xl p-5 border border-border/60 bg-gradient-to-r from-neon-purple/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center font-bold text-sm">
                {user.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-muted-foreground leading-none">Logged In Player</p>
                <p className="font-bold text-sm mt-1">{user.displayName} (VIP: {user.vipTier || "Bronze"})</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-8 text-center md:text-left">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Your Rank</p>
                <p className="font-display text-sm font-black text-neon-gold">
                  {myEntry ? `#${myEntry.rank}` : "Unranked"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Games Played</p>
                <p className="font-display text-sm font-black text-neon-cyan">
                  {user.stats.gamesPlayed}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Wagered Vol</p>
                <p className="font-display text-sm font-black text-success">
                  ${user.stats.totalWagered.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-2 border-b border-border/30 pb-4">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => setSort(o.key)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold tracking-wide transition ${
                sort === o.key ? "bg-gradient-to-r from-neon-gold to-warning text-background shadow-md" : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="glass rounded-3xl p-16 text-center border border-destructive/30">
            <Trophy className="size-8 mx-auto text-destructive mb-3 opacity-60" />
            <p className="text-destructive font-semibold text-sm mb-2">Unable to Load Leaderboard</p>
            <p className="text-muted-foreground text-xs mb-4 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                api
                  .leaderboard(sort)
                  .then((r) => setEntries(r.leaderboard))
                  .catch((err) => setError(err.message))
                  .finally(() => setLoading(false));
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-gold to-warning text-background text-xs font-bold hover:brightness-110 transition"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Zap className="size-8 mx-auto text-muted-foreground animate-spin mb-3" />
            <p className="text-muted-foreground text-sm font-semibold">Calculating rankings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Left Column: Podium & Leaderboard Table */}
            <div className="space-y-6">
              {/* Podium View (Ranks 1, 2, 3) */}
              {entries.length >= 3 && (
                <div className="grid grid-cols-3 gap-3 md:gap-6 items-end pt-8 pb-4">
                  {/* Rank 2 (Left) */}
                  {top2 && (
                    <div className="glass rounded-3xl p-4 md:p-6 text-center border border-border/60 relative flex flex-col justify-end min-h-[220px] scale-95 md:scale-100 transition hover:border-slate-300/30">
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 size-12 rounded-full bg-slate-400 grid place-items-center text-background font-bold text-lg border border-slate-300">
                        2
                      </div>
                      <div className="mt-8">
                        <p className="font-bold text-xs truncate">{top2.displayName}</p>
                        {top2.vipTier && (
                          <span className="text-[9px] px-1 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-300/10 text-slate-300 border border-slate-300/20 inline-block mt-1">
                            {top2.vipTier}
                          </span>
                        )}
                        <p className="font-display font-black text-sm text-slate-300 mt-3">
                          {sort === "gamesPlayed" ? top2.value.toLocaleString() : `$${top2.value.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rank 1 (Center) */}
                  {top1 && (
                    <div className="glass rounded-3xl p-4 md:p-6 text-center border border-neon-gold bg-gradient-to-b from-neon-gold/10 to-transparent relative flex flex-col justify-end min-h-[260px] shadow-[var(--shadow-glow)] transition hover:brightness-110">
                      <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 size-10 text-neon-gold drop-shadow-[0_0_10px_oklch(0.82_0.17_85)] animate-bounce" />
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 size-14 rounded-full bg-neon-gold grid place-items-center text-background font-black text-xl border-2 border-warning">
                        1
                      </div>
                      <div className="mt-12">
                        <p className="font-display font-black text-sm md:text-base truncate">{top1.displayName}</p>
                        {top1.vipTier && (
                          <span className="text-[9px] px-1 py-0.5 rounded font-black uppercase tracking-wider bg-neon-gold/25 text-neon-gold border border-neon-gold/30 inline-block mt-1">
                            {top1.vipTier}
                          </span>
                        )}
                        <p className="font-display font-black text-base md:text-lg text-neon-gold mt-4 drop-shadow-[0_0_8px_oklch(0.82_0.17_85/0.4)]">
                          {sort === "gamesPlayed" ? top1.value.toLocaleString() : `$${top1.value.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Rank 3 (Right) */}
                  {top3 && (
                    <div className="glass rounded-3xl p-4 md:p-6 text-center border border-border/60 relative flex flex-col justify-end min-h-[190px] scale-90 md:scale-95 transition hover:border-amber-600/30">
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 size-11 rounded-full bg-amber-700 grid place-items-center text-background font-bold text-sm border border-amber-600">
                        3
                      </div>
                      <div className="mt-8">
                        <p className="font-bold text-xs truncate">{top3.displayName}</p>
                        {top3.vipTier && (
                          <span className="text-[9px] px-1 py-0.5 rounded font-bold uppercase tracking-wider bg-amber-600/10 text-amber-500 border border-amber-600/20 inline-block mt-1">
                            {top3.vipTier}
                          </span>
                        )}
                        <p className="font-display font-black text-xs md:text-sm text-amber-500 mt-3">
                          {sort === "gamesPlayed" ? top3.value.toLocaleString() : `$${top3.value.toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Standings Table for ranks 4+ */}
              <div className="glass rounded-3xl overflow-hidden border border-border/60">
                <div className="p-4 bg-muted/40 font-display text-xs font-black uppercase tracking-wider border-b border-border/40">
                  Lobby Standing
                </div>
                {restOfPlayers.length === 0 && entries.length <= 3 ? (
                  <p className="p-8 text-center text-muted-foreground text-xs font-semibold">
                    No further players in standings.
                  </p>
                ) : (
                  <div className="divide-y divide-border/20">
                    {(restOfPlayers.length > 0 ? restOfPlayers : entries).map((p) => (
                      <div
                        key={p.username}
                        className="flex items-center gap-4 p-4 hover:bg-card/20 transition-all text-sm"
                      >
                        <span className="size-7 rounded bg-muted grid place-items-center text-xs font-bold text-muted-foreground font-display">
                          {p.rank}
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <span className="font-semibold text-foreground">{p.displayName}</span>
                          {p.vipTier && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-neon-gold/10 text-neon-gold border border-neon-gold/20">
                              {p.vipTier}
                            </span>
                          )}
                        </div>
                        <span className="text-neon-gold font-display font-bold">
                          {sort === "gamesPlayed" ? p.value.toLocaleString() : `$${p.value.toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Multipliers, Badges, and Stats */}
            <aside className="space-y-6">
              {/* Biggest Multipliers Showcase */}
              <div className="glass rounded-3xl p-5 border border-border/60">
                <div className="flex items-center gap-2 mb-4">
                  <Flame className="size-4 text-neon-pink" />
                  <h3 className="font-display text-sm font-bold tracking-wider uppercase">Top Multipliers</h3>
                </div>
                <div className="space-y-3">
                  {BIG_MULTIPLIERS.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-border/40 hover:border-neon-pink/20 hover:bg-card/25 transition">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-foreground">{m.player}</span>
                        <span className="text-muted-foreground text-[10px]">{m.date}</span>
                      </div>
                      <div className="flex justify-between items-end mt-2 pt-2 border-t border-border/20">
                        <div>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground uppercase">
                            {m.game}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-neon-gold font-display font-black block">
                            {m.multiplier}x
                          </span>
                          <span className="text-[10px] text-success font-semibold">
                            +${m.payout.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement Badges Showcase */}
              <div className="glass rounded-3xl p-5 border border-border/50">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="size-4 text-neon-cyan" />
                  <h3 className="font-display text-sm font-bold tracking-wider uppercase">Honor Badges</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  {[
                    { label: "Titan", desc: "Wager $100K", icon: "👑", active: false },
                    { label: "Sharpshooter", desc: "9900x Multiplier", icon: "🎯", active: true },
                    { label: "High Stakes", desc: "10K Games", icon: "💎", active: false },
                    { label: "Elite Club", desc: "VIP Gold+", icon: "🎩", active: user?.vipTier === "gold" || user?.vipTier === "platinum" }
                  ].map((b, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center ${
                        b.active
                          ? "border-neon-cyan/40 bg-neon-cyan/5"
                          : "border-border/40 opacity-50"
                      }`}
                    >
                      <span className="text-2xl mb-1">{b.icon}</span>
                      <p className="text-xs font-bold text-foreground truncate w-full">{b.label}</p>
                      <p className="text-[9px] text-muted-foreground mt-0.5">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </CasinoLayout>
  );
}
