import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { Sparkles, Dice5 } from "lucide-react";

export const Route = createFileRoute("/games/dice")({
  head: () => ({ meta: [{ title: "Dice — FastLuck" }] }),
  component: Dice,
});

function Dice() {
  return (
    <GameShell title="DICE" accent="oklch(0.7 0.22 260)" description="Slide the threshold bar. Play under or over to hit multipliers.">
      {(ctx) => <DiceGame {...ctx} />}
    </GameShell>
  );
}

function DiceGame({
  bet,
  balance,
  onBetError,
  updateBalance,
}: {
  bet: number;
  balance: number;
  onBetError: (msg: string) => void;
  updateBalance: (b: number) => void;
}) {
  const [target, setTarget] = useState(50);
  const [mode, setMode] = useState<"under" | "over">("under");
  const [roll, setRoll] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const winChance = mode === "under" ? target : 100 - target;
  const mult = +(99 / winChance).toFixed(2);

  const play = async () => {
    if (bet > balance) {
      onBetError("Insufficient balance");
      return;
    }
    setLoading(true);
    setWon(null);

    // Roll ticker simulation
    let counter = 0;
    const ticker = setInterval(() => {
      setRoll(Math.random() * 100);
    }, 45);

    try {
      const res = await api.playDice({ betAmount: bet, target, mode });
      setTimeout(() => {
        clearInterval(ticker);
        setRoll(res.roll);
        setWon(res.won);
        updateBalance(res.balance);
        if (res.won) toast.success(`Winner! Paid out $${res.payout.toFixed(2)} (${res.multiplier}x)`);
        else toast.error("Try again!");
        setLoading(false);
      }, 600); // Ticks for 600ms
    } catch (e) {
      clearInterval(ticker);
      setRoll(null);
      setLoading(false);
      onBetError(e instanceof Error ? e.message : "Play failed");
    }
  };

  const getSliderBackground = () => {
    const pct = target;
    if (mode === "under") {
      return `linear-gradient(to right, oklch(0.75 0.22 145) ${pct}%, oklch(0.18 0.03 280) ${pct}%)`;
    } else {
      return `linear-gradient(to right, oklch(0.18 0.03 280) ${pct}%, oklch(0.75 0.22 145) ${pct}%)`;
    }
  };

  return (
    <div className="flex flex-col h-full gap-5 w-full">
      {/* Roll display wheel casing */}
      <div className="flex-1 min-h-[140px] grid place-items-center rounded-3xl bg-background/40 border border-border/60 relative overflow-hidden glass">
        <div className="absolute top-3 left-4 flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
          <Dice5 className="size-4 text-neon-blue" /> Live Roll Indicator
        </div>
        
        <div
          className="text-6xl md:text-7xl font-display font-black tracking-wider transition-all duration-200"
          style={{
            color: won === true ? "oklch(0.75 0.22 145)" : won === false ? "oklch(0.65 0.25 25)" : "oklch(0.7 0.22 260)",
            textShadow: won === true 
              ? "0 0 35px oklch(0.75 0.22 145 / 0.6)" 
              : won === false 
              ? "0 0 35px oklch(0.65 0.25 25 / 0.6)" 
              : "0 0 30px oklch(0.7 0.22 260 / 0.4)",
          }}
        >
          {roll !== null ? roll.toFixed(2) : "50.00"}
        </div>
        
        {won !== null && (
          <div className={`absolute bottom-3 text-[10px] font-black uppercase tracking-[0.25em] ${won ? "text-success" : "text-destructive"}`}>
            {won ? "★ Win Payout" : "✖ Bet Settled"}
          </div>
        )}
      </div>

      {/* Threshold Slider Controls */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <span>Boundary: 2</span>
          <span className="text-white bg-muted/65 px-3 py-1 rounded-lg border border-border/60">Target: {target}</span>
          <span>98</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min={2}
            max={98}
            value={target}
            disabled={loading}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="w-full h-3 rounded-full cursor-pointer appearance-none transition-all focus:outline-none"
            style={{ 
              background: getSliderBackground(),
              WebkitAppearance: "none"
            }}
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-border bg-card/40 p-3.5 text-center relative overflow-hidden glass">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Multiplier</p>
          <p className="font-display font-black text-lg text-neon-gold drop-shadow-[0_0_8px_rgba(255,179,0,0.25)] mt-1">{mult}x</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/40 p-3.5 text-center relative overflow-hidden glass">
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Win Chance</p>
          <p className="font-display font-black text-lg text-neon-cyan drop-shadow-[0_0_8px_oklch(0.78_0.18_200/0.25)] mt-1">{winChance.toFixed(0)}%</p>
        </div>
        <button 
          onClick={() => !loading && setMode(mode === "under" ? "over" : "under")}
          disabled={loading}
          className="rounded-2xl border border-neon-pink/30 hover:border-neon-pink/70 bg-neon-pink/10 hover:bg-neon-pink/20 p-3.5 text-center transition-all cursor-pointer font-black text-[10px] uppercase tracking-widest text-neon-pink flex flex-col justify-center items-center gap-1 disabled:opacity-40"
        >
          <span>Roll Direction</span>
          <span className="text-white text-xs tracking-wider">{mode === "under" ? "Under ⇅" : "Over ⇅"}</span>
        </button>
      </div>

      {/* Play Trigger */}
      <button
        onClick={play}
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-neon-blue to-neon-purple font-black text-white text-sm uppercase tracking-widest shadow-[var(--shadow-cyan-glow)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Rolling..." : "Roll Dice"}
      </button>

      {/* Styled track slider slider-thumb helper via styles tag */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 10px rgba(0,0,0,0.5), 0 0 0 4px oklch(0.7_0.22_260);
          cursor: pointer;
          transition: transform 0.1s;
        }
        input[type=range]:active::-webkit-slider-thumb {
          transform: scale(1.15);
        }
      `}</style>
    </div>
  );
}

