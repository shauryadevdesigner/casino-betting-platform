import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";
import { Sparkles, Trophy, ChevronUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/games/towers")({
  head: () => ({ meta: [{ title: "Towers — FastLuck" }] }),
  component: Towers,
});

function Towers() {
  return (
    <GameShell title="TOWERS" accent="oklch(0.82 0.18 200)" description="Climb the golden tower tiers. Avoid the hidden trap bombs on each floor. Cash out at any time.">
      {(api) => <TowersGame api={api} />}
    </GameShell>
  );
}

const LEVELS = 8;
const COLS = 3;

function TowersGame({ 
  api 
}: { 
  api: { 
    bet: number;
    placeBet: () => boolean; 
    payout: (m: number) => void; 
    loss: () => void 
  } 
}) {
  const [bombs, setBombs] = useState<number[]>([]);
  const [picked, setPicked] = useState<(number | null)[]>([]);
  const [level, setLevel] = useState(0);
  const [active, setActive] = useState(false);
  const [dead, setDead] = useState(false);

  const mult = +(Math.pow(COLS / (COLS - 1), level)).toFixed(2);

  const start = () => {
    if (!api.placeBet()) return;
    setBombs(Array.from({ length: LEVELS }, () => Math.floor(Math.random() * COLS)));
    setPicked([]); 
    setLevel(0); 
    setActive(true); 
    setDead(false);
  };

  const pick = (col: number) => {
    if (!active) return;
    const isBomb = bombs[level] === col;
    setPicked((p) => [...p, col]);
    if (isBomb) { 
      setActive(false); 
      setDead(true); 
      api.loss(); 
      toast.error("BOOM! You tripped a wire trap!");
      return; 
    }
    const nl = level + 1;
    setLevel(nl);
    if (nl === LEVELS) { 
      setActive(false); 
      const finalMult = +(Math.pow(COLS / (COLS - 1), nl)).toFixed(2);
      api.payout(finalMult); 
      toast.success(`PERFECT RUN! Reached the top of the tower!`);
    }
  };

  const cashOut = () => { 
    if (!active || level === 0) return; 
    setActive(false); 
    api.payout(mult); 
    toast.success(`Cashed out at Level ${level}! Paid out ${mult}x`);
  };

  // Helper to generate multipliers list for visual ladder scoreboard
  const getMultiplierForLevel = (l: number) => {
    return +(Math.pow(COLS / (COLS - 1), l)).toFixed(2);
  };

  return (
    <div className="flex flex-col h-full gap-4 w-full">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-3">
        <span className="flex items-center gap-1.5"><ChevronUp className="size-4 text-neon-cyan" /> Floor Level: {level}/{LEVELS}</span>
        <span className="text-white">Active Multiplier: <span className="font-display font-black text-success">{mult}x</span></span>
      </div>

      <div className="flex-1 flex gap-5 items-center justify-center relative py-2.5">
        {/* Left Side Scoreboard Ladder */}
        <div className="hidden sm:flex flex-col-reverse justify-between h-[360px] text-[10px] font-black text-muted-foreground w-16 border-r border-border/30 pr-3.5">
          {Array.from({ length: LEVELS }).map((_, idx) => {
            const lvl = idx + 1;
            const isCurrentLvl = lvl === level;
            return (
              <div 
                key={lvl} 
                className={`flex justify-between items-center py-0.5 px-1.5 rounded-md transition-colors ${
                  isCurrentLvl ? "text-neon-cyan bg-neon-cyan/15 border border-neon-cyan/20" : ""
                }`}
              >
                <span>F{lvl}</span>
                <span>{getMultiplierForLevel(lvl)}x</span>
              </div>
            );
          })}
        </div>

        {/* Center Vertical Casing Elevator grid */}
        <div className="flex flex-col-reverse gap-2.5 items-center p-4 rounded-3xl bg-background/40 border border-border/60 glass h-[360px] justify-between w-64 md:w-72">
          {Array.from({ length: LEVELS }).map((_, lvl) => {
            const isCurrent = lvl === level && active;
            const wasPlayed = level > lvl;
            const isFuture = lvl > level;
            return (
              <div 
                key={lvl} 
                className={`flex gap-3 p-1.5 rounded-2xl w-full justify-center transition-all ${
                  isCurrent 
                    ? "bg-neon-cyan/10 border border-neon-cyan/35 shadow-[0_0_15px_oklch(0.78_0.18_200/0.15)] animate-pulse" 
                    : "border border-transparent"
                }`}
              >
                {Array.from({ length: COLS }).map((_, c) => {
                  const wasPicked = picked[lvl] === c;
                  const showBomb = !active && bombs[lvl] === c;
                  const canClick = isCurrent;
                  
                  return (
                    <button 
                      key={c} 
                      onClick={() => canClick && pick(c)} 
                      disabled={!canClick}
                      className={`size-11 sm:size-12 rounded-xl border font-bold text-sm transition-all duration-200 flex items-center justify-center ${
                        wasPicked 
                          ? "bg-success/20 border-success text-success scale-95" 
                          : showBomb 
                          ? "bg-destructive/25 border-destructive text-destructive" 
                          : canClick 
                          ? "bg-muted/40 border-border hover:bg-muted/70 hover:border-neon-cyan hover:scale-[1.03] cursor-pointer" 
                          : "bg-muted/10 border-border/20 text-muted-foreground/30"
                      }`}
                    >
                      {wasPicked ? "✓" : showBomb ? "💣" : ""}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        {active ? (
          <button 
            onClick={cashOut} 
            disabled={level === 0} 
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-success to-neon-cyan font-black text-background text-xs uppercase tracking-widest shadow-[var(--shadow-emerald-glow)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
          >
            Cash Out {mult}x
          </button>
        ) : (
          <button 
            onClick={start} 
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-blue font-black text-white text-xs uppercase tracking-widest shadow-[var(--shadow-cyan-glow)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trophy className="size-4 text-neon-gold" /> {dead ? "Try Tower Again" : "Place Tower Bet"}
          </button>
        )}
      </div>
    </div>
  );
}

