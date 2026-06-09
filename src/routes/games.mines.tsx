import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { Sparkles, HelpCircle } from "lucide-react";

export const Route = createFileRoute("/games/mines")({
  head: () => ({ meta: [{ title: "Mines — FastLuck" }] }),
  component: Mines,
});

function Mines() {
  return (
    <GameShell title="MINES" accent="oklch(0.75 0.2 150)" description="Uncover valuable gems while dodging hidden mines. Press Cash Out at any stage to secure your multiplier.">
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
        toast.error("BOOM! You hit a mine.");
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
      toast.success(`Cashed out $${res.payout.toFixed(2)} at ${res.multiplier}x multiplier!`);
    } catch (e) {
      onBetError(e instanceof Error ? e.message : "Cashout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30 pb-3">
        <span className="flex items-center gap-2">
          Mine Count:{" "}
          <select
            disabled={active}
            value={mineCount}
            onChange={(e) => setMineCount(Number(e.target.value))}
            className="bg-muted/65 border border-border/80 rounded-lg px-3 py-1.5 focus:outline-none focus:border-neon-pink font-semibold text-white transition-all cursor-pointer"
          >
            {[1, 3, 5, 10, 15, 20].map((n) => (
              <option key={n} value={n} className="bg-background">
                {n} Mines
              </option>
            ))}
          </select>
        </span>
        <span className="flex items-center gap-2">
          Current Profit:{" "}
          <span className="font-display font-black text-sm text-success drop-shadow-[0_0_8px_rgba(75,255,145,0.25)]">
            {(bet * mult).toFixed(2)} USD ({mult.toFixed(2)}x)
          </span>
        </span>
      </div>

      {/* Grid wrapper */}
      <div className="grid grid-cols-5 gap-2.5 max-w-sm sm:max-w-md mx-auto w-full p-4 rounded-3xl bg-background/40 border border-border/60 glass">
        {Array.from({ length: GRID }).map((_, i) => {
          const r = revealed.has(i);
          const m = mines.has(i);
          return (
            <button
              key={i}
              onClick={() => reveal(i)}
              disabled={!active || loading}
              className={`aspect-square rounded-2xl border font-bold text-2xl transition-all duration-300 relative overflow-hidden flex items-center justify-center ${
                r
                  ? m
                    ? "bg-gradient-to-br from-destructive/40 to-destructive/25 border-destructive shadow-[0_0_15px_oklch(0.55_0.22_25/0.4)] scale-95"
                    : "bg-gradient-to-br from-success/30 to-success/15 border-success shadow-[0_0_15px_oklch(0.75_0.22_145/0.4)] scale-95"
                  : "bg-muted/30 border-border/50 hover:bg-muted/65 hover:border-neon-purple hover:-translate-y-0.5 shadow-md active:scale-95 cursor-pointer"
              }`}
            >
              {/* Highlight flash on hover */}
              {!r && <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />}

              {r ? (
                m ? (
                  <span className="drop-shadow-[0_0_8px_rgba(255,75,75,0.6)] animate-bounce text-xl sm:text-2xl">💣</span>
                ) : (
                  <span className="drop-shadow-[0_0_10px_rgba(75,255,145,0.7)] animate-bounce text-xl sm:text-2xl">💎</span>
                )
              ) : active ? (
                <Sparkles className="size-4 text-neon-purple/20 group-hover:text-neon-purple/50" />
              ) : (
                <HelpCircle className="size-4.5 text-muted-foreground/30" />
              )}
            </button>
          );
        })}
      </div>

      {/* Button panel */}
      <div className="flex gap-3 mt-2">
        {active ? (
          <button
            onClick={cashOut}
            disabled={safeRevealed === 0 || loading}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-success to-neon-cyan font-black text-background text-sm uppercase tracking-widest shadow-[var(--shadow-emerald-glow)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed cursor-pointer"
          >
            Cash Out ${(bet * mult).toFixed(2)}
          </button>
        ) : (
          <button
            onClick={start}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-neon-pink to-neon-purple font-black text-white text-sm uppercase tracking-widest shadow-[var(--shadow-neon)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Initializing..." : dead ? "Play Again" : "Place Bet"}
          </button>
        )}
      </div>
    </div>
  );
}

