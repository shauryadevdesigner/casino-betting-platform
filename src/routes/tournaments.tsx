import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Trophy, Clock, Medal, Users, ArrowRight, Sparkles, Sword, Play } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/tournaments")({
  head: () => ({
    meta: [
      { title: "Tournaments — FastLuck" },
      { name: "description", content: "Compete in daily, weekly, and monthly tournaments for massive cash prizes on FastLuck. Track live rankings and register now." }
    ]
  }),
  component: TournamentsPage,
});

type LeaderboardEntry = {
  rank: number;
  score: number;
  user: {
    _id: string;
    username: string;
    displayName: string;
    vipTier?: string;
  };
  prize: number;
};

type TournamentData = {
  _id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  prizePool: number;
  status: string;
};

function TournamentsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTournament, setActiveTournament] = useState<TournamentData | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const fetchTournamentData = async () => {
    try {
      const res = await api.tournamentActive();
      if (res.success && res.tournament) {
        setActiveTournament(res.tournament);
        setLeaderboard(res.leaderboard);
        setMyRank(res.myRank);
        setRegistered(res.myRank !== null);
      }
    } catch (e) {
      console.error("Failed to fetch tournament", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    fetchTournamentData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!activeTournament) return;

    const updateTimer = () => {
      const diff = new Date(activeTournament.endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeRemaining("Ended");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeTournament]);

  const join = async () => {
    if (!activeTournament) return;
    setRegistering(true);
    try {
      const res = await api.joinTournament(activeTournament._id);
      if (res.success) {
        toast.success("Successfully registered for the tournament! Wager on games to earn points!");
        setRegistered(true);
        fetchTournamentData();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to join tournament");
    } finally {
      setRegistering(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-3xl p-8 mt-12 border border-border">
          <Trophy className="size-14 mx-auto text-neon-gold drop-shadow-[0_0_12px_oklch(0.82_0.17_85)] mb-4" />
          <h2 className="font-display text-2xl font-black mb-2">Competitive Hub</h2>
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            Register and compete against top players on the leaderboard to earn massive shares of prize pools.
          </p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold hover:opacity-95 shadow-[var(--shadow-neon)] transition-all"
          >
            Sign In to Participate
          </button>
        </div>
      </CasinoLayout>
    );
  }

  return (
    <CasinoLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Page Title & Intro */}
        <div className="rounded-3xl glass p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-border/60">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-neon-gold to-warning grid place-items-center shadow-[var(--shadow-neon)]">
              <Trophy className="size-8 text-background" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black">Championship Hub</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Wager on any game to rank up and claim your share of the prize pool.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="glass px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-border">
              <Users className="size-4 text-neon-cyan" />
              1,248 Registered
            </span>
          </div>
        </div>

        {loading ? (
          <div className="glass rounded-3xl p-16 text-center">
            <Clock className="size-8 mx-auto text-muted-foreground animate-spin mb-3" />
            <p className="text-muted-foreground text-sm font-semibold">Loading tournament data...</p>
          </div>
        ) : activeTournament ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
            {/* Left Side: Tournament Info & Standings */}
            <div className="space-y-6">
              {/* Active Tournament Details */}
              <div className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-neon-purple/20 via-card/50 to-background p-6 md:p-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/10 blur-3xl pointer-events-none rounded-full" />
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-success/10 text-success border border-success/20 tracking-wider">
                    ACTIVE NOW
                  </span>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground font-semibold">
                    <Clock className="size-4 text-neon-pink" />
                    Ends in: <span className="text-foreground font-bold font-display">{timeRemaining}</span>
                  </div>
                </div>

                <h2 className="font-display text-2xl md:text-3xl font-black uppercase text-neon-gold drop-shadow-md">
                  {activeTournament.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                  {activeTournament.description}
                </p>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-border/40 pt-6">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Prize Pool</p>
                    <p className="text-2xl font-display font-black text-neon-gold">
                      ${activeTournament.prizePool.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Scoring Metric</p>
                    <p className="text-sm font-bold mt-1 text-foreground flex items-center gap-1">
                      <Sword className="size-4 text-neon-pink" /> $1 Wagered = 1 Point
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-center md:justify-end">
                    {registered ? (
                      <span className="px-5 py-2.5 rounded-xl bg-success/15 border border-success/30 text-success text-xs font-bold flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-success animate-ping" /> Registered
                      </span>
                    ) : (
                      <button
                        onClick={join}
                        disabled={registering}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold text-xs uppercase tracking-wider text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                        {registering ? "Joining..." : "Register Entry"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Tournament Leaderboard Standings */}
              <div className="glass rounded-3xl p-6 border border-border/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Medal className="size-5 text-neon-gold" />
                    <h3 className="font-display text-lg font-bold tracking-wide">Live Standings</h3>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">Top 50 Ranks</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-xs text-muted-foreground uppercase font-bold">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Player</th>
                        <th className="py-3 px-4 text-right">Points (Wagered)</th>
                        <th className="py-3 px-4 text-right">Est. Prize</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 text-sm">
                      {leaderboard.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground font-semibold">
                            No entries registered yet. Be the first to join!
                          </td>
                        </tr>
                      ) : (
                        leaderboard.map((entry) => {
                          const isMe = entry.user?._id === activeTournament._id; // Replace with user check if available
                          return (
                            <tr
                              key={entry.user?._id || entry.rank}
                              className={`hover:bg-card/30 transition-all ${
                                isMe ? "bg-neon-purple/10 font-bold" : ""
                              }`}
                            >
                              <td className="py-3 px-4">
                                <span
                                  className={`size-6 rounded-md grid place-items-center text-xs font-bold ${
                                    entry.rank === 1
                                      ? "bg-neon-gold text-background shadow-[0_0_8px_oklch(0.82_0.17_85/0.4)]"
                                      : entry.rank === 2
                                      ? "bg-slate-300 text-background"
                                      : entry.rank === 3
                                      ? "bg-amber-600 text-background"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {entry.rank}
                                </span>
                              </td>
                              <td className="py-3 px-4 flex items-center gap-2">
                                <span className="font-semibold">{entry.user?.displayName || "Anonymous"}</span>
                                {entry.user?.vipTier && (
                                  <span className="text-[9px] px-1 py-0.5 rounded font-black uppercase tracking-wider bg-neon-gold/10 text-neon-gold border border-neon-gold/20">
                                    {entry.user.vipTier}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-display font-bold text-neon-cyan">
                                {entry.score.toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right font-display font-black text-success">
                                ${entry.prize ? entry.prize.toLocaleString() : "—"}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Side: User Status & Side Panels */}
            <aside className="space-y-6">
              {/* User Standing Progress */}
              <div className="glass rounded-3xl p-5 border border-border/60">
                <h3 className="font-display text-sm font-bold tracking-wider uppercase mb-3 flex items-center gap-1.5">
                  <Sword className="size-4 text-neon-pink" />
                  Your Progress
                </h3>
                {registered ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Current Standing</span>
                      <span className="text-foreground font-bold font-display">
                        {myRank ? `#${myRank}` : "Unranked"}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-muted-foreground">Score</span>
                        <span className="text-neon-cyan font-bold font-display">
                          {leaderboard.find((e) => e.rank === myRank)?.score || 0} pts
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-neon-pink to-neon-purple" style={{ width: "35%" }} />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      Wager on games to climb higher! The next bracket pays out larger prize percentages.
                    </p>
                    <Link
                      to="/"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-gold to-warning text-background font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Play className="size-3.5 fill-background" /> WAGER NOW
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You are not registered in this tournament yet. Join to track your wager progress.
                    </p>
                    <button
                      onClick={join}
                      disabled={registering}
                      className="px-4 py-2 rounded-lg bg-muted hover:bg-card text-xs font-semibold transition-all w-full"
                    >
                      {registering ? "Joining..." : "Join Now"}
                    </button>
                  </div>
                )}
              </div>

              {/* Tournament Rules / Info */}
              <div className="glass rounded-3xl p-5 border border-border/50 space-y-3">
                <h3 className="font-display text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Tournament Rules
                </h3>
                <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed list-disc pl-4">
                  <li>Points accumulate automatically on every bet settled.</li>
                  <li>Ties will be broken by the player who reached the score first.</li>
                  <li>Prizes are credited to user wallets within 24 hours of completion.</li>
                  <li>All platform terms of service and fairness checks apply.</li>
                </ul>
              </div>

              {/* Past Winners Showcase */}
              <div className="glass rounded-3xl p-5 border border-border/50">
                <h3 className="font-display text-sm font-bold tracking-wider mb-3">Championship Winners</h3>
                <div className="space-y-3">
                  {[
                    { u: "HighRoller99", s: 124500, p: 75000, d: "May 29" },
                    { u: "CryptoQueen", s: 89000, p: 35000, d: "May 22" },
                    { u: "BladeRunner", s: 75600, p: 20000, d: "May 15" }
                  ].map((w) => (
                    <div key={w.u} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                      <div>
                        <p className="text-xs font-bold text-foreground">{w.u}</p>
                        <p className="text-[10px] text-muted-foreground">{w.d} • {w.s.toLocaleString()} pts</p>
                      </div>
                      <span className="text-xs font-display font-black text-neon-gold">${w.p.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="glass rounded-3xl p-12 text-center">
            <Trophy className="size-12 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="font-display text-lg font-bold mb-2">No Tournaments Active</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We're prepping the next big challenge! Stand by and watch this space for massive prize pool announcements.
            </p>
          </div>
        )}

        {/* Upcoming Tournaments Section */}
        <section className="space-y-4 pt-6 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-neon-gold" />
            <h2 className="text-xl font-display font-bold tracking-wide">Upcoming Challenges</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-5 border border-border/60 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-2xl rounded-full" />
              <div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 uppercase tracking-wider">
                  Mines & Dice Only
                </span>
                <h3 className="font-display text-lg font-black mt-2">Crash Masters Special</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Fast-paced wagering tournament specifically for Crash, Dice, and Mines. Multipliers multiply your scoring speed!
                </p>
              </div>
              <div className="mt-6 flex justify-between items-end border-t border-border/30 pt-4">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Prize Pool</p>
                  <p className="font-display text-lg font-black text-neon-cyan">$75,000</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Starts In</p>
                  <p className="text-xs font-bold text-foreground font-display">2d 12h 45m</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-border/60 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 blur-2xl rounded-full" />
              <div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-neon-pink/10 text-neon-pink border border-neon-pink/20 uppercase tracking-wider">
                  Slots Tournament
                </span>
                <h3 className="font-display text-lg font-black mt-2">Slots Showdown Blitz</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Earn points on slots spin payouts. The higher the multiplier, the higher your score boost!
                </p>
              </div>
              <div className="mt-6 flex justify-between items-end border-t border-border/30 pt-4">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Prize Pool</p>
                  <p className="font-display text-lg font-black text-neon-pink">$120,000</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Starts In</p>
                  <p className="text-xs font-bold text-foreground font-display">4d 06h 12m</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </CasinoLayout>
  );
}
