import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4000,
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  jwtSecret: process.env.JWT_SECRET || "fastluck-dev-secret-change-in-production",
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
