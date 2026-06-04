import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export const Route = createFileRoute("/games/mines")({
  head: () => ({ meta: [{ title: "Mines — FastLuck" }] }),
  component: Mines,
});

function Mines() {
  return (
    <GameShell title="MINES" accent="oklch(0.75 0.2 150)" description="Reveal gems, avoid mines. Cash out anytime.">
      {(ctx) => <MinesGame {...ctx} />}
    </GameShell>
  );
}

const GRID = 25;

function MinesGame({
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
  const [mineCount, setMineCount] = useState(3);
  const [gameId, setGameId] = useState<string | null>(null);
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [active, setActive] = useState(false);
  const [dead, setDead] = useState(false);
  const [mult, setMult] = useState(1);
  const [loading, setLoading] = useState(false);

  const safeRevealed = [...revealed].filter((i) => !mines.has(i)).length;

  const start = async () => {
    if (bet > balance) {
      onBetError("Insufficient balance");
      return;
    }
    setLoading(true);
    try {
      const res = await api.startMines({ betAmount: bet, mineCount });
      setGameId(res.gameId);
      setMines(new Set());
      setRevealed(new Set());
      setActive(true);
      setDead(false);
      setMult(1);
      updateBalance(res.balance);
    } catch (e) {
      onBetError(e instanceof Error ? e.message : "Start failed");
    } finally {
      setLoading(false);
    }
  };

  const reveal = async (i: number) => {
    if (!active || !gameId || revealed.has(i) || loading) return;
    setLoading(true);
    try {
      const res = await api.revealMines(gameId, i);
      const next = new Set(revealed);
      next.add(i);
      setRevealed(next);

      if (res.hitMine) {
        setMines(new Set(res.minePositions ?? []));
        setActive(false);
        setDead(true);
        if (res.balance !== undefined) updateBalance(res.balance);
        toast.error("Hit a mine!");
      } else if (res.multiplier) {
        setMult(res.multiplier);
      }
    } catch (e) {
      onBetError(e instanceof Error ? e.message : "Reveal failed");
    } finally {
      setLoading(false);
    }
  };

  const cashOut = async () => {
    if (!active || !gameId || safeRevealed === 0 || loading) return;
    setLoading(true);
    try {
      const res = await api.cashoutMines(gameId);
      setActive(false);
      updateBalance(res.balance);
      toast.success(`Cashed out $${res.payout.toFixed(2)} at ${res.multiplier}x`);
    } catch (e) {
      onBetError(e instanceof Error ? e.message : "Cashout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between text-sm">
        <span>
          Mines:{" "}
          <select
            disabled={active}
            value={mineCount}
            onChange={(e) => setMineCount(Number(e.target.value))}
            className="bg-input rounded px-2 py-1 ml-1"
          >
            {[1, 3, 5, 10, 15].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </span>
        <span>
          Multiplier: <span className="font-bold text-success">{mult}x</span>
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2 mx-auto">
        {Array.from({ length: GRID }).map((_, i) => {
          const r = revealed.has(i);
          const m = mines.has(i);
          return (
            <button
              key={i}
              onClick={() => reveal(i)}
              disabled={!active || loading}
              className={`size-14 md:size-16 rounded-lg border border-border font-bold text-xl transition-all ${
                r ? (m ? "bg-destructive/30 border-destructive" : "bg-success/20 border-success") : "bg-muted hover:bg-muted/70"
              }`}
            >
              {r ? (m ? "💣" : "💎") : ""}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        {active ? (
          <button
            onClick={cashOut}
            disabled={safeRevealed === 0 || loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-success to-neon-cyan font-bold disabled:opacity-50"
          >
            Cash Out {mult}x
          </button>
        ) : (
          <button
            onClick={start}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-success to-neon-cyan font-bold disabled:opacity-50"
          >
            {loading ? "Starting…" : dead ? "Play Again" : "Place Bet"}
          </button>
        )}
      </div>
    </div>
  );
}
