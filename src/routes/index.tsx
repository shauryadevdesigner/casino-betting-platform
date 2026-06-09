import { createFileRoute, Link } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { GameCard } from "@/components/GameCard";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck, Zap, Lock, Headphones, Crown, ChevronRight, Trophy, TrendingUp } from "lucide-react";
import { LiveWinsTicker } from "@/components/LiveWinsTicker";
import { MissionsWidget } from "@/components/MissionsWidget";
import { useState, useEffect } from "react";
import heroBg from "@/assets/hero-bg.png";
import jackpotBanner from "@/assets/jackpot-banner.png";
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
  { to: "/games/crash", name: "CRASH", image: gCrash, players: 1248, accent: "#f43f5e", glowClass: "crash-glow" },
  { to: "/games/roulette", name: "ROULETTE", image: gRoulette, players: 1023, accent: "#eab308", glowClass: "roulette-glow" },
  { to: "/games/dice", name: "DICE", image: gDice, players: 1878, accent: "#a855f7", glowClass: "dice-glow" },
  { to: "/games/mines", name: "MINES", image: gMines, players: 1532, accent: "#3b82f6", glowClass: "mines-glow" },
  { to: "/games/towers", name: "TOWERS", image: gTowers, players: 1109, accent: "#22c55e", glowClass: "towers-glow" },
  { to: "/games/slots", name: "$LOTS", image: gSlots, players: 2345, accent: "#ec4899", glowClass: "slots-glow" },
  { to: "/games/keno", name: "KENO", image: gKeno, players: 1567, accent: "#06b6d4", glowClass: "keno-glow" },
];

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
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 max-w-[1350px] mx-auto">
        <div className="space-y-6 min-w-0">
          {/* Animated Hero Section */}
          <section className="relative rounded-3xl overflow-hidden border border-slate-900 bg-[#08080d] min-h-[340px] flex flex-col justify-between shadow-2xl">
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
            <div className="relative z-10 p-7 grid md:grid-cols-[1fr_300px] gap-6 items-center w-full">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">WELCOME TO</p>
                
                <h1 className="text-4xl md:text-5xl font-display font-black tracking-wide text-white leading-none">
                  Fast<span className="bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent">Luck</span>
                </h1>
                
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed font-medium">
                  The next generation of lucky gaming. Fast. Fair. Exciting.
                </p>
                
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link to="/games/slots" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-extrabold text-[10px] uppercase tracking-widest text-white shadow-[0_0_15px_rgba(236,72,153,0.35)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-1.5">
                    Play Now <Zap className="size-3" />
                  </Link>
                  <a href="#featured" className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-extrabold uppercase tracking-widest text-slate-300 hover:bg-slate-850 hover:text-white transition-all">
                    Explore Games
                  </a>
                </div>
                
                <div className="pt-3.5 flex flex-wrap gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-500 border-t border-slate-900/60 max-w-md">
                  <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-emerald-500" />Provably Fair</span>
                  <span className="flex items-center gap-1.5"><Zap className="size-3.5 text-amber-500" />Instant Payouts</span>
                  <span className="flex items-center gap-1.5"><Lock className="size-3.5 text-cyan-500" />Secure & Encrypted</span>
                </div>
              </div>

              {/* Mega Jackpot Display Banner */}
              <div className="relative w-full z-10 select-none">
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
            </div>

            {/* Bottom stats banner inside Hero Card */}
            <div className="relative z-10 w-full px-6 py-2.5 bg-[#040406]/95 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                <span>ONLINE <span className="text-white">1,248 Players</span></span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-3.5 text-[#00c6ff]" />
                <span>TOTAL WINS <span className="text-white">24H WINS</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="size-3.5 text-amber-500" />
                <span>$4,342,700 <span className="text-slate-650">/</span> <span className="text-amber-500">$4,342,300</span></span>
              </div>
            </div>
          </section>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Daily Quests Widget */}
            <MissionsWidget />

            {/* Leaderboard Highlights */}
            <div className="bg-[#0b0c15] border border-slate-900 rounded-3xl p-5 flex flex-col justify-between h-[236px]">
              <div>
                <div className="flex justify-between items-center border-b border-slate-900/60 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-amber-500" />
                    <p className="font-display font-extrabold text-xs text-white">Leaderboard (Wagers)</p>
                  </div>
                  <Link to="/leaderboard" className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-wider flex items-center gap-0.5">View All</Link>
                </div>
                <div className="space-y-2 pt-1.5">
                  {[
                    { rank: 1, name: "LuckyGamer", value: "250.45 ETH", color: "text-amber-400" },
                    { rank: 2, name: "HighRoller99", value: "180.75 ETH", color: "text-slate-300" },
                    { rank: 3, name: "CryptoKing", value: "120.10 ETH", color: "text-amber-600" },
                  ].map((p, i) => (
                    <div key={p.name} className="flex items-center justify-between py-0.5 text-xs">
                      <span className="flex items-center gap-2 font-semibold text-slate-300">
                        <span className={`text-[10px] font-black ${p.color}`}>#{p.rank}</span>
                        <span>{p.name}</span>
                      </span>
                      <span className="text-white font-extrabold font-display text-[11px]">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-slate-900/60 pt-2.5 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">You (#250)</span>
                <span className="text-blue-400 font-extrabold font-display text-[11px]">75.25 ETH</span>
              </div>
            </div>

            {/* Tournament Spotlight */}
            <div className="bg-[#0b0c15] border border-slate-900 rounded-3xl p-5 flex flex-col justify-between h-[236px]">
              <div>
                <div className="flex justify-between items-center border-b border-slate-900/60 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="size-4 text-blue-500" />
                    <p className="font-display font-extrabold text-xs text-white">Tournament: Legends</p>
                  </div>
                  <Link to="/tournaments" className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-wider flex items-center gap-0.5">View All</Link>
                </div>
                <div className="pt-2">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none">Prize Pool</p>
                  <p className="text-xl font-display font-black text-white mt-1 leading-none">100 ETH</p>
                  <p className="text-[9px] text-slate-500 font-medium mt-1">Via the leaderboard!</p>
                  
                  <div className="mt-3.5 space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400">
                      <span>Progress</span>
                      <span className="text-white">$150,250</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-900 overflow-hidden border border-slate-900">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full py-1.5 rounded-xl bg-blue-600/15 border border-blue-500/20 text-center font-display font-extrabold text-[10px] text-blue-400 tracking-wider">
                Ends in: 12:34:47
              </div>
            </div>

            {/* VIP Lounge Spotlight */}
            <div className="bg-[#0b0c15] border border-slate-900 rounded-3xl p-5 flex flex-col justify-between h-[236px] relative overflow-hidden">
              <div className="absolute top-8 right-2 w-20 h-20 opacity-30 blur-sm flex items-center justify-center pointer-events-none">
                <Crown className="size-16 text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 border-b border-slate-900/60 pb-2.5 mb-3">
                  <Crown className="size-4 text-amber-400" />
                  <p className="font-display font-extrabold text-xs text-white">VIP Club</p>
                </div>
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Your Level</span>
                    <span className="text-amber-400 font-extrabold">VIP 7</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-500">Next Reward</span>
                    <span className="text-white font-extrabold">$5,000</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-505">Progress</span>
                    <span className="text-white font-extrabold">78%</span>
                  </div>
                </div>
              </div>
              <Link to="/vip" className="relative z-10 w-full py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/20 hover:border-amber-500/40 text-center font-extrabold text-[10px] text-amber-400 tracking-wider transition-all">
                View VIP Perks →
              </Link>
            </div>
          </div>

          {/* Page Footer Badges */}
          <div className="pt-8 border-t border-slate-900/60 flex flex-wrap items-center justify-between gap-5 text-slate-500">
            <div className="flex items-center gap-2.5">
              <Zap className="size-4 text-[#00c6ff]" />
              <div>
                <p className="text-[10px] font-black uppercase text-white leading-none">Instant Payouts</p>
                <p className="text-[9px] font-semibold mt-0.5">Lightning fast</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 text-emerald-500" />
              <div>
                <p className="text-[10px] font-black uppercase text-white leading-none">Secure Play</p>
                <p className="text-[9px] font-semibold mt-0.5">100% encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Headphones className="size-4 text-[#ec4899]" />
              <div>
                <p className="text-[10px] font-black uppercase text-white leading-none">24/7 Support</p>
                <p className="text-[9px] font-semibold mt-0.5">We're here for you</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Lock className="size-4 text-cyan-400" />
              <div>
                <p className="text-[10px] font-black uppercase text-white leading-none">Trusted Platform</p>
                <p className="text-[9px] font-semibold mt-0.5">Provably fair games</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Wins Activity feed (Right side) */}
        <aside className="space-y-4 shrink-0">
          <div className="bg-[#0b0c15] border border-slate-900 rounded-3xl p-4.5 flex flex-col justify-between min-h-[480px]">
            <div>
              <div className="flex justify-between items-center border-b border-slate-900/60 pb-3 mb-4.5">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <p className="font-display font-extrabold text-xs text-white">Live Wins</p>
                </div>
                <Link to="/live" className="text-slate-500 hover:text-white transition-colors">
                  <ChevronRight className="size-4" />
                </Link>
              </div>
              
              <LiveWinsTicker />
            </div>
            
            <Link to="/live" className="mt-5 w-full py-2.5 rounded-xl bg-[#121424] hover:bg-[#181a2f] border border-slate-900 text-center font-bold text-[10px] text-slate-300 hover:text-white tracking-wide transition-all">
              View All Wins →
            </Link>
          </div>
        </aside>
      </div>
    </CasinoLayout>
  );
}


