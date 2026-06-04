import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, ApiError } from "@/lib/auth-context";
import { Sparkles } from "lucide-react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — FastLuck" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login, googleLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        try {
          await googleLogin(res.credential);
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

  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, needs2FA ? otp : undefined);
      navigate({ to: "/" });
    } catch (err) {
      if (err instanceof ApiError && err.message === "2FA_REQUIRED") {
        setNeeds2FA(true);
        setError("Enter your 2FA code");
      } else {
        setError(err instanceof ApiError ? err.message : "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1a1a2e]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#16213e]/80 to-[#0f3460]/40 pointer-events-none" />
      <div className="relative w-full max-w-md luxury-glass p-8">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="size-10 rounded-xl bg-gradient-to-br from-[#e94560] to-[#c73e54] grid place-items-center">
            <Sparkles className="size-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-[#eaeaea]">FastLuck</span>
        </div>
        <h1 className="text-xl font-bold text-center mb-6 text-[#eaeaea]">Sign in</h1>

        {GOOGLE_CLIENT_ID && (
          <div className="mb-4 flex justify-center">
            <div id="google-btn" />
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-[#16213e] rounded-lg px-3 py-2 border border-white/10 text-[#eaeaea]"
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-[#16213e] rounded-lg px-3 py-2 border border-white/10 text-[#eaeaea]"
              required
            />
          </div>
          {needs2FA && (
            <div>
              <label className="text-xs text-muted-foreground">2FA code</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 w-full bg-[#16213e] rounded-lg px-3 py-2 border border-white/10"
                placeholder="6-digit code"
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 luxury-btn font-bold text-white disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/register" className="text-[#e94560] hover:underline">
            Register
          </Link>
        </p>
      </div>
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
