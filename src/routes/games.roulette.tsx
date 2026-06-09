import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";
import { Sparkles, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/games/roulette")({
  head: () => ({ meta: [{ title: "Roulette — FastLuck" }] }),
  component: Roulette,
});

function Roulette() {
  return (
    <GameShell title="ROULETTE" accent="oklch(0.7 0.25 25)" description="Place your chips on red, black, or green. Green lands 14x multipliers.">
      {(api) => <RouletteGame api={api} />}
    </GameShell>
  );
}

const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
type Color = "red" | "black" | "green";
function colorOf(n: number): Color { return n === 0 ? "green" : REDS.has(n) ? "red" : "black"; }

function RouletteGame({ 
  api 
}: { 
  api: { 
    bet: number;
    placeBet: () => boolean; 
    payout: (m: number) => void; 
    loss: () => void 
  } 
}) {
  const [choice, setChoice] = useState<Color>("red");
  const [result, setResult] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  const spin = () => {
    if (spinning || !api.placeBet()) return;
    setSpinning(true);
    setResult(null);

    // Spin animation rotation degrees
    const extraDegrees = 1000 + Math.floor(Math.random() * 2000);
    setWheelRotation((prev) => prev + extraDegrees);

    let i = 0;
    const iv = setInterval(() => { 
      setResult(Math.floor(Math.random() * 37)); 
      if (++i > 25) { 
        clearInterval(iv); 
        const n = Math.floor(Math.random() * 37); 
        setResult(n); 
        setSpinning(false); 
        const c = colorOf(n); 
        if (c === choice) {
          api.payout(c === "green" ? 14 : 2); 
        } else {
          api.loss(); 
        }
      } 
    }, 80);
  };

  const c = result !== null ? colorOf(result) : null;
  const bg = c === "red" ? "oklch(0.65 0.25 25)" : c === "black" ? "oklch(0.2 0.02 280)" : c === "green" ? "oklch(0.7 0.2 150)" : "var(--muted)";

  return (
    <div className="flex flex-col h-full gap-6 items-center justify-center w-full">
      {/* Dynamic Roulette Wheel Component */}
      <div className="relative size-52 md:size-56 rounded-full border-4 border-neon-gold bg-gradient-to-br from-[#101015] to-[#151522] grid place-items-center shadow-[0_0_35px_rgba(255,179,0,0.3)]">
        {/* Selector Pin */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-6 bg-neon-gold clip-triangle z-20 shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
        
        {/* Inner Rotating Disk */}
        <div 
          className="absolute inset-2.5 rounded-full bg-[radial-gradient(circle,rgba(20,20,30,1)_0%,rgba(10,10,15,1)_100%)] border-2 border-border/80 transition-transform duration-[2200ms] ease-out flex items-center justify-center"
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        >
          {/* Wheel Segments Overlay (Simulated via SVG backdrop lines) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:10px_100%] rounded-full opacity-35" />
          
          {/* Ball indicator spinning */}
          {spinning && (
            <div className="absolute w-3.5 h-3.5 bg-white rounded-full animate-ping offset-path-spin" />
          )}
        </div>

        {/* Center Winner Box */}
        <div 
          className="relative z-10 size-28 rounded-full grid place-items-center font-display text-4xl sm:text-5xl font-black border-4 transition-all duration-300" 
          style={{ 
            background: bg, 
            borderColor: c ? "#ffffff" : "rgba(255,255,255,0.08)",
            boxShadow: c ? `0 0 30px ${bg}` : "inset 0 0 15px rgba(0,0,0,0.8)" 
          }}
        >
          {result ?? <HelpCircle className="size-10 text-muted-foreground/30" />}
        </div>
      </div>

      {/* Choice Selector layout */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        {(["red", "green", "black"] as const).map((col) => (
          <button 
            key={col} 
            onClick={() => !spinning && setChoice(col)} 
            disabled={spinning}
            className={`py-3.5 rounded-2xl font-black uppercase border-2 transition-all cursor-pointer ${
              choice === col ? "scale-[1.03]" : "opacity-55"
            }`}
            style={{ 
              background: col === "red" ? "oklch(0.65 0.25 25)" : col === "green" ? "oklch(0.7 0.2 150)" : "oklch(0.2 0.02 280)", 
              borderColor: choice === col ? "#ffe082" : "rgba(255,255,255,0.05)",
              boxShadow: choice === col 
                ? col === "red" 
                  ? "0 0 20px oklch(0.65 0.25 25 / 0.5)" 
                  : col === "green" 
                  ? "0 0 20px oklch(0.7 0.2 150 / 0.5)" 
                  : "0 0 20px rgba(255,255,255,0.2)" 
                : "none"
            }}
          >
            {col} {col === "green" ? "14x" : "2x"}
          </button>
        ))}
      </div>

      {/* Trigger Spin */}
      <button 
        onClick={spin} 
        disabled={spinning} 
        className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-neon-pink to-destructive font-black text-white text-sm uppercase tracking-widest shadow-[var(--shadow-neon)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
      >
        {spinning ? "Spinning..." : "Spin Wheel"}
      </button>

      {/* Custom triangle clip style helper */}
      <style>{`
        .clip-triangle {
          clip-path: polygon(50% 100%, 0 0, 100% 0);
        }
        .offset-path-spin {
          animation: orbit-spin 1s linear infinite;
        }
        @keyframes orbit-spin {
          0% { transform: rotate(0deg) translateX(70px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}

