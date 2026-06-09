import { supabase } from "../lib/supabase.js";
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

      // Verify Supabase access token
      const { data: { user: authUser }, error } = await supabase.auth.getUser(token);
      if (error || !authUser) {
        return next(new Error("Unauthorized"));
      }

      // Query user profile and wallet balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("*, wallets(balance)")
        .eq("id", authUser.id)
        .single();

      if (!profile || !profile.is_active || profile.is_banned) {
        return next(new Error("Unauthorized"));
      }

      socket.userId = profile.id;
      socket.user = {
        ...profile,
        _id: profile.id, // Legacy compatibility
        balance: Number(profile.wallets?.balance ?? 1000),
      };
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
