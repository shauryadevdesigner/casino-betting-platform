import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, ApiError } from "@/lib/auth-context";
import { Sparkles, User, Mail, Lock, ArrowRight, ShieldCheck, Zap, Heart, RefreshCw, Gift } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Sign Up — FastLuck" },
      { name: "description", content: "Create your FastLuck casino account. Claim your welcome balance, participate in quests, and get instant withdrawals." }
    ]
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  if (isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error("Please agree to the terms of service and responsible gaming policy.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        displayName: displayName.trim() || undefined,
        referralCode: referralCode.trim() || undefined
      });
      toast.success("Account created successfully! Welcome to FastLuck!");
      navigate({ to: "/" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 200) {
        // Email confirmation required — not a real error
        toast.info(err.message);
        setError(err.message);
      } else {
        setError(err instanceof ApiError ? err.message : "Registration failed. Try a different username/email.");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Background neon blobs */}
      <div className="absolute top-10 left-10 size-96 bg-neon-purple/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 size-96 bg-neon-pink/5 blur-3xl rounded-full pointer-events-none" />

      {/* Left Column: Visual Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-card/40 border-r border-border/50 relative">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center shadow-[var(--shadow-neon)]">
            <Sparkles className="size-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold tracking-wide">FastLuck</span>
        </div>

        <div className="space-y-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-neon-gold/10 text-neon-gold border border-neon-gold/20 tracking-wider flex items-center gap-1.5 w-fit">
            <Gift className="size-4 animate-bounce" /> $1,000 WELCOME BONUS CREDITED
          </span>
          <h2 className="font-display text-4xl xl:text-5xl font-black leading-tight">
            Start your lucky <span className="neon-text">Gaming Journey</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
            Create an account in seconds. Test your strategy on Mines, Dice, Towers, Slots, or Crash. All accounts start with free demo reload credits!
          </p>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex gap-3">
              <ShieldCheck className="size-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Safe & Insured</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Cold storage wallets & full 2FA options.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Zap className="size-5 text-neon-cyan shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Immediate Play</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">No long identity setups required.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground">
          © 2026 FastLuck Gaming. Licensed & Cryptographically Protected.
        </p>
      </div>

      {/* Right Column: Register Card Form */}
      <div className="flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md glass rounded-3xl p-8 border border-border/80 relative shadow-[var(--shadow-glow)] my-8">
          {/* Logo on small screens */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-6">
            <div className="size-9 rounded-lg bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">FastLuck</span>
          </div>

          <div className="space-y-2 text-center mb-6">
            <h1 className="font-display text-2xl font-black">Register Account</h1>
            <p className="text-xs text-muted-foreground">Create your details to claim your welcome credits.</p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="size-3.5" /> Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. LuckyJack"
                  className="w-full bg-input/60 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:bg-input transition"
                  required
                  minLength={3}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="size-3.5" /> Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jack"
                  className="w-full bg-input/60 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:bg-input transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="size-3.5" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jack@example.com"
                className="w-full bg-input/60 border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:bg-input transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="size-3.5" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full bg-input/60 border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:bg-input transition"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="size-3.5" /> Referral Code (Optional)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="e.g. FRIEND20"
                className="w-full bg-input/60 border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:bg-input transition"
              />
            </div>

            {/* Agreements */}
            <label className="flex items-start gap-2.5 cursor-pointer py-1.5">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 size-3.5 accent-neon-pink rounded"
              />
              <span className="text-[10px] text-muted-foreground leading-normal">
                I declare that I am 18 years of age or older, and agree to the terms of service and responsible gambling guidelines.
              </span>
            </label>

            {error && <p className="text-xs text-destructive font-semibold text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold text-xs uppercase tracking-wider text-white shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1.5">
                  <RefreshCw className="size-3.5 animate-spin" /> Initializing Wallet...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  Start Playing <ArrowRight className="size-3.5" />
                </span>
              )}
            </button>
          </form>

          {/* Redirection */}
          <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border/30 pt-4">
            Already registered?{" "}
            <Link to="/login" className="text-neon-pink font-semibold hover:underline">
              Sign in account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
