import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";

export const Route = createFileRoute("/games/towers")({
  head: () => ({ meta: [{ title: "Towers — FastLuck" }] }),
  component: Towers,
});

function Towers() {
  return <GameShell title="TOWERS" accent="oklch(0.82 0.18 200)" description="Pick a safe tile per level. Climb higher for bigger payouts.">{(api) => <TowersGame api={api} />}</GameShell>;
}

const LEVELS = 8;
const COLS = 3;
function TowersGame({ api }: { api: { placeBet: () => boolean; payout: (m: number) => void; loss: () => void } }) {
  const [bombs, setBombs] = useState<number[]>([]);
  const [picked, setPicked] = useState<(number | null)[]>([]);
  const [level, setLevel] = useState(0);
  const [active, setActive] = useState(false);
  const [dead, setDead] = useState(false);

  const mult = +(Math.pow(COLS / (COLS - 1), level)).toFixed(2);

  const start = () => {
    if (!api.placeBet()) return;
    setBombs(Array.from({ length: LEVELS }, () => Math.floor(Math.random() * COLS)));
    setPicked([]); setLevel(0); setActive(true); setDead(false);
  };

  const pick = (col: number) => {
    if (!active) return;
    const isBomb = bombs[level] === col;
    setPicked((p) => [...p, col]);
    if (isBomb) { setActive(false); setDead(true); api.loss(); return; }
    const nl = level + 1;
    setLevel(nl);
    if (nl === LEVELS) { setActive(false); api.payout(+(Math.pow(COLS / (COLS - 1), nl)).toFixed(2)); }
  };

  const cashOut = () => { if (!active || level === 0) return; setActive(false); api.payout(mult); };

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="text-center text-sm">Level {level} / {LEVELS} • <span className="text-success font-bold">{mult}x</span></div>
      <div className="flex-1 flex flex-col-reverse gap-2 items-center">
        {Array.from({ length: LEVELS }).map((_, lvl) => (
          <div key={lvl} className="flex gap-2">
            {Array.from({ length: COLS }).map((_, c) => {
              const isCurrent = lvl === level && active;
              const wasPicked = picked[lvl] === c;
              const showBomb = !active && bombs[lvl] === c;
              return (
                <button key={c} onClick={() => isCurrent && pick(c)} disabled={!isCurrent}
                  className={`size-12 md:size-14 rounded-lg border font-bold transition-all ${
                    wasPicked ? "bg-success/30 border-success" : showBomb ? "bg-destructive/30 border-destructive" : isCurrent ? "bg-neon-cyan/20 border-neon-cyan animate-pulse" : "bg-muted/30 border-border"
                  }`}>
                  {wasPicked ? "✓" : showBomb ? "💣" : ""}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {active ? (
          <button onClick={cashOut} disabled={level === 0} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-success to-neon-cyan font-bold disabled:opacity-50">Cash Out {mult}x</button>
        ) : (
          <button onClick={start} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue font-bold">{dead ? "Play Again" : "Place Bet"}</button>
        )}
      </div>
    </div>
  );
}
