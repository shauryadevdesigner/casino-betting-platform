import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, ApiError } from "@/lib/auth-context";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — FastLuck" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ username, email, password });
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md glass rounded-3xl p-8">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="size-10 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center">
            <Sparkles className="size-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold">FastLuck</span>
        </div>
        <h1 className="text-xl font-bold text-center mb-6">Create account</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full bg-input rounded-lg px-3 py-2 border border-border"
              required
              minLength={3}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full bg-input rounded-lg px-3 py-2 border border-border"
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-input rounded-lg px-3 py-2 border border-border"
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold disabled:opacity-50"
          >
            {loading ? "Creating…" : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-neon-pink hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
