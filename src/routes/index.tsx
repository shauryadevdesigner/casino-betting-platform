import { createFileRoute, Link } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { GameCard } from "@/components/GameCard";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck, Zap, Lock, Headphones, Crown, ChevronRight, Trophy, TrendingUp, Users } from "lucide-react";
import { LiveWinsTicker } from "@/components/LiveWinsTicker";
import { MissionsWidget } from "@/components/MissionsWidget";
import { useState, useEffect } from "react";
import heroBg from "@/assets/hero-bg.png";
import jackpotBanner from "@/assets/jackpot-banner.png";
import crownImg from "@/assets/crown.png";
import trophyModel from "@/assets/tournament-trophy-transparent.png";
import vipGoldCrown from "@/assets/vip-gold-crown-transparent.png";
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
  { to: "/games/crash", name: "CRASH", image: gCrash, players: 2457, accent: "#f43f5e", glowClass: "crash-glow" },
  { to: "/games/roulette", name: "ROULETTE", image: gRoulette, players: 1876, accent: "#eab308", glowClass: "roulette-glow" },
  { to: "/games/dice", name: "DICE", image: gDice, players: 3124, accent: "#a855f7", glowClass: "dice-glow" },
  { to: "/games/mines", name: "MINES", image: gMines, players: 2113, accent: "#3b82f6", glowClass: "mines-glow" },
  { to: "/games/towers", name: "TOWERS", image: gTowers, players: 1653, accent: "#22c55e", glowClass: "towers-glow" },
  { to: "/games/slots", name: "$LOTS", image: gSlots, players: 4892, accent: "#ec4899", glowClass: "slots-glow" },
  { to: "/games/keno", name: "KENO", image: gKeno, players: 2038, accent: "#06b6d4", glowClass: "keno-glow" },
];

function AnimatedCounter({ value, duration = 1500, isCurrency = false }: { value: number; duration?: number; isCurrency?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * ease);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [value, duration]);

  return (
    <span>
      {isCurrency ? "$" : ""}
      {count.toLocaleString()}
    </span>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(6 * 3600 + 12 * 60 + 47);
  const [jackpot, setJackpot] = useState(5824650.23);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((c: number) => (c > 0 ? c - 1 : 8 * 3600));
      setJackpot((j: number) => j + Math.random() * 1.5);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor((countdown % 3600) / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");

  return (
    <CasinoLayout>
      <div className="space-y-6 max-w-[1380px] mx-auto pb-10 px-4">
        {/* Top Grid: Hero (Left) and Live Wins (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 xl:h-[425px]">
          {/* Animated Hero Section */}
          <section className="relative rounded-3xl overflow-hidden border border-slate-900 bg-[#08080d] min-h-[360px] xl:h-full flex flex-col justify-between shadow-2xl">
            {/* Background cybernetic image */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <img 
                src={heroBg} 
                alt="futuristic background" 
                className="w-full h-full object-cover object-[53%_35%] opacity-90 mix-blend-screen" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#08080d] via-[#08080d]/40 to-transparent" />
            </div>

            {/* Inner Content Grid */}
            <div className="relative z-10 p-5 xl:p-6 grid md:grid-cols-[1fr_300px] gap-5 items-center w-full flex-1">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">WELCOME TO</p>
                
                <h1 className="text-4xl md:text-5xl font-display font-black tracking-wide text-white leading-none">
                  Fast<span className="bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent">Luck</span>
                </h1>
                
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed font-medium">
                  The next generation of lucky gaming. Fast. Fair. Exciting.
                </p>
                
                <div className="pt-1 flex flex-wrap gap-3">
                  <Link to="/games/slots" className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-extrabold text-[10px] uppercase tracking-widest text-white shadow-[0_0_15px_rgba(236,72,153,0.35)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5">
                    Play Now <Zap className="size-3" />
                  </Link>
                  <a href="#featured" className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-extrabold uppercase tracking-widest text-slate-300 hover:bg-slate-850 hover:text-white transition-all">
                    Explore Games
                  </a>
                </div>
                
                <div className="pt-2.5 flex flex-wrap gap-4.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-t border-slate-800/60 max-w-xl">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-emerald-500" />Provably Fair</span>
                  <span className="flex items-center gap-1.5"><Zap className="size-3.5 text-amber-500" />Instant Payouts</span>
                  <span className="flex items-center gap-1.5"><Lock className="size-3.5 text-cyan-500" />Secure & Encrypted</span>
                </div>
              </div>

              {/* Mega Jackpot Display Banner + Stats Row */}
              <div className="flex flex-col gap-3 justify-center h-full w-full z-10 select-none">
                <div className="relative w-full">
                  <img 
                    src={jackpotBanner} 
                    alt="Mega Jackpot" 
                    className="w-full h-auto object-contain drop-shadow-[0_0_25px_rgba(245,158,11,0.15)]" 
                  />
                  {/* Timer positioned inside the bottom plate slot of the image */}
                  <div className="absolute bottom-[24.5%] left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-center whitespace-nowrap">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                    <span className="text-[9px] text-[#8e9bb3] font-black uppercase tracking-widest">Ends in:</span>
                    <span className="font-mono font-extrabold text-[11px] text-white tracking-widest drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]">
                      {String(Math.floor(countdown / 3600)).padStart(2, "0")}:{mm}:{ss}
                    </span>
                  </div>
                </div>

                {/* Stats Row just below Jackpot */}
                <div className="grid grid-cols-3 gap-3 text-[10px] font-bold text-slate-400 mt-1">
                  {/* Active Players Box */}
                  <div className="glass rounded-xl p-2 flex flex-col justify-center items-center text-center border border-slate-900/60 bg-[#0c0d14]/40 hover:scale-[1.02] transition-all">
                    <div className="size-7 rounded-lg grid place-items-center bg-[#a855f7]/10 border border-[#a855f7]/25 text-[#a855f7] shadow-[0_0_6px_rgba(168,85,247,0.1)] shrink-0 mb-1">
                      <Users className="size-3.5" />
                    </div>
                    <p className="text-white font-extrabold text-[11px] tracking-wide leading-none"><AnimatedCounter value={125847} /></p>
                    <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">Active Players</p>
                  </div>

                  {/* Live Wins Box */}
                  <div className="glass rounded-xl p-2 flex flex-col justify-center items-center text-center border border-slate-900/60 bg-[#0c0d14]/40 hover:scale-[1.02] transition-all">
                    <div className="size-7 rounded-lg grid place-items-center bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.1)] shrink-0 mb-1">
                      <TrendingUp className="size-3.5" />
                    </div>
                    <p className="text-white font-extrabold text-[11px] tracking-wide leading-none"><AnimatedCounter value={1274389} isCurrency={true} /></p>
                    <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">Live Wins</p>
                  </div>

                  {/* Tournaments Paid Box */}
                  <div className="glass rounded-xl p-2 flex flex-col justify-center items-center text-center border border-slate-900/60 bg-[#0c0d14]/40 hover:scale-[1.02] transition-all">
                    <div className="size-7 rounded-lg grid place-items-center bg-amber-500/10 border border-amber-500/25 text-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.15)] shrink-0 mb-1">
                      <Trophy className="size-3.5" />
                    </div>
                    <p className="text-[#dfaf37] font-extrabold text-[11px] tracking-wide leading-none"><AnimatedCounter value={8562100} isCurrency={true} /></p>
                    <p className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">Tournaments Paid</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Live Wins Activity feed (Right side) - Not scrollable, stands perfectly */}
          <aside className="xl:h-full xl:flex xl:flex-col justify-between">
            <div className="glass rounded-3xl p-5 flex flex-col justify-between xl:h-full min-h-[360px] overflow-hidden">
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-900/60 pb-2 mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <p className="font-display font-extrabold text-xs text-white">Live Wins</p>
                  </div>
                  <Link to="/live" className="text-slate-500 hover:text-white transition-colors">
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
                
                <div className="flex-1 overflow-y-hidden pr-1">
                  <LiveWinsTicker />
                </div>
              </div>
              
              <Link to="/live" className="mt-3 w-full py-2.5 rounded-xl bg-[#121424] hover:bg-[#181a2f] border border-slate-900 text-center font-bold text-[10px] text-slate-300 hover:text-white tracking-wide transition-all shrink-0">
                View All Activity →
              </Link>
            </div>
          </aside>
        </div>

        {/* Bottom Section (Full Width, scrolls naturally with browser window) */}
        <div className="space-y-6">
          {/* Featured games grid */}
          <section id="featured" className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
              <h2 className="text-xs font-display font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>🎮</span> Featured Games
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors cursor-pointer">View All Games →</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {games.map((g) => <GameCard key={g.to} {...g} />)}
            </div>
          </section>

          {/* Bottom widgets grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            {/* Daily Quests Widget */}
            <MissionsWidget />

            {/* Leaderboard Highlights */}
            <div className="glass rounded-3xl p-5 flex flex-col justify-between h-[230px] overflow-hidden">
              <div>
                <div className="flex justify-between items-center border-b border-slate-900/60 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-amber-500" />
                    <p className="font-display font-extrabold text-xs text-white">Leaderboard Highlights</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-wider cursor-pointer">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900/40 border border-slate-800/80 text-[8px] font-bold flex items-center gap-1">Weekly <span className="text-[6px]">▼</span></span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { rank: 1, name: "LuckyLegend", value: "$245,870.30", color: "text-amber-400", rankColor: "text-amber-400", crownColor: "text-amber-400 fill-amber-400", initials: "LL", initialsColor: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
                    { rank: 2, name: "HighRoller99", value: "$189,450.10", color: "text-amber-400", rankColor: "text-slate-400", crownColor: "text-slate-400 fill-slate-400", initials: "HR", initialsColor: "text-slate-300 bg-slate-500/10 border-slate-500/20" },
                    { rank: 3, name: "CryptoKing", value: "$142,335.75", color: "text-amber-400", rankColor: "text-amber-600", crownColor: "text-amber-600 fill-amber-600", initials: "CK", initialsColor: "text-amber-600 bg-amber-600/10 border-amber-600/20" },
                  ].map((p) => (
                    <div key={p.name} className="flex items-center justify-between text-xs select-none">
                      <span className="flex items-center gap-2 font-semibold text-slate-300">
                        <span className={`text-[10px] font-black w-3 text-center ${p.rankColor}`}>{p.rank}</span>
                        {/* Avatar */}
                        <div className={`size-5 rounded-full border grid place-items-center text-[8px] font-black uppercase shrink-0 ${p.initialsColor}`}>
                          {p.initials}
                        </div>
                        <span className="flex items-center gap-1 truncate max-w-[95px]">
                          {p.name}
                          <Crown className={`size-3 shrink-0 ${p.crownColor}`} />
                        </span>
                      </span>
                      <span className="text-amber-400 font-extrabold font-display text-[11px]">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Highlighted Current User Rank Row */}
              <div className="border border-blue-500/25 bg-blue-950/20 rounded-xl p-2 flex items-center justify-between text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]">
                <span className="font-bold text-slate-500 text-[9px] uppercase tracking-wide">Your Rank #24</span>
                <div className="flex items-center gap-1.5">
                  <div className="size-5 rounded-full bg-blue-500/10 border border-blue-500/30 grid place-items-center text-[8px] font-black text-blue-400">LM</div>
                  <span className="text-white font-semibold text-[11px]">LuckMaster</span>
                </div>
                <span className="text-blue-400 font-extrabold font-display text-[11px]">$12,540.75</span>
              </div>
            </div>

            {/* Tournament Spotlight */}
            <div className="glass rounded-3xl p-5 flex flex-col justify-between h-[230px] relative overflow-hidden group">
              {/* Purple backglow blur */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#a855f7]/15 rounded-full blur-2xl pointer-events-none group-hover:bg-[#a855f7]/25 transition-all duration-500" />
              
              {/* Trophy Model Overlay - Transparent PNG */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-32 h-32 opacity-90 flex items-center justify-center pointer-events-none z-0">
                <img 
                  src={trophyModel} 
                  alt="Trophy Model" 
                  className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.45)] animate-pulse-glow" 
                />
              </div>

              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-900/60 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="size-4 text-blue-500" />
                      <p className="font-display font-extrabold text-xs text-white">Tournament Spotlight</p>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-500/20 text-[9px] font-bold text-blue-400">
                      <span>⏱</span> 2d 14h 32m
                    </div>
                  </div>
                  <div className="pt-1 flex flex-col gap-1.5 max-w-[60%]">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-500/15 text-rose-500 border border-rose-500/20 uppercase tracking-widest animate-pulse">LIVE</span>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wide">WEEKLY CHAMPIONSHIP</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Prize Pool</p>
                    <p className="text-xl font-display font-black text-amber-400 leading-none">$250,000</p>
                  </div>
                </div>
                <button className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-center font-display font-extrabold text-[10px] text-white tracking-wider hover:scale-[1.01] transition-all">
                  View Tournament
                </button>
              </div>
            </div>

            {/* VIP Club Spotlight */}
            <div className="glass rounded-3xl p-5 flex flex-col justify-between h-[230px] relative overflow-hidden group">
              {/* Gold backglow blur */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />
              
              {/* VIP Gold Crown Model Overlay - Transparent PNG */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-32 h-32 opacity-95 flex items-center justify-center pointer-events-none z-0">
                <img 
                  src={vipGoldCrown} 
                  alt="Gold Crown Model" 
                  className="w-28 h-28 object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.45)] animate-pulse-glow" 
                />
              </div>
              <div className="relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 border-b border-slate-900/60 pb-2 mb-3">
                    <Crown className="size-4 text-amber-400" />
                    <p className="font-display font-extrabold text-xs text-white">VIP Club</p>
                  </div>
                  <div className="space-y-2 text-xs max-w-[60%]">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Cashback</span>
                      <span className="text-white font-extrabold">12%</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Weekly Bonus</span>
                      <span className="text-white font-extrabold">$125.00</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Rakeback</span>
                      <span className="text-white font-extrabold">15%</span>
                    </div>
                  </div>
                </div>
                <Link to="/vip" className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-400/20 hover:brightness-110 text-center font-extrabold text-[10px] text-[#050508] tracking-wider transition-all flex items-center justify-center gap-1">
                  Go to VIP Club <ChevronRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Page Footer Badges */}
          <div className="pt-4 mt-auto border-t border-slate-900/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-500">
            <div className="glass rounded-2xl p-3 flex items-center gap-3 border border-slate-900/80 bg-[#0c0d14]/40 hover:scale-[1.02] transition-all">
              <div className="size-8 rounded-xl grid place-items-center bg-[#00c6ff]/10 border border-[#00c6ff]/25 text-[#00c6ff] shadow-[0_0_10px_rgba(0,198,255,0.1)] shrink-0">
                <Zap className="size-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white leading-none">Instant Deposits</p>
                <p className="text-[9px] font-semibold text-slate-500 mt-1">Crypto & Fiat</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-3 flex items-center gap-3 border border-slate-900/80 bg-[#0c0d14]/40 hover:scale-[1.02] transition-all">
              <div className="size-8 rounded-xl grid place-items-center bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)] shrink-0">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white leading-none">Provably Fair</p>
                <p className="text-[9px] font-semibold text-slate-500 mt-1">100% Transparent</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-3 flex items-center gap-3 border border-slate-900/80 bg-[#0c0d14]/40 hover:scale-[1.02] transition-all">
              <div className="size-8 rounded-xl grid place-items-center bg-[#ec4899]/10 border border-[#ec4899]/25 text-[#ec4899] shadow-[0_0_10px_rgba(236,72,153,0.1)] shrink-0">
                <Headphones className="size-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white leading-none">24/7 Support</p>
                <p className="text-[9px] font-semibold text-slate-500 mt-1">We're here for you</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-3 flex items-center gap-3 border border-slate-900/80 bg-[#0c0d14]/40 hover:scale-[1.02] transition-all">
              <div className="size-8 rounded-xl grid place-items-center bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)] shrink-0">
                <Lock className="size-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-white leading-none">Secure Platform</p>
                <p className="text-[9px] font-semibold text-slate-500 mt-1">Bank-level Security</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CasinoLayout>
  );
}


