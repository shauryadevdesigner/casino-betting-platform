import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useRef, useState } from "react";
import { Sparkles, Award } from "lucide-react";

export const Route = createFileRoute("/games/slots")({
  head: () => ({ meta: [{ title: "Slots — FastLuck" }] }),
  component: Slots,
});

const SYMBOLS = ["🍒", "🔔", "💎", "7️⃣", "⭐", "🍋"];
const PAYOUTS: Record<string, number> = { "7️⃣": 50, "💎": 20, "⭐": 10, "🔔": 5, "🍒": 3, "🍋": 2 };

function Slots() {
  return (
    <GameShell title="SLOTS" accent="oklch(0.82 0.17 80)" description="Match three icons to score massive jackpots, or spin two matching symbols to double your stake.">
      {(api) => <SlotsGame api={api} />}
    </GameShell>
  );
}

function SlotsGame({ 
  api 
}: { 
  api: { 
    bet: number;
    placeBet: () => boolean; 
    payout: (m: number) => void; 
    loss: () => void 
  } 
}) {
  const [reels, setReels] = useState<string[]>(["🍒", "💎", "7️⃣"]);
  const [spinning, setSpinning] = useState([false, false, false]);
  const [msg, setMsg] = useState<string>("");
  const [winType, setWinType] = useState<"pair" | "jackpot" | null>(null);
  const intervals = useRef<number[]>([]);

  const spin = () => {
    if (spinning.some(s => s) || !api.placeBet()) return;
    
    setSpinning([true, true, true]); 
    setMsg("");
    setWinType(null);

    const final = [0, 0, 0].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    
    // Set fast scrolling intervals for motion blur
    intervals.current.forEach((i) => clearInterval(i));
    intervals.current = [0, 1, 2].map((idx) =>
      window.setInterval(() => {
        setReels((r) => { 
          const n = [...r]; 
          n[idx] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]; 
          return n; 
        });
      }, 55)
    );

    // Stop reels sequentially with distinct timeouts to simulate friction
    [900, 1500, 2100].forEach((t, idx) => {
      setTimeout(() => {
        clearInterval(intervals.current[idx]);
        setReels((r) => { 
          const n = [...r]; 
          n[idx] = final[idx]; 
          return n; 
        });
        
        setSpinning((prev) => {
          const next = [...prev];
          next[idx] = false;
          return next;
        });

        if (idx === 2) {
          if (final[0] === final[1] && final[1] === final[2]) {
            const m = PAYOUTS[final[0]] || 2;
            api.payout(m); 
            setWinType("jackpot");
            setMsg(`MEGA JACKPOT! ${m}x Payout (+$${(api.bet * m).toFixed(2)})`);
          } else if (final[0] === final[1] || final[1] === final[2] || final[0] === final[2]) {
            // Pair wins
            api.payout(1.5); 
            setWinType("pair");
            setMsg(`Match Pair! 1.5x Payout (+$${(api.bet * 1.5).toFixed(2)})`);
          } else {
            api.loss(); 
            setMsg("");
          }
        }
      }, t);
    });
  };

  return (
    <div className="flex flex-col h-full gap-5 items-center justify-center w-full">
      {/* Slot Machine Gold Casing */}
      <div 
        className="p-6 md:p-8 rounded-[32px] bg-gradient-to-b from-[#151522] via-[#0d0d14] to-[#101018] border-4 border-neon-gold shadow-[0_0_35px_rgba(255,179,0,0.35)] w-full max-w-sm flex flex-col items-center relative"
      >
        {/* Top Header Light Banner */}
        <div className="absolute top-2 w-32 h-4 rounded-full bg-gradient-to-r from-neon-pink/40 to-neon-purple/40 blur-md animate-pulse" />
        
        <div className="flex gap-3.5 mb-2 w-full justify-center">
          {reels.map((s, i) => (
            <div 
              key={i} 
              className={`size-20 sm:size-24 rounded-2xl bg-background/95 border-2 border-neon-gold/30 grid place-items-center text-4xl sm:text-5xl font-black select-none transition-all relative overflow-hidden ${
                spinning[i] ? "slot-blur shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]" : "shadow-[0_4px_10px_rgba(0,0,0,0.5)] scale-100"
              }`}
            >
              {s}
              {/* Inner shine shadow overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/10 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Win Banner Messages */}
      {msg && (
        <div 
          className={`px-5 py-2.5 rounded-2xl border text-center font-display font-black text-sm uppercase tracking-widest animate-bounce flex items-center gap-2 ${
            winType === "jackpot" 
              ? "bg-neon-gold/15 border-neon-gold text-neon-gold shadow-[var(--shadow-gold-glow)]" 
              : "bg-success/10 border-success/40 text-success"
          }`}
        >
          <Award className="size-4.5" /> {msg}
        </div>
      )}

      {/* Trigger button */}
      <button 
        onClick={spin} 
        disabled={spinning.some(s => s)} 
        className="px-10 py-3.5 rounded-2xl bg-gradient-to-r from-neon-gold via-warning to-neon-gold text-background font-black text-sm uppercase tracking-widest shadow-[var(--shadow-gold-glow)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
      >
        {spinning.some(s => s) ? "Spinning..." : "Pull Lever"}
      </button>

      {/* Styled Pay table list tags */}
      <div className="flex flex-wrap gap-2.5 justify-center mt-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground border-t border-border/30 pt-3 w-full max-w-xs">
        {Object.entries(PAYOUTS).map(([sym, mult]) => (
          <span key={sym} className="px-2 py-1 rounded bg-muted/40 border border-border/40 text-white flex items-center gap-1">
            {sym} <span className="text-neon-gold">{mult}x</span>
          </span>
        ))}
        <span className="px-2 py-1 rounded bg-muted/40 border border-border/40 text-white flex items-center gap-1">
          Pair <span className="text-success">1.5x</span>
        </span>
      </div>
    </div>
  );
}

