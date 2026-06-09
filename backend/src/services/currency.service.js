import { supabase } from "../lib/supabase.js";
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
  const { data: latest } = await supabase
    .from("exchange_rates")
    .select("rates")
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

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
    const { data: existing } = await supabase
      .from("exchange_rates")
      .select("id")
      .eq("base_currency", "USD")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("exchange_rates")
        .update({ rates: FALLBACK_RATES, fetched_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("exchange_rates").insert({
        base_currency: "USD",
        rates: FALLBACK_RATES,
        fetched_at: new Date().toISOString(),
      });
    }
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

  await supabase.from("exchange_rates").insert({
    base_currency: "USD",
    rates,
    fetched_at: new Date().toISOString(),
  });

  return rates;
}

export { SUPPORTED, SYMBOLS };
