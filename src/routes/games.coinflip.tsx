import { createFileRoute } from "@tanstack/react-router";
import { GameShell } from "@/components/GameShell";
import { useState } from "react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { Crown, Diamond, Coins } from "lucide-react";

export const Route = createFileRoute("/games/coinflip")({
  head: () => ({ meta: [{ title: "Coin Flip — FastLuck" }] }),
  component: CoinFlip,
});

function CoinFlip() {
  return (
    <GameShell title="COIN FLIP" accent="oklch(0.82 0.17 85)" description="Choose heads or tails. Double your stake on correct predictions.">
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
  const [rotation, setRotation] = useState(0);

  const play = async () => {
    if (bet > balance) {
      onBetError("Insufficient balance");
      return;
    }
    setLoading(true);
    setWon(null);

    // Spin coin 3D rotation start
    const baseSpins = 5 + Math.floor(Math.random() * 4); // 5 to 8 full spins
    const targetRot = baseSpins * 360;
    setRotation((r) => r + targetRot);

    try {
      const res = await api.playCoinFlip({ betAmount: bet, choice });
      
      // Calculate offset based on final side
      const sideOffset = res.result === "heads" ? 0 : 180;
      setRotation((r) => {
        // Round to nearest full spin plus side offset
        const currentSpin = Math.ceil(r / 360) * 360;
        return currentSpin + sideOffset;
      });

      setTimeout(() => {
        setResult(res.result);
        setWon(res.won);
        updateBalance(res.balance);
        if (res.won) toast.success(`Multiplier Hit! Won $${res.payout.toFixed(2)}`);
        else toast.error("Wrong prediction");
        setLoading(false);
      }, 1000); // Wait for spin completion
    } catch (e) {
      setLoading(false);
      onBetError(e instanceof Error ? e.message : "Play failed");
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 items-center justify-center w-full">
      {/* 3D Coin Casing */}
      <div className="size-40 flex items-center justify-center coin-3d-wrapper relative my-2">
        <div 
          className="size-36 coin-3d transition-transform duration-[1000ms] cubic-bezier(0.25, 1, 0.5, 1)"
          style={{ transform: `rotateY(${rotation}deg)` }}
        >
          {/* Heads Face (Gold Crown) */}
          <div className="coin-face bg-gradient-to-br from-neon-gold via-warning to-neon-gold border-4 border-[#ffe082] flex flex-col items-center justify-center text-background shadow-[0_0_25px_rgba(255,179,0,0.6)]">
            <Crown className="size-14 text-background animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Heads</span>
          </div>
          
          {/* Tails Face (Silver Diamond) */}
          <div className="coin-face coin-back bg-gradient-to-br from-[#e0e0e0] via-[#9e9e9e] to-[#757575] border-4 border-[#ffffff] flex flex-col items-center justify-center text-background shadow-[0_0_25px_rgba(255,255,255,0.4)]">
            <Diamond className="size-14 text-background" />
            <span className="text-[10px] font-black uppercase tracking-widest mt-1">Tails</span>
          </div>
        </div>
      </div>

      {result && (
        <div className="text-center">
          <p className="text-xl font-display font-black tracking-widest capitalize" style={{ color: won ? "oklch(0.75 0.22 145)" : "oklch(0.65 0.25 25)" }}>
            {result} — {won ? "★ Double Payout" : "✖ Lose Stake"}
          </p>
        </div>
      )}

      {/* Choice Selector */}
      <div className="grid grid-cols-2 gap-3.5 w-full max-w-xs">
        {(["heads", "tails"] as const).map((c) => (
          <button
            key={c}
            onClick={() => !loading && setChoice(c)}
            disabled={loading}
            className={`py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all cursor-pointer ${
              choice === c 
                ? c === "heads"
                  ? "bg-gradient-to-r from-neon-gold to-warning text-background border-transparent shadow-[var(--shadow-gold-glow)] scale-[1.03]"
                  : "bg-white text-background border-transparent shadow-[0_0_20px_rgba(255,255,255,0.25)] scale-[1.03]"
                : "bg-muted/40 border-border/80 text-muted-foreground hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Play Trigger */}
      <button
        onClick={play}
        disabled={loading}
        className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-neon-gold to-warning font-black text-background text-sm uppercase tracking-widest shadow-[var(--shadow-gold-glow)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Flipping..." : "Flip Coin"}
      </button>
    </div>
  );
}

