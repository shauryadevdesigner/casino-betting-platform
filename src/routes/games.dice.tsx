import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export const Route = createFileRoute("/games/dice")({
  head: () => ({ meta: [{ title: "Dice — FastLuck" }] }),
  component: Dice,
});

function Dice() {
  return (
    <GameShell title="DICE" accent="oklch(0.7 0.22 260)" description="Roll under or over the target.">
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
    try {
      const res = await api.playDice({ betAmount: bet, target, mode });
      setRoll(res.roll);
      setWon(res.won);
      updateBalance(res.balance);
      if (res.won) toast.success(`Won $${res.payout.toFixed(2)}!`);
      else toast.error("Better luck next time");
    } catch (e) {
      onBetError(e instanceof Error ? e.message : "Play failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 grid place-items-center">
        <div
          className="text-6xl font-display font-black"
          style={{
            color: won === true ? "oklch(0.75 0.2 150)" : won === false ? "oklch(0.65 0.25 25)" : "oklch(0.7 0.22 260)",
            textShadow: "0 0 30px currentColor",
          }}
        >
          {roll !== null ? roll.toFixed(2) : "—"}
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>0</span>
          <span>Target: {target}</span>
          <span>100</span>
        </div>
        <input
          type="range"
          min={2}
          max={98}
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="w-full accent-[oklch(0.7_0.22_260)]"
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-muted p-2">
          <p className="text-muted-foreground">Multiplier</p>
          <p className="font-bold">{mult}x</p>
        </div>
        <div className="rounded-lg bg-muted p-2">
          <p className="text-muted-foreground">Win Chance</p>
          <p className="font-bold">{winChance}%</p>
        </div>
        <div className="rounded-lg bg-muted p-2 flex items-center justify-center">
          <button onClick={() => setMode(mode === "under" ? "over" : "under")} className="font-bold text-neon-pink">
            Roll {mode === "under" ? "Under" : "Over"} ⇅
          </button>
        </div>
      </div>
      <button
        onClick={play}
        disabled={loading}
        className="py-3 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple font-bold disabled:opacity-50"
      >
        {loading ? "Rolling…" : "Roll Dice"}
      </button>
    </div>
  );
}
