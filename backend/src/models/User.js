import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      select: false,
      default: null,
    },
    googleId: { type: String, unique: true, sparse: true, index: true },
    profilePictureUrl: { type: String, default: "" },
    displayName: { type: String, trim: true, maxlength: 32 },
    avatarUrl: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },
    balance: { type: Number, default: 0, min: 0 },
    preferredCurrency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "HKD", "JPY"],
      default: "USD",
    },
    stats: {
      totalBets: { type: Number, default: 0, min: 0 },
      totalWagered: { type: Number, default: 0, min: 0 },
      totalWins: { type: Number, default: 0, min: 0 },
      totalLosses: { type: Number, default: 0, min: 0 },
      gamesPlayed: { type: Number, default: 0, min: 0 },
      biggestWin: { type: Number, default: 0, min: 0 },
      profitLoss: { type: Number, default: 0 },
    },
    vipTier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
      index: true,
    },
    vipTierUpdatedAt: { type: Date, default: null },
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    affiliateEarnings: { type: Number, default: 0, min: 0 },
    affiliateCommissionRate: { type: Number, default: 0.05, min: 0, max: 0.2 },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false, default: null },
    backupCodes: { type: [String], select: false, default: [] },
    adminRole: { type: Boolean, default: false, index: true },
    lastDailyClaimAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.index({ "stats.totalWagered": -1 });
userSchema.index({ "stats.biggestWin": -1 });
userSchema.index({ balance: -1 });

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    displayName: this.displayName || this.username,
    avatarUrl: this.avatarUrl || this.profilePictureUrl,
    profilePictureUrl: this.profilePictureUrl,
    balance: this.balance,
    preferredCurrency: this.preferredCurrency,
    stats: this.stats,
    vipTier: this.vipTier,
    referralCode: this.referralCode,
    affiliateEarnings: this.affiliateEarnings,
    twoFactorEnabled: this.twoFactorEnabled,
    adminRole: this.adminRole,
    lastDailyClaimAt: this.lastDailyClaimAt,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", userSchema);
