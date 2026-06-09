import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, ApiError } from "@/lib/auth-context";
import { Sparkles, Mail, Lock, Key, ArrowRight, ShieldCheck, Zap, Trophy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — FastLuck" },
      { name: "description", content: "Sign in to your FastLuck casino account. Secure logins, Google authentication support, and Google 2FA protection." }
    ]
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, googleLogin, isAuthenticated, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Forgot Password modal simulation
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [sendingForgot, setSendingForgot] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (res: { credential: string }) => {
        setLoading(true);
        setError("");
        try {
          await googleLogin(res.credential);
          toast.success("Successfully logged in via Google!");
          navigate({ to: "/" });
        } catch (err) {
          setError(err instanceof ApiError ? err.message : "Google sign-in failed");
        } finally {
          setLoading(false);
        }
      },
    });
    const el = document.getElementById("google-btn");
    if (el) {
      window.google.accounts.id.renderButton(el, {
        theme: "filled_black",
        size: "large",
        width: 320,
      });
    }
  }, [googleLogin, navigate]);

  if (isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, needs2FA ? otp : undefined);
      toast.success("Welcome back to FastLuck!");
      navigate({ to: "/" });
    } catch (err) {
      if (err instanceof ApiError && err.message === "2FA_REQUIRED") {
        setNeeds2FA(true);
        setError("Enter your 2FA authenticator code");
      } else {
        setError(err instanceof ApiError ? err.message : "Login failed. Check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingForgot(true);
    try {
      await resetPassword(forgotEmail);
      toast.success("Reset password instructions sent to your email.");
      setShowForgot(false);
      setForgotEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email.");
    } finally {
      setSendingForgot(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Background neon blobs */}
      <div className="absolute top-10 left-10 size-96 bg-neon-purple/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 size-96 bg-neon-pink/5 blur-3xl rounded-full pointer-events-none" />

      {/* Left Column: Visual Storytelling Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-card/40 border-r border-border/50 relative">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center shadow-[var(--shadow-neon)]">
            <Sparkles className="size-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold tracking-wide">FastLuck</span>
        </div>

        <div className="space-y-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-neon-gold/10 text-neon-gold border border-neon-gold/20 tracking-wider">
            ★ NEXT-GEN GAMING PLATFORM
          </span>
          <h2 className="font-display text-4xl xl:text-5xl font-black leading-tight">
            Unlock the ultimate <span className="neon-text">Casino Experience</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
            Join a community of players worldwide. Experience zero-delay transactions, provably fair mechanics, and premium rewards.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex gap-3">
              <ShieldCheck className="size-5 text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Provably Fair</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Cryptographically verifiable outcomes.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Zap className="size-5 text-neon-cyan shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Instant Payouts</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Rapid balance processing.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground">
          © 2026 FastLuck Gaming. Licensed & Cryptographically Protected.
        </p>
      </div>

      {/* Right Column: Authentication Card Form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md glass rounded-3xl p-8 border border-border/80 relative shadow-[var(--shadow-glow)]">
          {/* Logo on small screens */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-6">
            <div className="size-9 rounded-lg bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center">
              <Sparkles className="size-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">FastLuck</span>
          </div>

          <div className="space-y-2 text-center mb-8">
            <h1 className="font-display text-2xl font-black">Welcome Back</h1>
            <p className="text-xs text-muted-foreground">Sign in to your player account to start wagering.</p>
          </div>

          {/* Social Sign-in button container */}
          {GOOGLE_CLIENT_ID && !needs2FA && (
            <div className="mb-6 flex flex-col items-center">
              <div id="google-btn" className="w-full max-w-xs overflow-hidden rounded-lg shadow-sm" />
              <div className="relative flex items-center justify-center py-4 w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <span className="relative bg-[#171725] px-3 text-[10px] uppercase font-bold text-muted-foreground/60 tracking-widest z-10">
                  Or use credentials
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            {!needs2FA ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="size-3.5" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-input/60 border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:bg-input transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="size-3.5" /> Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-[10px] text-neon-pink font-semibold hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-input/60 border border-border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:bg-input transition"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3 p-4 border border-neon-gold/30 bg-neon-gold/5 rounded-2xl">
                <p className="text-xs font-bold text-neon-gold flex items-center gap-1.5">
                  <ShieldCheck className="size-4 animate-pulse" /> 2FA Code Required
                </p>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Enter the 6-digit verification code from your Google Authenticator.
                </p>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="size-3.5" /> Authenticator Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code"
                    className="w-full bg-input/80 border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-ring"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            )}

            {error && <p className="text-xs text-destructive font-semibold text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold text-xs uppercase tracking-wider text-white shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-1.5">
                  <RefreshCw className="size-3.5 animate-spin" /> Verifying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  Sign In <ArrowRight className="size-3.5" />
                </span>
              )}
            </button>
          </form>

          {/* Redirection */}
          <div className="mt-8 text-center text-xs text-muted-foreground border-t border-border/30 pt-4">
            New player?{" "}
            <Link to="/register" className="text-neon-pink font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal (Simulation) */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm glass rounded-3xl p-6 border border-border/80 space-y-4">
            <h3 className="font-display text-sm font-bold tracking-wider uppercase flex items-center gap-2">
              <Key className="size-4 text-neon-pink" /> Reset Password
            </h3>
            <p className="text-xs text-muted-foreground leading-normal">
              Enter your registered email address. We'll send instructions and a link to securely reset your credentials.
            </p>
            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full bg-input/60 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                required
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-card transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingForgot}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-xs font-bold text-white shadow-sm"
                >
                  {sendingForgot ? "Sending..." : "Send Instructions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: unknown) => void;
          renderButton: (el: HTMLElement, config: unknown) => void;
        };
      };
    };
  }
}
