import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initSocket } from "./socket/index.js";
import { ensureVipTiersSeeded } from "./services/vip.service.js";
import { fetchAndStoreRates } from "./services/currency.service.js";

async function bootstrap() {
  try {
    await ensureVipTiersSeeded();
    await fetchAndStoreRates().catch(() => {});
  } catch (e) {
    console.warn("⚠️ [DB] Seeding or rate fetching failed:", e.message);
  }

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
  });

  initSocket(io);

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`\n❌ Port ${env.port} is already in use.`);
      console.error(`   Kill the process using it, or set PORT in .env to a different value.\n`);
    } else {
      console.error("Server error:", err);
    }
    process.exit(1);
  });

  server.listen(env.port, () => {
    console.log(`FastLuck API + WebSocket on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
