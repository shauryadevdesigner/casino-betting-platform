import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { User, ShieldCheck, Key, BarChart3, Edit3, Settings, ShieldAlert, Copy, Check, QrCode, Award } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — FastLuck" },
      { name: "description", content: "Edit your FastLuck profile. Customize display settings, check wagering stats, and activate secure Google 2FA authenticator." }
    ]
  }),
  component: ProfilePage,
});

const AVATAR_OPTIONS = [
  "⚡", "🛡️", "💎", "🎲", "👑", "🎡", "🪓", "🎩", "🦁", "🦊", "🐉", "🪐"
];

function ProfilePage() {
  const { user, isAuthenticated, refreshUser, setBalance } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "stats">("profile");
  const [displayName, setDisplayName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [stats, setStats] = useState(user?.stats);
  const [saving, setSaving] = useState(false);

  // 2FA Setup States
  const [setupMode, setSetupMode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpToken, setTotpToken] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [verifying2fa, setVerifying2fa] = useState(false);

  // 2FA Disable States
  const [disableToken, setDisableToken] = useState("");
  const [disabling2fa, setDisabling2fa] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setSelectedAvatar(user.avatarUrl || "⚡");
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.stats().then((r) => setStats(r.stats)).catch(err => console.warn("Skip profile stats:", err.message));
  }, [isAuthenticated, user?.balance]);

  if (!isAuthenticated || !user) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-3xl p-8 mt-12 border border-border/80">
          <User className="size-14 mx-auto text-muted-foreground/45 mb-4 animate-pulse" />
          <h2 className="font-display text-2xl font-black mb-2">Access Denied</h2>
          <p className="mb-6 text-sm text-muted-foreground">Sign in to edit your account settings and verify your identity.</p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-neon-pink to-neon-purple font-black uppercase text-xs tracking-widest text-white shadow-md cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </CasinoLayout>
    );
  }

  const saveProfileSettings = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ displayName, avatarUrl: selectedAvatar });
      await refreshUser();
      toast.success("Profile customization saved successfully!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const start2faSetup = async () => {
    try {
      const res = await api.setup2FA();
      if (res.success) {
        setQrCodeUrl(res.qrDataUrl);
        setSecretKey(res.secret);
        setBackupCodes(res.backupCodes || []);
        setSetupMode(true);
      }
    } catch (e) {
      toast.error("Failed to fetch 2FA secret from server");
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpToken.length !== 6) {
      toast.error("Please enter a valid 6-digit authenticator code");
      return;
    }
    setVerifying2fa(true);
    try {
      const res = await api.verify2FA(totpToken);
      if (res.success) {
        toast.success("Two-Factor Authentication is now enabled!");
        await refreshUser();
        setSetupMode(false);
        setTotpToken("");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Invalid verification code");
    } finally {
      setVerifying2fa(false);
    }
  };

  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disableToken.length !== 6) {
      toast.error("Please enter a valid 6-digit authenticator code");
      return;
    }
    setDisabling2fa(true);
    try {
      const res = await api.disable2FA(disableToken);
      if (res.success) {
        toast.success("Two-Factor Authentication has been disabled");
        await refreshUser();
        setDisableToken("");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to disable 2FA");
    } finally {
      setDisabling2fa(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopiedKey(true);
    toast.success("Secret key copied!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopiedCodes(true);
    toast.success("Backup codes copied!");
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  return (
    <CasinoLayout>
      <div className="max-w-6xl mx-auto space-y-7 pb-12">
        {/* Title Header player card */}
        <div
          className="rounded-[32px] glass p-8 flex flex-col md:flex-row items-center gap-6 border border-border/80 relative overflow-hidden"
          style={{ boxShadow: `0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)` }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-neon-purple/5 blur-3xl rounded-full" />

          <div className="size-20 rounded-3xl bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center font-black text-4xl text-white shadow-lg relative border border-white/10 shrink-0">
            {selectedAvatar}
            <span className="absolute -bottom-1 -right-1 text-xs">👑</span>
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left">
            <h1 className="font-display text-3xl font-black text-white tracking-wide truncate">{user.displayName}</h1>
            <p className="text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider flex flex-wrap justify-center md:justify-start items-center gap-2">
              <span>@{user.username}</span>
              <span className="text-border">•</span>
              <span className="text-neon-gold">VIP TIER: {user.vipTier || "Bronze"}</span>
              <span className="text-border">•</span>
              <span>Account ID: {user.id.slice(-6).toUpperCase()}</span>
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border/30 gap-1.5 overflow-x-auto max-w-full">
          {[
            { key: "profile", label: "Profile Customization", icon: Edit3 },
            { key: "security", label: "Security & 2FA", icon: ShieldCheck },
            { key: "stats", label: "Wagering Stats", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); setSetupMode(false); }}
                className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${active
                  ? "border-neon-purple text-white bg-card/25 shadow-sm"
                  : "border-transparent text-muted-foreground hover:text-white hover:bg-card/10"
                  }`}
              >
                <Icon className={`size-4 ${active ? "text-neon-purple" : "text-muted-foreground"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Panel Content */}
          <div className="glass rounded-[32px] p-6 md:p-8 border border-border/60 min-h-[350px]">
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h3 className="font-display text-base font-black uppercase tracking-widest text-white border-b border-border/20 pb-2.5">Account Details</h3>

                <div className="grid md:grid-cols-2 gap-4.5">
                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Display Nickname</label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-input/80 border border-border rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/20 transition-all text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Email Address</label>
                    <input
                      readOnly
                      disabled
                      value={user.email}
                      className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>

                {/* Avatar presets selection */}
                <div className="space-y-3 pt-3">
                  <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest block">Lobby Character Avatar</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2.5">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`aspect-square rounded-2xl border text-2xl grid place-items-center transition-all cursor-pointer ${selectedAvatar === avatar
                          ? "border-neon-purple bg-neon-purple/10 text-white shadow-[var(--shadow-neon)] scale-[1.05]"
                          : "border-border/60 hover:bg-card hover:border-muted-foreground text-muted-foreground"
                          }`}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/20">
                  <button
                    onClick={saveProfileSettings}
                    disabled={saving || !displayName.trim()}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-neon-pink to-neon-purple font-black text-xs uppercase tracking-widest text-white shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
                  >
                    {saving ? "Saving Changes..." : "Save Customization"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="font-display text-base font-black uppercase tracking-widest text-white border-b border-border/20 pb-2.5">Authenticator Settings</h3>

                {user.twoFactorEnabled ? (
                  /* 2FA Disabled Form */
                  <div className="space-y-6">
                    <div className="p-4 border border-success/30 bg-success/5 rounded-2xl flex items-start gap-3.5 text-xs">
                      <ShieldCheck className="size-5.5 text-success shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black text-success uppercase tracking-wider">Google 2FA Protection Active</p>
                        <p className="text-muted-foreground leading-relaxed mt-1 font-semibold">
                          Your payouts and login attempts are fully encrypted. Enter verification passcode below to disable 2FA shield.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleDisable2fa} className="space-y-4 max-w-sm">
                      <div className="space-y-2">
                        <label className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Authenticator Passcode</label>
                        <input
                          type="text"
                          placeholder="6-digit TOTP code"
                          value={disableToken}
                          onChange={(e) => setDisableToken(e.target.value)}
                          className="w-full bg-input/80 border border-border rounded-xl px-4 py-3 text-xs font-mono text-center tracking-[0.4em] focus:outline-none focus:border-destructive text-white"
                          maxLength={6}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={disabling2fa || disableToken.length !== 6}
                        className="px-6 py-3 rounded-2xl bg-destructive text-destructive-foreground font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
                      >
                        {disabling2fa ? "Disabling..." : "Disable 2FA Shield"}
                      </button>
                    </form>
                  </div>
                ) : !setupMode ? (
                  /* Start 2FA setup panel */
                  <div className="space-y-5">
                    <div className="p-4 border border-border/80 bg-muted/20 rounded-2xl flex items-start gap-3.5 text-xs">
                      <ShieldAlert className="size-5.5 text-neon-gold shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <p className="font-black text-white uppercase tracking-wider">Secure your payouts & transfers</p>
                        <p className="text-muted-foreground leading-relaxed mt-1 font-semibold">
                          We recommend activating Google 2FA. Enabling TOTP guarantees only you can authorize wallet withdrawals.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={start2faSetup}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-neon-purple to-neon-blue font-black text-xs uppercase tracking-widest text-white shadow-md hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Setup Google 2FA Shield
                    </button>
                  </div>
                ) : (
                  /* 2FA SETUP WIZARD */
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                      {/* Left: QR Display */}
                      <div className="space-y-4">
                        <div>
                          <p className="font-black text-xs uppercase tracking-wider text-white">1. Scan QR Code</p>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-1">Use Google Authenticator or Authy to scan this token.</p>
                        </div>
                        {qrCodeUrl ? (
                          <div className="size-36 bg-white p-2.5 rounded-2xl grid place-items-center shadow-md border border-border/60">
                            <img src={qrCodeUrl} alt="2FA QR Code" className="size-32" />
                          </div>
                        ) : (
                          <div className="size-36 bg-muted rounded-2xl grid place-items-center border border-border/40">
                            <QrCode className="size-10 text-muted-foreground/30 animate-pulse" />
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Or enter manual key:</p>
                          <div className="flex gap-2 items-center mt-1.5 bg-input border border-border rounded-xl px-3 py-2 max-w-xs">
                            <input readOnly value={secretKey} className="bg-transparent border-0 text-[10px] w-full focus:outline-none truncate text-muted-foreground font-mono" />
                            <button onClick={handleCopySecret} className="text-muted-foreground hover:text-white p-1 shrink-0 cursor-pointer">
                              {copiedKey ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Codes and verifying form */}
                      <div className="space-y-4">
                        <div>
                          <p className="font-black text-xs uppercase tracking-wider text-white">2. Save Backup Codes</p>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-1">Store these safely. You'll need them if you lose access to your device.</p>
                        </div>
                        <div className="p-3.5 bg-muted/20 border border-border/60 rounded-xl space-y-1.5 font-mono text-[10px] text-muted-foreground relative">
                          <button onClick={handleCopyCodes} className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-white p-1 cursor-pointer">
                            {copiedCodes ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                          </button>
                          {backupCodes.map((code, index) => (
                            <div key={index}>{code}</div>
                          ))}
                        </div>

                        <form onSubmit={handleVerify2fa} className="space-y-3.5 pt-4 border-t border-border/30">
                          <div>
                            <p className="font-black text-xs uppercase tracking-wider text-white">3. Enter verification code</p>
                            <input
                              type="text"
                              placeholder="6-digit TOTP code"
                              value={totpToken}
                              onChange={(e) => setTotpToken(e.target.value)}
                              className="mt-2 w-full bg-input/85 border border-border rounded-xl px-3 py-2.5 text-xs font-mono text-center tracking-[0.4em] focus:outline-none focus:border-neon-purple text-white"
                              maxLength={6}
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={verifying2fa || totpToken.length !== 6}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-black text-xs uppercase tracking-widest text-white shadow-md cursor-pointer"
                          >
                            {verifying2fa ? "Verifying..." : "Verify & Enable Shield"}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                <h3 className="font-display text-base font-black uppercase tracking-widest text-white border-b border-border/20 pb-2.5">Wagering Statistics</h3>

                {stats ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4.5 rounded-2xl border border-border/80 bg-card/20 relative overflow-hidden glass hover:scale-[1.01] transition-transform duration-300">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Total Bets Placed</p>
                      <p className="font-display text-3xl font-black text-white mt-1.5">{stats.totalBets}</p>
                    </div>

                    <div className="p-4.5 rounded-2xl border border-border/80 bg-card/20 relative overflow-hidden glass hover:scale-[1.01] transition-transform duration-300">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Total Wager Volume</p>
                      <p className="font-display text-3xl font-black text-neon-cyan drop-shadow-[0_0_8px_oklch(0.78_0.18_200/0.3)] mt-1.5">${stats.totalWagered.toLocaleString()}</p>
                    </div>

                    <div className="p-4.5 rounded-2xl border border-border/80 bg-card/20 relative overflow-hidden glass hover:scale-[1.01] transition-transform duration-300">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Wins / Losses Ratio</p>
                      <p className="font-display text-xl font-black text-foreground mt-2 flex items-baseline gap-1.5">
                        <span className="text-success text-2xl">${stats.totalWins} W</span>
                        <span className="text-muted-foreground text-xs font-semibold">/</span>
                        <span className="text-destructive text-lg">${stats.totalLosses} L</span>
                      </p>
                    </div>

                    <div className="p-4.5 rounded-2xl border border-border/80 bg-card/20 relative overflow-hidden glass hover:scale-[1.01] transition-transform duration-300">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Biggest Winning Payout</p>
                      <p className="font-display text-3xl font-black text-neon-gold drop-shadow-[0_0_8px_rgba(255,179,0,0.3)] mt-1.5">${stats.biggestWin.toFixed(2)}</p>
                    </div>

                    <div className="p-4.5 rounded-2xl border border-border/85 bg-card/20 sm:col-span-2 relative overflow-hidden glass hover:scale-[1.01] transition-transform duration-300">
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Total Profit / Loss</p>
                      <p className={`font-display text-4xl font-black mt-2 ${stats.profitLoss >= 0 ? "text-success drop-shadow-[0_0_8px_rgba(75,255,145,0.3)]" : "text-destructive"}`}>
                        {stats.profitLoss >= 0 ? "+" : ""}${stats.profitLoss.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    Wager data is currently unavailable. Place bets in lobbies to build stats.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Profile side status */}
          <aside className="space-y-6">
            {/* Account Info card */}
            <div className="glass rounded-[32px] p-5 border border-border/80 space-y-4">
              <h3 className="font-display text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/20 pb-2">
                Account Status
              </h3>
              <div className="divide-y divide-border/20 text-xs">
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground font-semibold">Security level:</span>
                  <span className={user.twoFactorEnabled ? "text-success font-black" : "text-neon-gold font-black"}>
                    {user.twoFactorEnabled ? "High (2FA)" : "Medium"}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground font-semibold">Wager limits:</span>
                  <span className="font-black text-white">No limits</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground font-semibold">VIP Status:</span>
                  <span className="font-black text-neon-gold uppercase tracking-wider">{user.vipTier || "Bronze"}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground font-semibold">Joined Lobby:</span>
                  <span className="font-black text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick action card */}
            <div className="glass rounded-[32px] p-5 border border-border/80 text-center space-y-2.5 relative overflow-hidden">
              <Settings className="size-8 mx-auto text-muted-foreground/30" />
              <p className="text-xs font-black uppercase tracking-widest text-white">Responsible Gaming</p>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                Configure wager limits or self-exclusion options inside our support desk if you need assistance.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </CasinoLayout>
  );

}
