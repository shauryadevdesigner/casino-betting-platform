import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { setSocketIO } from "../services/socket.service.js";
import { registerSocketEvents } from "./events.js";

export function initSocket(io) {
  setSocketIO(io);

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.sub);
      if (!user || !user.isActive || user.isBanned) {
        return next(new Error("Unauthorized"));
      }
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
    registerSocketEvents(io, socket);
  });
}
