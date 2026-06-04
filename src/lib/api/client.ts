const API_BASE = import.meta.env.VITE_API_URL || "/api";

export type PublicUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  profilePictureUrl?: string;
  balance: number;
  preferredCurrency?: string;
  vipTier?: string;
  referralCode?: string;
  affiliateEarnings?: number;
  twoFactorEnabled?: boolean;
  adminRole?: boolean;
  stats: {
    totalBets: number;
    totalWagered: number;
    totalWins: number;
    totalLosses: number;
    gamesPlayed: number;
    biggestWin: number;
    profitLoss: number;
  };
  lastDailyClaimAt: string | null;
  createdAt: string;
};

export type Transaction = {
  _id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  game: string | null;
  createdAt: string;
};

export type LeaderboardEntry = {
  rank: number;
  username: string;
  displayName: string;
  balance: number;
  biggestWin: number;
  gamesPlayed: number;
  vipTier?: string;
  value: number;
};

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken() {
  return localStorage.getItem("fastluck_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("fastluck_token", token);
  else localStorage.removeItem("fastluck_token");
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.message || "Request failed", res.status);
  }
  return data as T;
}

export const api = {
  register: (body: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
    referralCode?: string;
  }) =>
    request<{ success: boolean; token: string; user: PublicUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),

  login: (body: { email: string; password: string; otp?: string }) =>
    request<
      | { success: boolean; token: string; user: PublicUser }
      | { success: boolean; requires2FA: true; userId: string }
    >("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),

  googleLogin: (body: { idToken: string; referralCode?: string }) =>
    request<{ success: boolean; token: string; user: PublicUser }>("/auth/google", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),

  me: () => request<{ success: boolean; user: PublicUser }>("/auth/me"),

  getBalance: () =>
    request<{
      success: boolean;
      balance: number;
      displayBalance?: number;
      currency?: string;
      symbol?: string;
    }>("/wallet/balance"),

  deposit: (amount: number) =>
    request<{ success: boolean; balance: number }>("/wallet/deposit", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  transactions: (params?: { limit?: number; skip?: number }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.skip) q.set("skip", String(params.skip));
    const qs = q.toString();
    return request<{ success: boolean; items: Transaction[]; total: number }>(
      `/wallet/transactions${qs ? `?${qs}` : ""}`,
    );
  },

  updateProfile: (body: {
    displayName?: string;
    avatarUrl?: string;
    preferredCurrency?: string;
  }) =>
    request<{ success: boolean; user: PublicUser }>("/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  playDice: (body: { betAmount: number; target: number; mode: "under" | "over" }) =>
    request<{
      success: boolean;
      roll: number;
      won: boolean;
      payout: number;
      balance: number;
      multiplier: number;
      fairness?: { serverSeed: string; clientSeed: string; combinedHash: string };
    }>("/games/dice/play", { method: "POST", body: JSON.stringify(body) }),

  playCoinFlip: (body: { betAmount: number; choice: "heads" | "tails" }) =>
    request<{
      success: boolean;
      result: string;
      won: boolean;
      payout: number;
      balance: number;
    }>("/games/coinflip/play", { method: "POST", body: JSON.stringify(body) }),

  startMines: (body: { betAmount: number; mineCount: number }) =>
    request<{ success: boolean; gameId: string; balance: number }>("/games/mines/start", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  revealMines: (gameId: string, tileIndex: number) =>
    request<{
      success: boolean;
      hitMine: boolean;
      gameOver: boolean;
      minePositions?: number[];
      multiplier?: number;
      balance?: number;
    }>(`/games/mines/${gameId}/reveal`, {
      method: "POST",
      body: JSON.stringify({ tileIndex }),
    }),

  cashoutMines: (gameId: string) =>
    request<{
      success: boolean;
      payout: number;
      multiplier: number;
      balance: number;
    }>(`/games/mines/${gameId}/cashout`, { method: "POST" }),

  affiliateDashboard: () =>
    request<{
      success: boolean;
      referralCode: string;
      affiliateEarnings: number;
      commissionRate: number;
      referrals: unknown[];
      commissions: unknown[];
      totalReferrals: number;
    }>("/affiliate/dashboard"),

  affiliateWithdraw: () =>
    request<{ success: boolean; amount: number }>("/affiliate/withdraw", { method: "POST" }),

  vipTiers: () =>
    request<{
      success: boolean;
      currentTier: string;
      totalWagered: number;
      tiers: unknown[];
      progressToNext: number;
      next: unknown;
    }>("/vip/tiers"),

  missions: () => request<{ success: boolean; missions: unknown[] }>("/missions"),

  claimMission: (id: string) =>
    request<{ success: boolean; reward: number; balance: number }>(`/missions/${id}/claim`, {
      method: "POST",
    }),

  tournamentActive: () =>
    request<{ success: boolean; tournament: unknown; leaderboard: unknown[]; myRank: number | null }>(
      "/tournaments/active",
    ),

  supportChat: () =>
    request<{ success: boolean; chat: { _id: string }; messages: unknown[] }>("/support/chat"),

  setup2FA: () =>
    request<{ success: boolean; qrDataUrl: string; secret: string; backupCodes: string[] }>(
      "/auth/2fa/setup",
      { method: "POST" },
    ),

  verify2FA: (token: string) =>
    request<{ success: boolean }>("/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  leaderboard: (
    sort: "balance" | "biggestWin" | "gamesPlayed" | "wagered" = "balance",
  ) =>
    request<{ success: boolean; leaderboard: LeaderboardEntry[]; sort: string }>(
      `/leaderboard?sort=${sort}`,
      { auth: false },
    ),

  stats: () =>
    request<{
      success: boolean;
      stats: PublicUser["stats"];
    }>("/stats/me"),

  dailyStatus: () =>
    request<{
      success: boolean;
      canClaim: boolean;
      rewardAmount: number;
      nextClaimAt: string | null;
    }>("/rewards/daily/status"),

  claimDaily: () =>
    request<{
      success: boolean;
      amount: number;
      balance: number;
      nextClaimAt: string;
    }>("/rewards/daily/claim", { method: "POST" }),
};

export { ApiError };
