import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useEffect, useRef, useState } from "react";
import { Sparkles, TrendingUp, History } from "lucide-react";

export const Route = createFileRoute("/games/crash")({
  head: () => ({ meta: [{ title: "Crash — FastLuck" }, { name: "description", content: "Cash out before the rocket crashes." }] }),
  component: Crash,
});

type CrashCtx = {
  bet: number;
  balance: number;
  onBetError: (msg: string) => void;
  updateBalance: (balance: number) => void;
};

function Crash() {
  return (
    <GameShell title="CRASH" accent="oklch(0.72 0.28 340)" description="Watch the multiplier skyrocket. Secure your earnings before the system crashes.">
      {(ctx) => <CrashGame {...ctx} />}
    </GameShell>
  );
}

function CrashGame({ bet, balance, onBetError, updateBalance }: CrashCtx) {
  const [mult, setMult] = useState(1);
  const [state, setState] = useState<"idle" | "running" | "crashed" | "cashed">("idle");
  const [history, setHistory] = useState<number[]>([2.34, 1.12, 4.56, 1.04, 8.21]);
  const crashAt = useRef(0);
  const raf = useRef<number | null>(null);
  const lastBet = useRef(0);
  const balanceRef = useRef(balance);

  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  const start = () => {
    if (bet > balanceRef.current) {
      onBetError("Insufficient balance");
      return;
    }
    lastBet.current = bet;
    balanceRef.current -= bet;
    updateBalance(balanceRef.current);

    // Dynamic casino formula
    crashAt.current = Math.max(1.01, Math.pow(Math.random(), 2.2) * 15 + 1);
    setMult(1);
    setState("running");
    const t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      const m = Math.pow(1.08, t * 6);
      if (m >= crashAt.current) {
        setMult(crashAt.current);
        setState("crashed");
        setHistory((h) => [crashAt.current, ...h].slice(0, 8));
        return;
      }
      setMult(m);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const cashOut = () => {
    if (state !== "running") return;
    if (raf.current) cancelAnimationFrame(raf.current);
    const win = lastBet.current * mult;
    balanceRef.current += win;
    updateBalance(balanceRef.current);
    setState("cashed");
    setHistory((h) => [mult, ...h].slice(0, 8));
  };

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const color = state === "crashed" ? "oklch(0.65 0.25 25)" : state === "cashed" ? "oklch(0.75 0.2 150)" : "oklch(0.72 0.28 340)";
  
  // Calculate SVG curve coordinates dynamically
  const progressPercent = Math.min(100, ((mult - 1) / 14) * 100);
  const pathX = progressPercent * 3.5; // Scale to 350 max width
  const pathY = 220 - (progressPercent * 1.8); // Scale to 220 height

  return (
    <div className="flex flex-col h-full w-full">
      {/* Visual Chart Pane */}
      <div 
        className={`flex-1 h-64 md:h-72 rounded-3xl bg-background/50 border border-border/60 relative overflow-hidden flex flex-col justify-center items-center glass transition-all ${
          state === "crashed" ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
      >
        {/* SVG Curve Line Graph */}
        {state === "running" && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 240">
            <path
              d={`M 20 220 Q ${Math.max(20, pathX / 2 + 10)} 220, ${pathX + 20} ${pathY}`}
              fill="none"
              stroke="url(#rocketGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Rocket Tip */}
            <g transform={`translate(${pathX + 20}, ${pathY})`}>
              <circle r="6" fill="#fff" className="animate-ping" />
              <text y="4" x="-6" className="text-sm select-none" style={{ transform: "rotate(-45deg)" }}>🚀</text>
            </g>
            <defs>
              <linearGradient id="rocketGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="oklch(0.62 0.27 280)" />
                <stop offset="100%" stopColor="oklch(0.72 0.28 340)" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Large Multiplier Display */}
        <div className="relative z-10 text-center select-none">
          <div 
            className="text-7xl md:text-8xl font-display font-black tracking-widest transition-all duration-150" 
            style={{ 
              color, 
              textShadow: `0 0 35px ${color}80` 
            }}
          >
            {mult.toFixed(2)}x
          </div>
          
          <div className="mt-3 font-extrabold uppercase tracking-widest text-xs">
            {state === "idle" && (
              <span className="text-muted-foreground flex items-center gap-1.5 justify-center">
                <TrendingUp className="size-4 text-neon-pink" /> System Ready
              </span>
            )}
            {state === "running" && (
              <span className="text-neon-pink animate-pulse">Launching Flight...</span>
            )}
            {state === "crashed" && (
              <span className="text-destructive font-black tracking-[0.2em] flex items-center gap-1.5 justify-center">
                💥 EXPLODED @ {mult.toFixed(2)}x
              </span>
            )}
            {state === "cashed" && (
              <span className="text-success font-black tracking-[0.15em] flex items-center gap-1.5 justify-center">
                ✓ Payout Locked
              </span>
            )}
          </div>
        </div>

        {/* Backdrop decorative gridlines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
      </div>

      {/* History log widgets */}
      <div className="mt-4.5 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <History className="size-3.5" /> Recent Rocket Multipliers
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
          {history.map((h, i) => (
            <span 
              key={i} 
              className="px-3 py-1.5 rounded-xl text-xs font-black font-display tracking-wider border shrink-0 glass" 
              style={{ 
                background: h < 2 ? "rgba(233, 69, 96, 0.1)" : "rgba(75, 255, 145, 0.1)",
                borderColor: h < 2 ? "rgba(233, 69, 96, 0.3)" : "rgba(75, 255, 145, 0.3)",
                color: h < 2 ? "oklch(0.7 0.25 25)" : "oklch(0.75 0.22 145)" 
              }}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      {/* Control panel buttons */}
      <div className="mt-4.5 flex gap-3">
        {state === "running" ? (
          <button 
            onClick={cashOut} 
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-success to-neon-cyan font-black text-background text-sm uppercase tracking-widest shadow-[var(--shadow-emerald-glow)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
          >
            Cash Out @ ${(bet * mult).toFixed(2)}
          </button>
        ) : (
          <button 
            onClick={start} 
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-neon-pink to-neon-purple font-black text-white text-sm uppercase tracking-widest shadow-[var(--shadow-neon)] hover:brightness-110 active:scale-[0.98] transition-all animate-pulse-glow cursor-pointer"
          >
            Place Rocket Bet
          </button>
        )}
      </div>

      {/* Custom Shake animation in style tag since framer is omitted */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

