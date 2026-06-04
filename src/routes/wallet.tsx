import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Wallet as W } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, type Transaction } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/wallet")({
  head: () => ({ meta: [{ title: "Wallet — FastLuck" }] }),
  component: Wallet,
});

function Wallet() {
  const { user, isAuthenticated, setBalance } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.transactions({ limit: 20 }).then((r) => setTransactions(r.items));
  }, [isAuthenticated, user?.balance]);

  if (!isAuthenticated) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-2xl p-8 mt-12">
          <p className="mb-4 text-muted-foreground">Sign in to view your wallet</p>
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

  const deposit = async (amount: number) => {
    try {
      const res = await api.deposit(amount);
      setBalance(res.balance);
      toast.success(`Deposited $${amount}`);
      const tx = await api.transactions({ limit: 20 });
      setTransactions(tx.items);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deposit failed");
    }
  };

  return (
    <CasinoLayout>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl glass p-8 mb-6 flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-blue grid place-items-center shadow-[var(--shadow-neon)]">
            <W className="size-7" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black">Wallet</h1>
            <p className="text-sm text-muted-foreground">Manage deposits and view transaction history.</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 text-center mb-4">
          <p className="text-xs uppercase text-muted-foreground tracking-wider">Current Balance</p>
          <p className="font-display text-5xl font-black neon-text mt-2">${user!.balance.toFixed(2)}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[100, 250, 500, 1000].map((v) => (
            <button
              key={v}
              onClick={() => deposit(v)}
              className="glass rounded-xl p-4 font-bold hover:scale-[1.02] transition"
            >
              + ${v}
            </button>
          ))}
        </div>
        {transactions.length > 0 && (
          <div className="glass rounded-2xl p-5 mt-4">
            <p className="font-bold mb-3">Transaction History</p>
            {transactions.map((a) => (
              <div key={a._id} className="flex justify-between py-2 border-b border-border last:border-0 text-sm">
                <span>
                  {a.type}
                  {a.game ? ` (${a.game})` : ""}
                </span>
                <span className={a.type === "bet" || a.type === "withdraw" ? "text-destructive" : "text-success"}>
                  {a.type === "bet" || a.type === "withdraw" ? "-" : "+"}${a.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </CasinoLayout>
  );
}
