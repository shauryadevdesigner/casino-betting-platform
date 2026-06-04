import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/fastluck",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  initialBalance: Number(process.env.INITIAL_BALANCE) || 1000,
  dailyRewardAmount: Number(process.env.DAILY_REWARD_AMOUNT) || 50,
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  sendgridApiKey: process.env.SENDGRID_API_KEY || "",
  senderEmail: process.env.SENDER_EMAIL || "noreply@fastluck.com",
  openExchangeRatesAppId: process.env.OPEN_EXCHANGE_RATES_APP_ID || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  encryptionKey: process.env.ENCRYPTION_KEY || "dev-encryption-key-change-me!!",
};
