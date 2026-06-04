import { connectDB } from "../config/db.js";
import { ensureVipTiersSeeded } from "../services/vip.service.js";
import { fetchAndStoreRates } from "../services/currency.service.js";
import { Tournament } from "../models/Tournament.js";

async function seed() {
  await connectDB();
  await ensureVipTiersSeeded();
  await fetchAndStoreRates();

  const existing = await Tournament.findOne({ status: "active" });
  if (!existing) {
    const start = new Date();
    const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Tournament.create({
      name: "Weekly Championship",
      description: "Top wagerers share the prize pool",
      startTime: start,
      endTime: end,
      prizePool: 250000,
      status: "active",
    });
    console.log("Seeded active tournament");
  }

  console.log("Seed complete");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
