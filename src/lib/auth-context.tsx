import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setToken, type PublicUser, ApiError } from "@/lib/api/client";
import { useWebSocket } from "@/hooks/useWebSocket";

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
  logout: () => void;
  refreshUser: () => Promise<void>;
  setBalance: (balance: number) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("fastluck_token") : null;

  const refreshUser = useCallback(async () => {
    const { user: u } = await api.me();
    setUser(u);
  }, []);

  const setBalance = useCallback((balance: number) => {
    setUser((u) => (u ? { ...u, balance } : u));
  }, []);

  useWebSocket(token, {
    onBalanceUpdated: (d) => setBalance(d.balance),
    onTierUpgrade: () => refreshUser().catch(() => {}),
    onAffiliateEarningsUpdated: () => refreshUser().catch(() => {}),
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser()
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [refreshUser, token]);

  const login = useCallback(async (email: string, password: string, otp?: string) => {
    const res = await api.login({ email, password, otp });
    if ("requires2FA" in res && res.requires2FA) {
      throw new ApiError("2FA_REQUIRED", 401);
    }
    if ("token" in res) {
      setToken(res.token);
      setUser(res.user);
    }
  }, []);

  const googleLogin = useCallback(async (idToken: string, referralCode?: string) => {
    const res = await api.googleLogin({ idToken, referralCode });
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (data: {
      username: string;
      email: string;
      password: string;
      displayName?: string;
      referralCode?: string;
    }) => {
      const res = await api.register(data);
      setToken(res.token);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
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
    }),
    [user, loading, login, googleLogin, register, logout, refreshUser, setBalance],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
