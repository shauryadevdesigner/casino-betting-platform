import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useRef, useState } from "react";

export const Route = createFileRoute("/games/slots")({
  head: () => ({ meta: [{ title: "Slots — FastLuck" }] }),
  component: Slots,
});

const SYMBOLS = ["🍒", "🔔", "💎", "7️⃣", "⭐", "🍋"];
const PAYOUTS: Record<string, number> = { "7️⃣": 50, "💎": 20, "⭐": 10, "🔔": 5, "🍒": 3, "🍋": 2 };

function Slots() {
  return <GameShell title="SLOTS" accent="oklch(0.82 0.17 85)" description="Match three symbols to win.">{(api) => <SlotsGame api={api} />}</GameShell>;
}

function SlotsGame({ api }: { api: { placeBet: () => boolean; payout: (m: number) => void; loss: () => void } }) {
  const [reels, setReels] = useState<string[]>(["🍒", "💎", "⭐"]);
  const [spinning, setSpinning] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const intervals = useRef<number[]>([]);

  const spin = () => {
    if (spinning || !api.placeBet()) return;
    setSpinning(true); setMsg("");
    const final = [0, 0, 0].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    intervals.current.forEach((i) => clearInterval(i));
    intervals.current = [0, 1, 2].map((idx) =>
      window.setInterval(() => setReels((r) => { const n = [...r]; n[idx] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]; return n; }), 60)
    );
    [800, 1300, 1800].forEach((t, idx) => setTimeout(() => {
      clearInterval(intervals.current[idx]);
      setReels((r) => { const n = [...r]; n[idx] = final[idx]; return n; });
      if (idx === 2) {
        setSpinning(false);
        if (final[0] === final[1] && final[1] === final[2]) {
          const m = PAYOUTS[final[0]] || 2;
          api.payout(m); setMsg(`JACKPOT! ${m}x`);
        } else if (final[0] === final[1] || final[1] === final[2]) {
          api.payout(1); setMsg("Pair! 1x");
        } else {
          api.loss(); setMsg("");
        }
      }
    }, t));
  };

  return (
    <div className="flex flex-col h-full gap-4 items-center justify-center">
      <div className="flex gap-3 p-6 rounded-2xl bg-gradient-to-b from-neon-gold/20 to-background border-2 border-neon-gold/40 shadow-[0_0_40px_oklch(0.82_0.17_85/0.3)]">
        {reels.map((s, i) => (
          <div key={i} className="size-24 md:size-28 rounded-xl bg-background border border-neon-gold/50 grid place-items-center text-6xl">{s}</div>
        ))}
      </div>
      {msg && <p className="text-2xl font-display font-bold text-neon-gold">{msg}</p>}
      <button onClick={spin} disabled={spinning} className="px-10 py-3 rounded-xl bg-gradient-to-r from-neon-gold to-warning text-background font-bold disabled:opacity-50">{spinning ? "Spinning..." : "Spin"}</button>
      <div className="text-xs text-muted-foreground text-center">7️⃣ 50x • 💎 20x • ⭐ 10x • 🔔 5x • 🍒 3x • 🍋 2x</div>
    </div>
  );
}
