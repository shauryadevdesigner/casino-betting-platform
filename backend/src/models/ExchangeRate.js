import mongoose from "mongoose";

const exchangeRateSchema = new mongoose.Schema(
  {
    baseCurrency: { type: String, default: "USD", index: true },
    rates: { type: mongoose.Schema.Types.Mixed, required: true },
    fetchedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

export const ExchangeRate = mongoose.model("ExchangeRate", exchangeRateSchema);
