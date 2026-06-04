import http from "http";
import { Server } from "socket.io";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { initSocket } from "./socket/index.js";
import { ensureVipTiersSeeded } from "./services/vip.service.js";
import { fetchAndStoreRates } from "./services/currency.service.js";

async function bootstrap() {
  await connectDB();
  await ensureVipTiersSeeded();
  await fetchAndStoreRates().catch(() => {});

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
  });

  initSocket(io);

  server.listen(env.port, () => {
    console.log(`FastLuck API + WebSocket on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
