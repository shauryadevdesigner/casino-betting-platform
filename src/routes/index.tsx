import { createFileRoute, Link } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { GameCard, StatCard } from "@/components/GameCard";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { Users, TrendingUp, Trophy, ShieldCheck, Zap, Lock, Headphones, Crown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import hero from "@/assets/hero-casino.jpg";
import gCrash from "@/assets/game-crash.jpg";
import gRoulette from "@/assets/game-roulette.jpg";
import gDice from "@/assets/game-dice.jpg";
import gMines from "@/assets/game-mines.jpg";
import gTowers from "@/assets/game-towers.jpg";
import gSlots from "@/assets/game-slots.jpg";
import gKeno from "@/assets/game-keno.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FastLuck — Next Generation Lucky Gaming" },
      { name: "description", content: "Play crash, roulette, dice, mines, towers, slots and keno. Provably fair, instant payouts, secure platform." },
    ],
  }),
  component: Dashboard,
});

const games = [
  { to: "/games/crash", name: "CRASH", image: gCrash, players: 2457, accent: "oklch(0.72 0.28 340)" },
  { to: "/games/roulette", name: "ROULETTE", image: gRoulette, players: 1876, accent: "oklch(0.7 0.25 25)" },
  { to: "/games/dice", name: "DICE", image: gDice, players: 3124, accent: "oklch(0.7 0.22 260)" },
  { to: "/games/coinflip", name: "COIN FLIP", image: gDice, players: 1890, accent: "oklch(0.82 0.17 85)" },
  { to: "/games/mines", name: "MINES", image: gMines, players: 2113, accent: "oklch(0.75 0.2 150)" },
  { to: "/games/towers", name: "TOWERS", image: gTowers, players: 1653, accent: "oklch(0.82 0.18 200)" },
  { to: "/games/slots", name: "SLOTS", image: gSlots, players: 4892, accent: "oklch(0.82 0.17 85)" },
  { to: "/games/keno", name: "KENO", image: gKeno, players: 2038, accent: "oklch(0.75 0.2 150)" },
];

const liveWinsSeed = [
  { name: "BladeRunner", amount: 12450, game: "Dice" },
  { name: "CryptoQueen", amount: 8920, game: "Roulette" },
  { name: "HighRoller99", amount: 25000, game: "Slots" },
  { name: "LuckyStar", amount: 3210, game: "Crash" },
  { name: "WinWizard", amount: 6666, game: "Keno" },
];

function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState<{ displayName: string; value: number }[]>([]);
  const [countdown, setCountdown] = useState(12 * 60 + 47);
  const [jackpot, setJackpot] = useState(5824650.23);

  useEffect(() => {
    api.leaderboard("balance").then((r) => {
      setLeaderboard(
        r.leaderboard.slice(0, 3).map((e) => ({ displayName: e.displayName, value: e.value })),
      );
    });
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 15 * 60));
      setJackpot((j) => j + Math.random() * 50);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");

  return (
    <CasinoLayout>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6 min-w-0">
          {/* Hero */}
          <section className="relative rounded-3xl overflow-hidden border border-border">
            <img src={hero} alt="FastLuck casino hero" width={1600} height={700} className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
            <div className="relative p-6 md:p-10 grid md:grid-cols-2 gap-6 items-center min-h-[360px]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neon-pink">Welcome to</p>
                <h1 className="mt-2 text-5xl md:text-7xl font-display font-black neon-text">FastLuck</h1>
                <p className="mt-3 text-muted-foreground max-w-md">The next generation of lucky gaming. Fast. Fair. Fun.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/games/crash" className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-semibold text-white shadow-[var(--shadow-neon)] animate-pulse-glow">Play Now</Link>
                  <a href="#featured" className="px-6 py-3 rounded-xl bg-muted/60 border border-border font-semibold">Explore Games</a>
                </div>
                <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><ShieldCheck className="size-3.5 text-success" />Provably Fair</span>
                  <span className="flex items-center gap-1"><Zap className="size-3.5 text-neon-gold" />Instant Payouts</span>
                  <span className="flex items-center gap-1"><Lock className="size-3.5 text-neon-cyan" />Secured & Encrypted</span>
                </div>
              </div>
              <div className="glass rounded-2xl p-5 text-center">
                <p className="text-xs uppercase tracking-widest text-neon-gold">★ Mega Jackpot</p>
                <p className="mt-2 font-display text-3xl md:text-5xl font-black text-neon-gold drop-shadow-[0_0_18px_oklch(0.82_0.17_85)]">
                  ${jackpot.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="mt-3 font-display text-2xl">{mm}:{ss}</p>
                <p className="text-xs text-muted-foreground">Until next jackpot drop</p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard icon={Users} label="Active Players" value="125,847" accent="oklch(0.72 0.28 340)" />
            <StatCard icon={TrendingUp} label="Live Wins" value="$1,274,389" accent="oklch(0.75 0.2 150)" />
            <StatCard icon={Trophy} label="Tournaments Paid" value="$8,562,100" accent="oklch(0.82 0.17 85)" />
          </div>

          {/* Featured games */}
          <section id="featured">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-bold">★ Featured Games</h2>
              <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">View All Games <ChevronRight className="size-3" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
              {games.map((g) => <GameCard key={g.to} {...g} />)}
            </div>
          </section>

          {/* Bottom widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="glass rounded-2xl p-4">
              <p className="font-bold mb-3">◎ Daily Quests</p>
              {[{ q: "Place 3 Bets", p: 3, t: 3, r: 50 }, { q: "Win 2 Games", p: 1, t: 2, r: 75 }, { q: "Play 5 Games", p: 2, t: 5, r: 100 }].map((q) => (
                <div key={q.q} className="mb-3">
                  <div className="flex justify-between text-xs"><span>{q.q}</span><span className="text-neon-gold">+{q.r}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neon-pink to-neon-purple" style={{ width: `${(q.p / q.t) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="font-bold mb-3">🏆 Leaderboard Highlights</p>
              {(leaderboard.length ? leaderboard : [{ displayName: "—", value: 0 }]).map((p, i) => (
                <div key={p.displayName + i} className="flex items-center justify-between py-1.5 text-sm">
                  <span className="flex items-center gap-2"><span className="size-5 rounded-md bg-muted grid place-items-center text-xs font-bold">{i + 1}</span>{p.displayName}</span>
                  <span className="text-neon-gold font-bold">${p.value.toLocaleString()}</span>
                </div>
              ))}
              {isAuthenticated && user && (
                <div className="mt-2 pt-2 border-t border-border flex justify-between text-sm">
                  <span>You — @{user.username}</span>
                  <span className="text-neon-gold font-bold">${user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
            <div className="glass rounded-2xl p-4 relative overflow-hidden">
              <p className="font-bold mb-2">🏆 Tournament Spotlight</p>
              <p className="text-xs text-muted-foreground">2d 14h 36m</p>
              <p className="mt-3 font-display text-lg">Weekly Championship</p>
              <p className="mt-1 text-xs text-muted-foreground">Prize Pool</p>
              <p className="font-display text-2xl text-neon-gold">$250,000</p>
              <Link to="/tournaments" className="mt-3 inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-sm">View Tournament</Link>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="font-bold flex items-center gap-2 mb-3"><Crown className="size-4 text-neon-gold" />VIP Club</p>
              {[{ l: "Cashback", v: "12%" }, { l: "Weekly Bonus", v: "$125.00" }, { l: "Rakeback", v: "15%" }].map((r) => (
                <div key={r.l} className="flex justify-between text-sm py-1.5">
                  <span className="text-muted-foreground">{r.l}</span>
                  <span className="text-neon-gold font-bold">{r.v}</span>
                </div>
              ))}
              <Link to="/vip" className="mt-2 block text-center py-2 rounded-lg bg-gradient-to-r from-neon-gold to-warning text-background font-semibold text-sm">Go to VIP Club</Link>
            </div>
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border">
            {[
              { i: Zap, t: "Instant Deposits", s: "Crypto & Fiat" },
              { i: ShieldCheck, t: "Provably Fair", s: "100% Transparent" },
              { i: Headphones, t: "24/7 Support", s: "We're here for you" },
              { i: Lock, t: "Secure Platform", s: "Bank-level Security" },
            ].map((b) => (
              <div key={b.t} className="flex items-center gap-3 py-3">
                <b.i className="size-5 text-neon-pink" />
                <div>
                  <p className="text-sm font-semibold">{b.t}</p>
                  <p className="text-[11px] text-muted-foreground">{b.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live wins side panel */}
        <aside className="space-y-3">
          <div className="glass rounded-2xl p-4">
            <p className="font-bold mb-3 flex items-center gap-2"><span className="size-2 rounded-full bg-destructive animate-pulse" />Live Wins</p>
            {liveWinsSeed.map((w) => (
              <div key={w.name} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="size-9 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink grid place-items-center text-xs font-bold">{w.name.slice(0, 2)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{w.name}</p>
                  <p className="text-xs text-success">Won ${w.amount.toLocaleString()}.00</p>
                  <p className="text-[10px] text-muted-foreground">on {w.game}</p>
                </div>
              </div>
            ))}
            <button className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground">View All Activity</button>
          </div>
          {isAuthenticated && (
            <div className="glass rounded-2xl p-4">
              <p className="font-bold mb-3">Your Balance</p>
              <p className="text-2xl font-display neon-text">${user?.balance.toFixed(2)}</p>
              <Link to="/wallet" className="mt-2 block text-xs text-muted-foreground hover:text-foreground">
                View wallet →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </CasinoLayout>
  );
}
