import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, History, Copy, Check, Info, ShieldCheck, Lock, Landmark, QrCode } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, type Transaction } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "My Wallet — FastLuck" },
      { name: "description", content: "Manage deposits and withdrawals on FastLuck. Tabbed interface for crypto/fiat transactions, live fees, and detailed transaction history." }
    ]
  }),
  component: Wallet,
});

const CRYPTO_COINS = [
  { key: "BTC", name: "Bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", fee: "0.0001 BTC", min: 10 },
  { key: "ETH", name: "Ethereum", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", fee: "0.002 ETH", min: 20 },
  { key: "USDT", name: "Tether (ERC20)", address: "0x981A7b99a531276F1d1B7401B5f6D8976F32F249", fee: "1 USDT", min: 10 },
  { key: "LTC", name: "Litecoin", address: "LQty2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", fee: "0.001 LTC", min: 5 },
];

function Wallet() {
  const { user, isAuthenticated, setBalance } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw" | "history">("deposit");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copied, setCopied] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(CRYPTO_COINS[0]);
  
  // Deposit States
  const [customDepositAmount, setCustomDepositAmount] = useState("100");
  const [depositing, setDepositing] = useState(false);

  // Withdraw States
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawOtp, setWithdrawOtp] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const tx = await api.transactions({ limit: 50 });
      setTransactions(tx.items);
    } catch (e) {
      console.error("Failed to fetch transactions", e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchTransactions();
  }, [isAuthenticated, user?.balance]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedCoin.address);
    setCopied(true);
    toast.success("Wallet address copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const executeDeposit = async (amount: number) => {
    setDepositing(true);
    try {
      const res = await api.deposit(amount);
      setBalance(res.balance);
      toast.success(`Deposit of $${amount.toFixed(2)} credited successfully!`);
      fetchTransactions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Deposit simulation failed");
    } finally {
      setDepositing(false);
    }
  };

  const executeWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid withdrawal amount");
      return;
    }
    if (!withdrawAddress.trim()) {
      toast.error("Please enter a destination address");
      return;
    }
    if (user && user.balance < amount) {
      toast.error("Insufficient balance");
      return;
    }
    if (user?.twoFactorEnabled && !withdrawOtp.trim()) {
      toast.error("2FA authenticator code is required");
      return;
    }

    setWithdrawing(true);
    try {
      const res = await api.withdraw(amount, withdrawOtp || undefined);
      setBalance(res.balance);
      toast.success(`Withdrawal of $${amount.toFixed(2)} requested successfully!`);
      setWithdrawAmount("");
      setWithdrawOtp("");
      fetchTransactions();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-3xl p-8 mt-12 border border-border">
          <WalletIcon className="size-14 mx-auto text-neon-cyan drop-shadow-[0_0_12px_oklch(0.82_0.18_200/0.4)] mb-4 animate-pulse" />
          <h2 className="font-display text-2xl font-black mb-2">Fintech Wallet</h2>
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            Please log in to manage your deposits, withdrawals, bonus sub-wallets, and history logs.
          </p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold shadow-[var(--shadow-neon)] hover:opacity-95 transition-all"
          >
            Sign In
          </button>
        </div>
      </CasinoLayout>
    );
  }

  // Calculate dynamic estimations
  const calculatedFee = Number(withdrawAmount) ? Math.max(2.0, +(Number(withdrawAmount) * 0.01).toFixed(2)) : 0;
  const netAmount = Number(withdrawAmount) ? Math.max(0, +(Number(withdrawAmount) - calculatedFee).toFixed(2)) : 0;

  // Mock sub-wallets
  const mainBalance = user!.balance;
  const bonusBalance = mainBalance * 0.15; // 15% bonus wallet mock representation
  const cashbackBalance = mainBalance * 0.03; // 3% accrued cashback mock representation

  return (
    <CasinoLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Title Header */}
        <div className="rounded-3xl glass p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-border/60">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-blue grid place-items-center shadow-[var(--shadow-neon)]">
              <WalletIcon className="size-8 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black">Financial Wallet</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Secure deposits, rapid withdrawals, and full transaction history.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success/10 border border-success/20 text-success font-semibold">
              <ShieldCheck className="size-4" /> Secure SSL Connection
            </span>
          </div>
        </div>

        {/* Balance Overview section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Balance Wallet */}
          <div className="glass rounded-3xl p-6 border border-border bg-gradient-to-br from-neon-cyan/15 via-card to-background flex flex-col justify-between min-h-[160px] shadow-[var(--shadow-glow)]">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Main Wallet Balance</p>
              <p className="font-display text-4xl font-black neon-text mt-2">${mainBalance.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border/30 mt-4">
              <span>Currency representation:</span>
              <span className="font-bold text-foreground">USD ($)</span>
            </div>
          </div>

          {/* Bonus Wallet */}
          <div className="glass rounded-3xl p-6 border border-border/60 flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Bonus Wallet</p>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-neon-purple/15 text-neon-purple border border-neon-purple/20">
                  ROLLOVER (5x)
                </span>
              </div>
              <p className="font-display text-3xl font-black text-neon-purple mt-2">${bonusBalance.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border/30 mt-4">
              <span>Wager completion:</span>
              <span className="font-bold text-foreground">35% ($175 / $500)</span>
            </div>
          </div>

          {/* Cashback/Accrued Wallet */}
          <div className="glass rounded-3xl p-6 border border-border/60 flex flex-col justify-between min-h-[160px]">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cashback Wallet</p>
              <p className="font-display text-3xl font-black text-neon-gold mt-2">${cashbackBalance.toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border/30 mt-4">
              <span>Accumulated rebate:</span>
              <span className="font-bold text-success font-display">+{user?.vipTier === "platinum" ? "15%" : "5%"} rate</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border/30">
          {[
            { key: "deposit", label: "Deposit Funds", icon: ArrowDownCircle },
            { key: "withdraw", label: "Withdraw Funds", icon: ArrowUpCircle },
            { key: "history", label: "Transaction Logs", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all tracking-wide ${
                  active
                    ? "border-neon-cyan text-foreground bg-card/20"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/10"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-neon-cyan" : ""}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main tab panel (Left) */}
          <div className="glass rounded-3xl p-6 border border-border/60 min-h-[350px]">
            {activeTab === "deposit" && (
              <div className="space-y-6">
                <h3 className="font-display text-lg font-bold tracking-wide">Select Deposit Method</h3>
                
                {/* Horizontal Coin Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CRYPTO_COINS.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setSelectedCoin(c)}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        selectedCoin.key === c.key
                          ? "border-neon-cyan bg-neon-cyan/10 text-foreground"
                          : "border-border/60 hover:bg-card/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <p className="font-black font-display text-sm tracking-wider">{c.key}</p>
                      <p className="text-[10px] mt-0.5">{c.name}</p>
                    </button>
                  ))}
                </div>

                {/* Crypto Deposit Addresses */}
                <div className="p-5 rounded-2xl border border-border/50 bg-card/30 space-y-4">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Simulated QR Code Box */}
                    <div className="size-28 bg-white p-2 rounded-xl grid place-items-center shrink-0 shadow-md">
                      <QrCode className="size-24 text-background" />
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Your personal {selectedCoin.name} address</p>
                        <div className="flex gap-2 items-center mt-1.5 w-full bg-input/40 border border-border/60 rounded-xl px-3 py-2">
                          <input
                            readOnly
                            value={selectedCoin.address}
                            className="bg-transparent border-0 text-xs w-full focus:outline-none truncate font-mono text-muted-foreground select-all"
                          />
                          <button
                            onClick={handleCopy}
                            className="text-muted-foreground hover:text-foreground p-1 transition-all shrink-0"
                          >
                            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex gap-1.5 items-start">
                        <Info className="size-3.5 text-neon-cyan shrink-0 mt-0.5" />
                        <p>Minimum deposit: {selectedCoin.min} USD equivalent. Network fees apply: {selectedCoin.fee}. Funds credit after 2 blockchain confirmations.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deposit Simulator (Real API Connectivity) */}
                <div className="pt-6 border-t border-border/30 space-y-4">
                  <div className="flex items-center gap-1">
                    <Landmark className="size-4 text-neon-pink" />
                    <h4 className="font-display text-xs font-black uppercase tracking-wider text-muted-foreground">Demo Deposit Simulator</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For demonstration purposes, you can simulate adding funds instantly to your wallet via our demo deposit handler.
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {[50, 100, 250, 500, 1000].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => executeDeposit(preset)}
                        disabled={depositing}
                        className="px-4 py-2 rounded-xl border border-border/80 text-xs font-bold hover:bg-card hover:border-neon-cyan transition-all"
                      >
                        + ${preset}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 max-w-sm">
                    <input
                      type="number"
                      placeholder="Custom Amount"
                      value={customDepositAmount}
                      onChange={(e) => setCustomDepositAmount(e.target.value)}
                      className="bg-input/60 border border-border/80 rounded-xl px-3 py-2 text-xs focus:outline-none w-full"
                    />
                    <button
                      onClick={() => executeDeposit(Number(customDepositAmount))}
                      disabled={depositing || !customDepositAmount || Number(customDepositAmount) <= 0}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue font-bold text-xs uppercase text-white tracking-wider hover:scale-[1.02] transition disabled:opacity-50"
                    >
                      {depositing ? "Crediting..." : "Deposit Now"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "withdraw" && (
              <form onSubmit={executeWithdraw} className="space-y-6">
                <h3 className="font-display text-lg font-bold tracking-wide">Request Payout</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Withdrawal Currency</label>
                    <select className="mt-2 w-full bg-input border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none">
                      <option>USD (Bank wire simulator)</option>
                      <option>BTC (Bitcoin network)</option>
                      <option>ETH (Ethereum network)</option>
                      <option>USDT (ERC-20)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Destination Address / IBAN</label>
                    <input
                      type="text"
                      placeholder="e.g. bc1qxy2kgdygjrsqtzq2..."
                      value={withdrawAddress}
                      onChange={(e) => setWithdrawAddress(e.target.value)}
                      className="mt-2 w-full bg-input border border-border rounded-xl px-3 py-2.5 text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Withdrawal Amount ($)</label>
                    <div className="relative mt-2">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-input border border-border rounded-xl pl-3 pr-16 py-2.5 text-xs focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(String(user?.balance || 0))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-1 bg-muted rounded-md hover:bg-card"
                      >
                        MAX
                      </button>
                    </div>
                  </div>

                  {/* Calculations and receipt */}
                  <div className="p-4 rounded-xl border border-border bg-card/25 text-xs space-y-1.5 flex flex-col justify-center">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Fee (1%):</span>
                      <span className="font-semibold">${calculatedFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/20 pt-1.5">
                      <span className="text-muted-foreground font-bold">Net Amount to Receive:</span>
                      <span className="font-extrabold text-success font-display text-sm">${netAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 2FA input field (conditioned) */}
                {user?.twoFactorEnabled ? (
                  <div className="p-4 border border-neon-gold/30 bg-neon-gold/5 rounded-2xl space-y-3">
                    <p className="text-xs font-bold text-neon-gold flex items-center gap-1.5">
                      <Lock className="size-4 animate-pulse" /> 2FA Verification Required
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      This account has Google 2FA enabled. Enter the 6-digit passcode from your authenticator app to authorize this transaction.
                    </p>
                    <input
                      type="text"
                      placeholder="6-digit TOTP code"
                      value={withdrawOtp}
                      onChange={(e) => setWithdrawOtp(e.target.value)}
                      className="bg-input border border-border/80 rounded-xl px-3 py-2 text-xs font-mono max-w-xs focus:outline-none"
                      maxLength={6}
                      required
                    />
                  </div>
                ) : (
                  <div className="p-4 border border-border/80 bg-muted/30 rounded-2xl text-[10px] text-muted-foreground flex items-start gap-1.5">
                    <Info className="size-4 text-neon-cyan shrink-0 mt-0.5" />
                    <p>No 2FA authenticator is enabled. Withdrawals are processed instantly but we recommend turning on Google 2FA inside Settings to secure your platform payouts.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={withdrawing || !withdrawAmount || Number(withdrawAmount) <= 0}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold text-xs uppercase tracking-wider text-white shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  {withdrawing ? "Processing Payout..." : "Authorize Withdrawal"}
                </button>
              </form>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold tracking-wide">Transaction Logs</h3>
                {transactions.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground text-xs font-semibold">
                    No transactions registered in this wallet. Play games or deposit to generate logs.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border/40 text-muted-foreground uppercase font-bold">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Running Balance</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {transactions.map((t) => {
                          const isNegative = t.type === "bet" || t.type === "withdraw" || (t.type === "adjustment" && t.amount < 0);
                          const amt = Math.abs(t.amount);
                          return (
                            <tr key={t._id} className="hover:bg-card/20 transition-all">
                              <td className="py-3 px-3 text-muted-foreground">
                                {new Date(t.createdAt).toLocaleString()}
                              </td>
                              <td className="py-3 px-3 font-semibold uppercase tracking-wider text-[10px]">
                                {t.type.replace("_", " ")} {t.game ? `(${t.game})` : ""}
                              </td>
                              <td className={`py-3 px-3 font-display font-bold ${isNegative ? "text-destructive" : "text-success"}`}>
                                {isNegative ? "-" : "+"}${amt.toFixed(2)}
                              </td>
                              <td className="py-3 px-3 font-display font-semibold text-muted-foreground">
                                ${t.balanceAfter?.toFixed(2) || "—"}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                  t.type === "withdraw" ? "bg-neon-gold/15 text-neon-gold border border-neon-gold/25" : "bg-success/15 text-success border border-success/25"
                                }`}>
                                  {t.type === "withdraw" ? "Settling" : "Success"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Security/Fintech sidebar */}
          <aside className="space-y-6">
            {/* Wallet Security Overview */}
            <div className="glass rounded-3xl p-5 border border-border/60 space-y-4">
              <h3 className="font-display text-xs font-black uppercase tracking-wider text-muted-foreground">
                Wallet Security
              </h3>
              <div className="flex gap-3 items-start">
                <Lock className="size-5 text-neon-cyan shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Vault Security</p>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                    Your assets are stored in cold wallets with offline cryptographic keys.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start border-t border-border/30 pt-3">
                <ShieldCheck className="size-5 text-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold">Withdrawal Verification</p>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                    All payout operations are analyzed for patterns to prevent theft.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick conversion display */}
            <div className="glass rounded-3xl p-5 border border-border/60 space-y-3">
              <h3 className="font-display text-xs font-black uppercase tracking-wider text-muted-foreground">
                Exchange Estimates
              </h3>
              <div className="divide-y divide-border/20 text-xs">
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">1 BTC</span>
                  <span className="font-bold font-display">$68,542.10</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">1 ETH</span>
                  <span className="font-bold font-display">$3,842.50</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">1 USDT</span>
                  <span className="font-bold font-display">$1.00</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </CasinoLayout>
  );
}
