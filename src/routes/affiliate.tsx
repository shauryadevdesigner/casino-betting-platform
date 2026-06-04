import { createFileRoute } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { Copy, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/affiliate")({
  head: () => ({ meta: [{ title: "Affiliate — FastLuck" }] }),
  component: AffiliatePage,
});

function AffiliatePage() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof api.affiliateDashboard>> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.affiliateDashboard().then(setData);
  }, [isAuthenticated]);

  const copyCode = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    toast.success("Referral code copied");
  };

  const withdraw = async () => {
    try {
      const r = await api.affiliateWithdraw();
      toast.success(`Withdrawn $${r.amount.toFixed(2)} to wallet`);
      const d = await api.affiliateDashboard();
      setData(d);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Withdraw failed");
    }
  };

  return (
    <CasinoLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="luxury-glass p-8 flex items-center gap-4">
          <Users className="size-10 text-[#e94560]" />
          <div>
            <h1 className="luxury-heading text-3xl">Affiliate Program</h1>
            <p className="text-sm text-muted-foreground">Earn commission on referred player losses.</p>
          </div>
        </div>

        {data && (
          <>
            <div className="luxury-glass p-6 text-center">
              <p className="text-xs uppercase text-muted-foreground">Your referral code</p>
              <p className="font-display text-3xl font-black mt-2 text-[#e94560]">{data.referralCode}</p>
              <button onClick={copyCode} className="mt-4 luxury-btn px-6 py-2 text-sm text-white inline-flex items-center gap-2">
                <Copy className="size-4" /> Copy code
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                Commission rate: {(data.commissionRate * 100).toFixed(0)}%
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="luxury-glass p-4 text-center">
                <p className="text-xs text-muted-foreground">Referrals</p>
                <p className="text-2xl font-bold">{data.totalReferrals}</p>
              </div>
              <div className="luxury-glass p-4 text-center">
                <p className="text-xs text-muted-foreground">Pending earnings</p>
                <p className="text-2xl font-bold text-[#e94560]">${data.affiliateEarnings.toFixed(2)}</p>
              </div>
              <div className="luxury-glass p-4 flex items-center justify-center">
                <button
                  onClick={withdraw}
                  disabled={data.affiliateEarnings <= 0}
                  className="luxury-btn px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  Withdraw to wallet
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </CasinoLayout>
  );
}
