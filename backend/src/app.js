import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRoutes from "./routes/index.js";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(morgan("dev"));
  app.use(express.json());

  app.use("/api", apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
