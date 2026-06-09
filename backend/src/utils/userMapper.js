export function userToPublicJSON(profile, balance) {
  if (!profile) return null;

  // Extract balance from joined wallet if balance is not passed directly
  let balanceVal = balance;
  if (balanceVal === undefined || balanceVal === null) {
    if (profile.wallets) {
      balanceVal = Array.isArray(profile.wallets)
        ? profile.wallets[0]?.balance
        : profile.wallets.balance;
    }
    balanceVal = balanceVal ?? profile.balance ?? 1000;
  }

  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    displayName: profile.display_name || profile.username,
    avatarUrl: profile.avatar_url || profile.profile_picture_url,
    profilePictureUrl: profile.profile_picture_url,
    balance: Number(balanceVal),
    preferredCurrency: profile.preferred_currency || "USD",
    stats: profile.stats || {
      totalBets: 0,
      totalWagered: 0,
      totalWins: 0,
      totalLosses: 0,
      gamesPlayed: 0,
      biggestWin: 0,
      profitLoss: 0,
    },
    vipTier: profile.vip_tier || "bronze",
    referralCode: profile.referral_code,
    affiliateEarnings: Number(profile.affiliate_earnings ?? 0),
    twoFactorEnabled: profile.two_factor_enabled || false,
    adminRole: profile.admin_role || false,
    lastDailyClaimAt: profile.last_daily_claim_at,
    createdAt: profile.created_at,
  };
}
