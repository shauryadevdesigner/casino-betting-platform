import { useEffect, useState, useRef } from "react";
import { MessageCircle, X, Minus } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api/client";
import { useWebSocket } from "@/hooks/useWebSocket";

type Msg = { _id: string; message: string; isAi?: boolean; createdAt?: string };

export function SupportChatWidget() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("fastluck_token") : null;

  const { emit } = useWebSocket(token, {
    onNewMessage: (d) => {
      setMessages((m) => [...m, d.message as Msg]);
      setTyping(false);
    },
  });

  useEffect(() => {
    if (!open || !isAuthenticated) return;
    api.supportChat().then((r) => {
      setChatId(r.chat._id);
      setMessages(r.messages as Msg[]);
    });
  }, [open, isAuthenticated]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (!isAuthenticated) return null;

  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [
      ...m,
      { _id: crypto.randomUUID(), message: text, isAi: false },
    ]);
    setTyping(true);
    emit("sendMessage", { chatId, message: text });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="luxury-btn size-14 rounded-full grid place-items-center shadow-lg"
          aria-label="Open support chat"
        >
          <MessageCircle className="size-6 text-white" />
        </button>
      )}
      {open && (
        <div
          className={`luxury-glass w-[340px] flex flex-col transition-all ${minimized ? "h-12" : "h-[420px]"}`}
        >
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <span className="text-sm font-semibold text-[#eaeaea]">VIP Support</span>
            <div className="flex gap-1">
              <button onClick={() => setMinimized(!minimized)} className="p-1 hover:bg-white/10 rounded">
                <Minus className="size-4" />
              </button>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded">
                <X className="size-4" />
              </button>
            </div>
          </div>
          {!minimized && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
                {messages.map((m) => (
                  <div
                    key={m._id}
                    className={`max-w-[85%] px-3 py-2 rounded-lg ${
                      m.isAi ? "bg-[#0f3460] ml-0" : "bg-[#e94560]/30 ml-auto"
                    }`}
                  >
                    {m.message}
                  </div>
                ))}
                {typing && <p className="text-xs text-muted-foreground animate-pulse">AI typing…</p>}
                <div ref={bottomRef} />
              </div>
              <div className="p-2 flex gap-2 border-t border-white/10">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask anything…"
                  className="flex-1 bg-[#16213e] rounded-lg px-3 py-2 text-sm border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#e94560]"
                />
                <button onClick={send} className="luxury-btn px-3 py-2 text-sm font-semibold text-white">
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
