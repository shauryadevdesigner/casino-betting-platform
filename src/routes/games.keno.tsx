import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";

export const Route = createFileRoute("/games/keno")({
  head: () => ({ meta: [{ title: "Keno — FastLuck" }] }),
  component: Keno,
});

function Keno() {
  return <GameShell title="KENO" accent="oklch(0.75 0.2 150)" description="Pick up to 10 numbers from 1–40.">{(api) => <KenoGame api={api} />}</GameShell>;
}

const TOTAL = 40, DRAWS = 10;
const PAYOUT: Record<number, number[]> = {
  1: [0, 3.6], 2: [0, 1, 8], 3: [0, 1, 3, 18], 4: [0, 0.5, 2, 8, 40],
  5: [0, 0.5, 1, 4, 12, 80], 6: [0, 0.4, 1, 2, 8, 25, 200],
  7: [0, 0.3, 1, 1.5, 5, 15, 60, 400], 8: [0, 0.2, 1, 1.5, 3, 8, 25, 100, 800],
  9: [0, 0.2, 1, 1.5, 2, 5, 12, 50, 250, 1000], 10: [0, 0.2, 0.5, 1, 2, 4, 10, 40, 100, 500, 2000],
};

function KenoGame({ api }: { api: { placeBet: () => boolean; payout: (m: number) => void; loss: () => void } }) {
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [drawn, setDrawn] = useState<Set<number>>(new Set());
  const [msg, setMsg] = useState("");

  const toggle = (n: number) => setPicks((p) => { const s = new Set(p); s.has(n) ? s.delete(n) : s.size < 10 && s.add(n); return s; });

  const play = () => {
    if (picks.size === 0 || !api.placeBet()) return;
    const pool = Array.from({ length: TOTAL }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    const d = new Set(pool.slice(0, DRAWS));
    setDrawn(d);
    const hits = [...picks].filter((n) => d.has(n)).length;
    const m = PAYOUT[picks.size]?.[hits] ?? 0;
    setMsg(`${hits} hits → ${m}x`);
    if (m > 0) api.payout(m); else api.loss();
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="text-xs text-center text-muted-foreground">Picks: {picks.size}/10</div>
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => {
          const picked = picks.has(n);
          const hit = drawn.has(n);
          return (
            <button key={n} onClick={() => toggle(n)}
              className={`aspect-square rounded-md text-sm font-bold border transition-all ${
                picked && hit ? "bg-success border-success text-background" :
                hit ? "bg-neon-cyan/30 border-neon-cyan" :
                picked ? "bg-neon-pink/30 border-neon-pink" : "bg-muted border-border hover:bg-muted/70"
              }`}>{n}</button>
          );
        })}
      </div>
      {msg && <p className="text-center font-bold text-neon-gold">{msg}</p>}
      <div className="flex gap-2">
        <button onClick={() => { setPicks(new Set()); setDrawn(new Set()); setMsg(""); }} className="px-4 py-3 rounded-xl bg-muted font-semibold">Clear</button>
        <button onClick={play} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-success to-neon-cyan font-bold">Draw</button>
      </div>
    </div>
  );
}
