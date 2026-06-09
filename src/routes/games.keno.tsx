import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";
import { Sparkles, RefreshCw, Layers } from "lucide-react";

export const Route = createFileRoute("/games/keno")({
  head: () => ({ meta: [{ title: "Keno — FastLuck" }] }),
  component: Keno,
});

function Keno() {
  return (
    <GameShell title="KENO" accent="oklch(0.75 0.2 150)" description="Choose up to 10 coordinates. Score multipliers based on correct matches drawn at random.">
      {(api) => <KenoGame api={api} />}
    </GameShell>
  );
}

const TOTAL = 40, DRAWS = 10;
const PAYOUT: Record<number, number[]> = {
  1: [0, 3.6], 2: [0, 1, 8], 3: [0, 1, 3, 18], 4: [0, 0.5, 2, 8, 40],
  5: [0, 0.5, 1, 4, 12, 80], 6: [0, 0.4, 1, 2, 8, 25, 200],
  7: [0, 0.3, 1, 1.5, 5, 15, 60, 400], 8: [0, 0.2, 1, 1.5, 3, 8, 25, 100, 800],
  9: [0, 0.2, 1, 1.5, 2, 5, 12, 50, 250, 1000], 10: [0, 0.2, 0.5, 1, 2, 4, 10, 40, 100, 500, 2000],
};

function KenoGame({ 
  api 
}: { 
  api: { 
    bet: number;
    placeBet: () => boolean; 
    payout: (m: number) => void; 
    loss: () => void 
  } 
}) {
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [drawn, setDrawn] = useState<Set<number>>(new Set());
  const [msg, setMsg] = useState("");
  const [playing, setPlaying] = useState(false);

  const toggle = (n: number) => {
    if (playing) return;
    setPicks((p) => { 
      const s = new Set(p); 
      s.has(n) ? s.delete(n) : s.size < 10 && s.add(n); 
      return s; 
    });
  };

  const play = () => {
    if (picks.size === 0 || playing || !api.placeBet()) return;
    setPlaying(true);
    setDrawn(new Set());
    setMsg("");

    const pool = Array.from({ length: TOTAL }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const targetDrawn = pool.slice(0, DRAWS);

    // Sequential draw reveal to increase suspense
    let idx = 0;
    const drawSet = new Set<number>();
    const timer = setInterval(() => {
      drawSet.add(targetDrawn[idx]);
      setDrawn(new Set(drawSet));
      idx++;
      if (idx >= DRAWS) {
        clearInterval(timer);
        const hits = [...picks].filter((n) => drawSet.has(n)).length;
        const m = PAYOUT[picks.size]?.[hits] ?? 0;
        setMsg(`${hits} Match Hits → ${m}x Multiplier (+$${(api.bet * m).toFixed(2)})`);
        if (m > 0) api.payout(m); 
        else api.loss();
        setPlaying(false);
      }
    }, 120);
  };

  return (
    <div className="flex flex-col h-full gap-5 w-full">
      <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/30 pb-3">
        <span className="flex items-center gap-1.5"><Layers className="size-4 text-neon-pink" /> Coordinate Picks: {picks.size}/10</span>
        {picks.size > 0 && (
          <span className="text-white">Max Potential: {(PAYOUT[picks.size]?.[picks.size] ?? 0)}x</span>
        )}
      </div>

      {/* Luxury Board Grid */}
      <div className="grid grid-cols-8 gap-2 p-3.5 rounded-3xl bg-background/40 border border-border/60 glass">
        {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => {
          const picked = picks.has(n);
          const hit = drawn.has(n);
          const isDrawComplete = drawn.size === DRAWS;
          
          return (
            <button 
              key={n} 
              disabled={playing}
              onClick={() => toggle(n)}
              className={`aspect-square rounded-xl text-xs sm:text-sm font-black border transition-all duration-200 flex items-center justify-center cursor-pointer ${
                picked && hit 
                  ? "bg-success text-background border-transparent shadow-[var(--shadow-emerald-glow)] scale-95" 
                  : hit 
                  ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan scale-95" 
                  : picked 
                  ? "bg-neon-pink/25 border-neon-pink text-white shadow-[var(--shadow-neon)]" 
                  : "bg-muted/30 border-border/50 hover:bg-muted/60 hover:border-neon-purple hover:-translate-y-0.5 text-muted-foreground hover:text-white"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>

      {msg && (
        <div className="px-4 py-2.5 rounded-2xl bg-neon-gold/10 border border-neon-gold/30 text-center font-display font-black text-xs sm:text-sm text-neon-gold uppercase tracking-widest animate-pulse">
          {msg}
        </div>
      )}

      {/* Controller Buttons */}
      <div className="flex gap-3">
        <button 
          onClick={() => { setPicks(new Set()); setDrawn(new Set()); setMsg(""); }} 
          disabled={playing}
          className="px-5 py-3.5 rounded-2xl bg-muted/50 border border-border/60 font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-white hover:bg-muted transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
        >
          <RefreshCw className="size-4" /> Reset
        </button>
        <button 
          onClick={play} 
          disabled={picks.size === 0 || playing}
          className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-success to-neon-cyan font-black text-background text-xs uppercase tracking-widest shadow-[var(--shadow-emerald-glow)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="size-4.5" /> {playing ? "Drawing Ball..." : "Start Drawing"}
        </button>
      </div>
    </div>
  );
}

