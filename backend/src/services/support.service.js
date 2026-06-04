import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

let genAI = null;
let model = null;

if (env.geminiApiKey) {
  genAI = new GoogleGenerativeAI(env.geminiApiKey);
  model = genAI.getGenerativeModel({
    model: "gemini-pro",
    systemInstruction:
      "You are FastLuck casino VIP support. Be concise, professional, luxury tone. " +
      "Help with wallet, games (Dice, Mines, Coin Flip, Crash, Roulette, Slots, Towers, Keno), " +
      "VIP tiers, affiliate program, 2FA security, and tournaments. " +
      "Never promise guaranteed wins. Keep responses under 150 words.",
  });
}

const FALLBACK_REPLIES = [
  "Thanks for reaching out! Our team typically responds within a few minutes. How can I help with your account or games?",
  "For deposit issues, check Wallet → Deposit. For game fairness, each bet shows provably fair seeds after completion.",
  "VIP benefits scale with wagering. Visit VIP Club to see your tier progress.",
  "Need help with 2FA? Go to Profile → Security to manage your authenticator setup.",
  "Our affiliate program offers competitive commissions. Check the Affiliate page for your referral code!",
];

export async function getSupportReply(message, user) {
  if (!model) {
    return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
  }

  try {
    const chat = model.startChat({
      history: [],
      generationConfig: { maxOutputTokens: 200 },
    });

    const prompt = `User ${user.displayName} (VIP: ${user.vipTier || "Bronze"}): ${message}`;
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text() || FALLBACK_REPLIES[0];
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
  }
}
