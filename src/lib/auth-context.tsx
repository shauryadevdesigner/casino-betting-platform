import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, setToken, type PublicUser, ApiError } from "@/lib/api/client";
import { useWebSocket } from "@/hooks/useWebSocket";
import { supabase } from "./supabaseClient";

type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, otp?: string) => Promise<void>;
  googleLogin: (idToken: string, referralCode?: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
    referralCode?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setBalance: (balance: number) => void;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapProfileToUser(profile: any): PublicUser {
  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    displayName: profile.display_name || profile.username,
    avatarUrl: profile.avatar_url || profile.profile_picture_url || "",
    profilePictureUrl: profile.profile_picture_url || "",
    balance: Number(profile.wallets?.balance ?? 1000),
    preferredCurrency: profile.preferred_currency || "USD",
    vipTier: profile.vip_tier || "bronze",
    referralCode: profile.referral_code || "",
    affiliateEarnings: Number(profile.affiliate_earnings ?? 0),
    twoFactorEnabled: profile.two_factor_enabled || false,
    adminRole: profile.admin_role || false,
    lastDailyClaimAt: profile.last_daily_claim_at,
    createdAt: profile.created_at,
    stats: profile.stats || {
      totalBets: 0,
      totalWagered: 0,
      totalWins: 0,
      totalLosses: 0,
      gamesPlayed: 0,
      biggestWin: 0,
      profitLoss: 0,
    },
  };
}

/**
 * Fetch a profile + wallet for the given user id.
 * Uses the service-role-like Supabase client, so RLS for the
 * `wallets` table (which only allows `auth.uid() = user_id`) is
 * satisfied as long as the Supabase JS client has a valid session
 * for that same user.  We retry a few times because the DB trigger
 * that creates the profile/wallet runs asynchronously.
 */
async function fetchProfileWithRetry(userId: string, retries = 8, delayMs = 300): Promise<any | null> {
  for (let i = 0; i < retries; i++) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*, wallets(balance)")
      .eq("id", userId)
      .maybeSingle();

    if (profile) return profile;
    if (error) console.warn("[auth] profile fetch attempt", i + 1, error.message);

    // Wait before retrying (the DB trigger may not have completed yet)
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Track whether the register/login flow is actively managing state
  // so the onAuthStateChange listener doesn't race against it.
  const authFlowActiveRef = useRef(false);

  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("fastluck_token") : null;

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const profile = await fetchProfileWithRetry(session.user.id, 3, 200);
    if (profile) {
      setUser(mapProfileToUser(profile));
    }
  }, []);

  const setBalance = useCallback((balance: number) => {
    setUser((u) => (u ? { ...u, balance } : u));
  }, []);

  useWebSocket(token, {
    onBalanceUpdated: (d) => setBalance(d.balance),
    onTierUpgrade: () => refreshUser().catch(() => {}),
    onAffiliateEarningsUpdated: () => refreshUser().catch(() => {}),
  });

  // ──────────────────────────────────────────────────────────────
  // Session Restore + Auth State Listener
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;

        if (session) {
          setToken(session.access_token);
          const profile = await fetchProfileWithRetry(session.user.id, 3, 200);
          if (cancelled) return;
          if (profile) {
            setUser(mapProfileToUser(profile));
          } else {
            // Session exists but no profile — clear state
            setToken(null);
            setUser(null);
          }
        } else {
          setToken(null);
          setUser(null);
        }
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();

    // Listen for Supabase auth state changes (login, logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;

      // If register/login is actively running, let that flow handle state.
      if (authFlowActiveRef.current) return;

      if (event === "SIGNED_OUT" || !session) {
        setToken(null);
        setUser(null);
        return;
      }

      // SIGNED_IN, TOKEN_REFRESHED, etc.
      setToken(session.access_token);
      try {
        const profile = await fetchProfileWithRetry(session.user.id, 5, 300);
        if (cancelled) return;
        if (profile) {
          setUser(mapProfileToUser(profile));
        }
      } catch {
        // Ignore fetch fails on auth event
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Login
  // ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string, otp?: string) => {
    authFlowActiveRef.current = true;
    try {
      // 1. Direct Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) throw new ApiError(error.message, 401);
      if (!data.user || !data.session) throw new ApiError("Login failed", 500);

      setToken(data.session.access_token);

      // 2. Fetch profile to check if 2FA is active
      const profile = await fetchProfileWithRetry(data.user.id, 3, 200);

      if (profile?.two_factor_enabled) {
        if (!otp) {
          // Sign out since 2FA is required and not yet verified
          await supabase.auth.signOut();
          setToken(null);
          throw new ApiError("2FA_REQUIRED", 401);
        }

        try {
          await api.check2FA({ otp });
        } catch (err) {
          // Verify failed, sign out and clear token
          await supabase.auth.signOut();
          setToken(null);
          throw err;
        }
      }

      // Set user state
      if (profile) {
        setUser(mapProfileToUser(profile));
      }
    } finally {
      authFlowActiveRef.current = false;
    }
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Google Login
  // ──────────────────────────────────────────────────────────────
  const googleLogin = useCallback(async (idToken: string, referralCode?: string) => {
    authFlowActiveRef.current = true;
    try {
      // Google logins still use backend Google token exchanging
      const res = await api.googleLogin({ idToken, referralCode });
      setToken(res.token);
      await supabase.auth.setSession({
        access_token: res.token,
        refresh_token: "",
      });
      setUser(res.user);
    } finally {
      authFlowActiveRef.current = false;
    }
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Register
  // ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async (data: {
      username: string;
      email: string;
      password: string;
      displayName?: string;
      referralCode?: string;
    }) => {
      authFlowActiveRef.current = true;
      try {
        // 1. Direct Supabase register
        const { data: authData, error: signupErr } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              username: data.username,
              displayName: data.displayName || data.username,
            },
          },
        });

        if (signupErr) throw new ApiError(signupErr.message, 400);
        if (!authData.user) throw new ApiError("Registration failed", 500);

        // If Supabase requires email confirmation, session will be null.
        // In that case, we still created the user but can't log them in yet.
        if (!authData.session) {
          throw new ApiError(
            "Account created! Please check your email to confirm your address, then sign in.",
            200,
          );
        }

        // Set token — session is available (auto-confirm is ON)
        setToken(authData.session.access_token);

        // 2. Fetch profile created by the DB trigger (with retries)
        let profile = await fetchProfileWithRetry(authData.user.id, 8, 400);

        // Fallback: manually insert profile & wallet if the trigger didn't run
        if (!profile) {
          console.warn("[auth] Profile not created by trigger, inserting manually...");
          const { error: profileErr } = await supabase.from("profiles").insert({
            id: authData.user.id,
            username: data.username,
            email: data.email.toLowerCase(),
            display_name: data.displayName || data.username,
            vip_tier: "bronze",
          });
          if (profileErr) console.warn("[auth] manual profile insert:", profileErr.message);

          const { error: walletErr } = await supabase.from("wallets").insert({
            user_id: authData.user.id,
            balance: 1000.0,
          });
          if (walletErr) console.warn("[auth] manual wallet insert:", walletErr.message);

          // Re-fetch after manual insert
          profile = await fetchProfileWithRetry(authData.user.id, 3, 300);
        }

        // 3. Post-signup referral check on backend (using JWT)
        try {
          await api.postSignup({ referralCode: data.referralCode });
        } catch (err) {
          console.warn("Failed to apply referral code:", err);
        }

        // Re-fetch profile to get any updated values from postSignup
        const { data: finalProfile } = await supabase
          .from("profiles")
          .select("*, wallets(balance)")
          .eq("id", authData.user.id)
          .single();
        profile = finalProfile || profile;

        if (profile) {
          setUser(mapProfileToUser(profile));
        } else {
          // If we still can't find a profile, throw so the UI knows something went wrong
          throw new ApiError("Account created but profile setup failed. Please try logging in.", 500);
        }
      } finally {
        authFlowActiveRef.current = false;
      }
    },
    [],
  );

  // ──────────────────────────────────────────────────────────────
  // Logout
  // ──────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Reset Password
  // ──────────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      googleLogin,
      register,
      logout,
      refreshUser,
      setBalance,
      resetPassword,
    }),
    [user, loading, login, googleLogin, register, logout, refreshUser, setBalance, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
