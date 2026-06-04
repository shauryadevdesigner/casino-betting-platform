import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Gift } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/rewards")({
  head: () => ({ meta: [{ title: "Rewards — FastLuck" }] }),
  component: Rewards,
});

function Rewards() {
  const { isAuthenticated, setBalance } = useAuth();
  const navigate = useNavigate();
  const [canClaim, setCanClaim] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(50);
  const [nextClaimAt, setNextClaimAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.dailyStatus().then((s) => {
      setCanClaim(s.canClaim);
      setRewardAmount(s.rewardAmount);
      setNextClaimAt(s.nextClaimAt);
    });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-2xl p-8 mt-12">
          <p className="mb-4 text-muted-foreground">Sign in to claim rewards</p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold"
          >
            Sign in
          </button>
        </div>
      </CasinoLayout>
    );
  }

  const claim = async () => {
    setLoading(true);
    try {
      const res = await api.claimDaily();
      setBalance(res.balance);
      setCanClaim(false);
      setNextClaimAt(res.nextClaimAt);
      toast.success(`Claimed $${res.amount}!`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CasinoLayout>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl glass p-8 mb-6 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center shadow-[var(--shadow-neon)]">
            <Gift className="size-7" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black">Rewards</h1>
            <p className="text-sm text-muted-foreground">Daily bonus — claim once every 24 hours.</p>
          </div>
        </div>
        <div className="glass rounded-xl p-6 max-w-md">
          <p className="font-bold">Daily Login Bonus</p>
          <p className="text-neon-gold font-display text-3xl mt-2">${rewardAmount}</p>
          {!canClaim && nextClaimAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Next claim: {new Date(nextClaimAt).toLocaleString()}
            </p>
          )}
          <button
            onClick={claim}
            disabled={!canClaim || loading}
            className="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-neon-pink to-neon-purple font-semibold disabled:opacity-50"
          >
            {loading ? "Claiming…" : canClaim ? "Claim Daily Reward" : "Already Claimed"}
          </button>
        </div>
      </div>
    </CasinoLayout>
  );
}
