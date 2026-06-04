import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export const Route = createFileRoute("/games/coinflip")({
  head: () => ({ meta: [{ title: "Coin Flip — FastLuck" }] }),
  component: CoinFlip,
});

function CoinFlip() {
  return (
    <GameShell title="COIN FLIP" accent="oklch(0.82 0.17 85)" description="50/50 chance — double your bet.">
      {(ctx) => <CoinFlipGame {...ctx} />}
    </GameShell>
  );
}

function CoinFlipGame({
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
  const [choice, setChoice] = useState<"heads" | "tails">("heads");
  const [result, setResult] = useState<string | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const play = async () => {
    if (bet > balance) {
      onBetError("Insufficient balance");
      return;
    }
    setLoading(true);
    try {
      const res = await api.playCoinFlip({ betAmount: bet, choice });
      setResult(res.result);
      setWon(res.won);
      updateBalance(res.balance);
      if (res.won) toast.success(`Won $${res.payout.toFixed(2)}!`);
      else toast.error("Wrong side");
    } catch (e) {
      onBetError(e instanceof Error ? e.message : "Play failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 items-center justify-center">
      <div
        className="text-7xl"
        style={{
          filter: won === true ? "drop-shadow(0 0 20px oklch(0.75 0.2 150))" : undefined,
        }}
      >
        {result === "heads" ? "🪙" : result === "tails" ? "🪙" : "?"}
      </div>
      {result && (
        <p className="text-lg font-bold capitalize">
          {result} — {won ? "You won!" : "You lost"}
        </p>
      )}
      <div className="flex gap-3">
        {(["heads", "tails"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setChoice(c)}
            className={`px-6 py-3 rounded-xl font-bold capitalize ${
              choice === c ? "bg-gradient-to-r from-neon-gold to-warning text-background" : "bg-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">2x payout on win</p>
      <button
        onClick={play}
        disabled={loading}
        className="w-full max-w-xs py-3 rounded-xl bg-gradient-to-r from-neon-gold to-warning font-bold text-background disabled:opacity-50"
      >
        {loading ? "Flipping…" : "Flip Coin"}
      </button>
    </div>
  );
}
