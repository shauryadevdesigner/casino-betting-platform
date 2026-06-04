import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useEffect, useRef, useState } from "react";

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
    <GameShell title="CRASH" accent="oklch(0.72 0.28 340)" description="Cash out before the rocket explodes.">
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 grid place-items-center rounded-xl bg-gradient-to-b from-neon-purple/10 to-background relative overflow-hidden">
        <div className="text-7xl md:text-8xl font-display font-black transition-all" style={{ color, textShadow: `0 0 30px ${color}` }}>
          {mult.toFixed(2)}x
        </div>
        {state === "crashed" && <p className="absolute bottom-4 text-destructive font-bold">💥 CRASHED</p>}
        {state === "cashed" && <p className="absolute bottom-4 text-success font-bold">✓ Cashed Out @ {mult.toFixed(2)}x</p>}
      </div>
      <div className="mt-4 flex gap-2 flex-wrap">
        {history.map((h, i) => (
          <span key={i} className="px-2 py-1 rounded text-xs font-bold" style={{ background: h < 2 ? "oklch(0.3 0.1 25)" : "oklch(0.3 0.1 320)", color: h < 2 ? "oklch(0.7 0.25 25)" : "oklch(0.8 0.2 320)" }}>{h.toFixed(2)}x</span>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {state === "running" ? (
          <button onClick={cashOut} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-success to-neon-cyan font-bold">Cash Out @ {mult.toFixed(2)}x</button>
        ) : (
          <button onClick={start} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold animate-pulse-glow">Place Bet</button>
        )}
      </div>
    </div>
  );
}
