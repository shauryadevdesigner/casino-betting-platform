import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";

export const Route = createFileRoute("/games/roulette")({
  head: () => ({ meta: [{ title: "Roulette — FastLuck" }] }),
  component: Roulette,
});

function Roulette() {
  return <GameShell title="ROULETTE" accent="oklch(0.7 0.25 25)" description="Bet on red, black, or green.">{(api) => <RouletteGame api={api} />}</GameShell>;
}

const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
type Color = "red" | "black" | "green";
function colorOf(n: number): Color { return n === 0 ? "green" : REDS.has(n) ? "red" : "black"; }

function RouletteGame({ api }: { api: { placeBet: () => boolean; payout: (m: number) => void; loss: () => void } }) {
  const [choice, setChoice] = useState<Color>("red");
  const [result, setResult] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  const spin = () => {
    if (spinning || !api.placeBet()) return;
    setSpinning(true);
    let i = 0;
    const iv = setInterval(() => { setResult(Math.floor(Math.random() * 37)); if (++i > 25) { clearInterval(iv); const n = Math.floor(Math.random() * 37); setResult(n); setSpinning(false); const c = colorOf(n); if (c === choice) api.payout(c === "green" ? 14 : 2); else api.loss(); } }, 80);
  };

  const c = result !== null ? colorOf(result) : null;
  const bg = c === "red" ? "oklch(0.65 0.25 25)" : c === "black" ? "oklch(0.2 0.02 280)" : c === "green" ? "oklch(0.7 0.2 150)" : "var(--muted)";

  return (
    <div className="flex flex-col h-full gap-6 items-center justify-center">
      <div className="size-44 rounded-full grid place-items-center font-display text-6xl font-black border-4 transition-all" style={{ background: bg, borderColor: bg, boxShadow: `0 0 50px ${bg}` }}>
        {result ?? "?"}
      </div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        {(["red", "green", "black"] as const).map((col) => (
          <button key={col} onClick={() => setChoice(col)} className={`py-3 rounded-xl font-bold capitalize border-2 transition-all ${choice === col ? "scale-105" : "opacity-70"}`}
            style={{ background: col === "red" ? "oklch(0.65 0.25 25)" : col === "green" ? "oklch(0.7 0.2 150)" : "oklch(0.2 0.02 280)", borderColor: choice === col ? "white" : "transparent" }}>
            {col} {col === "green" ? "14x" : "2x"}
          </button>
        ))}
      </div>
      <button onClick={spin} disabled={spinning} className="px-10 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-destructive font-bold disabled:opacity-50">{spinning ? "Spinning..." : "Spin Wheel"}</button>
    </div>
  );
}
