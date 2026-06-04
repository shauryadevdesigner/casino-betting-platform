import { ExchangeRate } from "../models/ExchangeRate.js";
import { env } from "../config/env.js";

const SUPPORTED = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "HKD", "JPY"];

const SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  HKD: "HK$",
  JPY: "¥",
};

const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.1,
  AUD: 1.53,
  CAD: 1.36,
  SGD: 1.34,
  HKD: 7.82,
  JPY: 149.5,
};

export function getCurrencySymbol(currency) {
  return SYMBOLS[currency] || currency;
}

export async function getRates() {
  const latest = await ExchangeRate.findOne().sort({ fetchedAt: -1 }).lean();
  if (latest?.rates) return latest.rates;
  return FALLBACK_RATES;
}

export async function convertAmount(amountUsd, toCurrency) {
  if (toCurrency === "USD") return amountUsd;
  const rates = await getRates();
  const rate = rates[toCurrency] ?? FALLBACK_RATES[toCurrency] ?? 1;
  return +(amountUsd * rate).toFixed(2);
}

export async function fetchAndStoreRates() {
  if (!env.openExchangeRatesAppId) {
    await ExchangeRate.findOneAndUpdate(
      { baseCurrency: "USD" },
      { rates: FALLBACK_RATES, fetchedAt: new Date() },
      { upsert: true },
    );
    return FALLBACK_RATES;
  }

  const res = await fetch(
    `https://openexchangerates.org/api/latest.json?app_id=${env.openExchangeRatesAppId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch exchange rates");
  const data = await res.json();
  const rates = { USD: 1 };
  for (const c of SUPPORTED) {
    if (data.rates?.[c]) rates[c] = data.rates[c];
  }
  await ExchangeRate.create({ baseCurrency: "USD", rates, fetchedAt: new Date() });
  return rates;
}

export { SUPPORTED, SYMBOLS };
