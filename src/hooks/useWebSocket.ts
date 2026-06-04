import { useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:4000";

let sharedSocket: Socket | null = null;

export function useWebSocket(
  token: string | null,
  handlers: {
    onBalanceUpdated?: (data: { balance: number }) => void;
    onGameResult?: (data: unknown) => void;
    onLeaderboardUpdate?: () => void;
    onTierUpgrade?: (data: unknown) => void;
    onAffiliateEarningsUpdated?: (data: { affiliateEarnings: number }) => void;
    onNewMessage?: (data: { chatId: string; message: unknown }) => void;
    onMissionCompleted?: (data: unknown) => void;
  } = {},
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const connect = useCallback(() => {
    if (!token) return;
    if (sharedSocket?.connected) return;

    sharedSocket = io(WS_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    sharedSocket.on("balanceUpdated", (d) => handlersRef.current.onBalanceUpdated?.(d));
    sharedSocket.on("gameResult", (d) => handlersRef.current.onGameResult?.(d));
    sharedSocket.on("leaderboardUpdate", () => handlersRef.current.onLeaderboardUpdate?.());
    sharedSocket.on("tierUpgrade", (d) => handlersRef.current.onTierUpgrade?.(d));
    sharedSocket.on("affiliateEarningsUpdated", (d) =>
      handlersRef.current.onAffiliateEarningsUpdated?.(d),
    );
    sharedSocket.on("newMessage", (d) => handlersRef.current.onNewMessage?.(d));
    sharedSocket.on("missionCompleted", (d) => handlersRef.current.onMissionCompleted?.(d));
  }, [token]);

  useEffect(() => {
    connect();
    return () => {
      if (sharedSocket) {
        sharedSocket.removeAllListeners();
        sharedSocket.disconnect();
        sharedSocket = null;
      }
    };
  }, [connect]);

  const emit = useCallback((event: string, data?: unknown) => {
    sharedSocket?.emit(event, data);
  }, []);

  return { socket: sharedSocket, emit };
}
