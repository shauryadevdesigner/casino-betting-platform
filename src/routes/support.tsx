import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CasinoLayout } from "@/components/CasinoLayout";
import { LifeBuoy, Search, MessageSquare, Ticket, HelpCircle, ShieldCheck, Clock, Send, Sparkles, User, FileText, CheckCircle, Crown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useWebSocket } from "@/hooks/useWebSocket";
import { api } from "@/lib/api/client";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support Center — FastLuck" },
      { name: "description", content: "Access the FastLuck Support Center. Search FAQs, submit support tickets, track resolutions, and chat live with our VIP Concierge." }
    ]
  }),
  component: SupportPage,
});

type Msg = { _id: string; message: string; isAi?: boolean; createdAt?: string };

const FAQ_DATA = {
  wallet: [
    { q: "How do I deposit funds?", a: "Go to the Wallet page, choose your preferred currency, and copy the personal deposit address or scan the QR code. Preset quick deposit buttons are also available." },
    { q: "What is the withdrawal fee?", a: "Withdrawals are processed with a minor 1% network/handling fee. The final amount you will receive is displayed in the withdrawal calculator." },
    { q: "Are deposits instant?", a: "Yes. Most crypto deposits are credited instantly after 2 block confirmations on the blockchain." }
  ],
  games: [
    { q: "What is Provably Fair?", a: "Each game bet utilizes public server seeds, client seeds, and combined hashes. You can audit and verify the absolute mathematical fairness of every round after it finishes." },
    { q: "My game lagged, did I lose my bet?", a: "No. All settled bets are executed on the backend server. Even if your browser crashes or loses connection, the roll settles securely and payouts are credited." }
  ],
  vip: [
    { q: "How do I level up in the VIP Club?", a: "You level up automatically as your total wagering volume increases. Alternatively, you can purchase VIP tier skip-upgrades on the VIP Lounge page." },
    { q: "What is VIP cashback?", a: "VIP members earn rakeback cashback commissions on every single bet, win or lose. Accrued rakeback can be claimed in the Rewards page." }
  ],
  security: [
    { q: "How do I setup Google 2FA?", a: "Go to your Profile page, select the Security tab, click Enable 2FA, scan the QR code in your authenticator app, and verify the 6-digit TOTP code." },
    { q: "I lost my backup codes, what do I do?", a: "Contact our VIP support team. We will guide you through identity verification steps to securely reset your authenticator." }
  ]
};

type FAQCategory = keyof typeof FAQ_DATA;

function SupportPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeFaqTab, setActiveFaqTab] = useState<FAQCategory>("wallet");
  const [faqSearchQuery, setFaqSearchQuery] = useState("");
  
  // Chat States
  const [messages, setMessages] = useState<Msg[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  // Ticket Form States
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Wallet & Payouts");
  const [ticketPriority, setTicketPriority] = useState("Medium");
  const [ticketDesc, setTicketDesc] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketsList, setTicketsList] = useState<any[]>([
    { id: "FL-9042", subject: "Accrued rakeback inquiry", category: "VIP Club", priority: "Medium", status: "Open", date: "June 4" },
    { id: "FL-8721", subject: "Deposit confirmation request", category: "Wallet", priority: "High", status: "Resolved", date: "May 28" }
  ]);

  const token = typeof localStorage !== "undefined" ? localStorage.getItem("fastluck_token") : null;

  // Real-time chat socket integration
  const { emit } = useWebSocket(token, {
    onNewMessage: (d) => {
      setMessages((m) => [...m, d.message as Msg]);
      setTyping(false);
    },
  });

  const fetchChat = async () => {
    if (!isAuthenticated) return;
    try {
      const r = await api.supportChat();
      setChatId(r.chat._id);
      setMessages(r.messages as Msg[]);
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
  }, [isAuthenticated]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");
    setMessages((m) => [
      ...m,
      { _id: crypto.randomUUID(), message: text, isAi: false },
    ]);
    setTyping(true);
    emit("sendMessage", { chatId, message: text });
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTicket(true);
    setTimeout(() => {
      const newTicket = {
        id: `FL-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: ticketSubject,
        category: ticketCategory,
        priority: ticketPriority,
        status: "Open",
        date: "Today",
      };
      setTicketsList([newTicket, ...ticketsList]);
      setTicketSubject("");
      setTicketDesc("");
      setSubmittingTicket(false);
      toast.success("Support ticket created successfully. Our team will contact you shortly.");
    }, 1000);
  };

  if (!isAuthenticated) {
    return (
      <CasinoLayout>
        <div className="max-w-md mx-auto text-center glass rounded-3xl p-8 mt-12 border border-border">
          <LifeBuoy className="size-14 mx-auto text-neon-pink drop-shadow-[0_0_12px_oklch(0.72_0.28_340/0.4)] mb-4" />
          <h2 className="font-display text-2xl font-black mb-2">Support Center</h2>
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            Please log in to submit tickets, view FAQs, and chat live with our support desk agents.
          </p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold shadow-md hover:opacity-95 transition-all"
          >
            Sign In
          </button>
        </div>
      </CasinoLayout>
    );
  }

  // FAQ Filtering
  const allFAQs = Object.values(FAQ_DATA).flat();
  const searchedFAQs = faqSearchQuery
    ? allFAQs.filter(f => f.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) || f.a.toLowerCase().includes(faqSearchQuery.toLowerCase()))
    : FAQ_DATA[activeFaqTab];

  // VIP Indicator
  const isVip = user?.vipTier === "gold" || user?.vipTier === "platinum";

  return (
    <CasinoLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header Title */}
        <div className="rounded-3xl glass p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-border/60">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center shadow-[var(--shadow-neon)]">
              <LifeBuoy className="size-8 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-black">Support Desk</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Submit help desk tickets, search resources, or chat live with agents.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="glass px-4 py-2 rounded-xl text-xs font-bold border border-border flex items-center gap-1.5 text-success">
              <span className="size-2 rounded-full bg-success animate-pulse" /> Concierge Online
            </span>
          </div>
        </div>

        {/* Priority Banner for VIP Users */}
        {isVip && (
          <div className="rounded-2xl border border-neon-gold bg-gradient-to-r from-neon-gold/15 via-card to-background p-4 flex items-center justify-between shadow-[var(--shadow-glow)]">
            <div className="flex items-center gap-3">
              <Crown className="size-6 text-neon-gold animate-bounce" />
              <div>
                <p className="text-xs font-bold text-neon-gold uppercase tracking-wider">VIP Priority Queue Active</p>
                <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                  As a {user?.vipTier?.toUpperCase()} tier member, your tickets and chats bypass standard queues for response times under 5 minutes.
                </p>
              </div>
            </div>
            <Sparkles className="size-5 text-neon-gold hidden md:block" />
          </div>
        )}

        {/* Dual Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Panel: Ticket Form & FAQ */}
          <div className="space-y-6">
            {/* Knowledge Base & FAQs */}
            <div className="glass rounded-3xl p-6 border border-border/60 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-5 text-neon-cyan" />
                <h3 className="font-display text-lg font-bold tracking-wide">Knowledge Base</h3>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search FAQ articles..."
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  className="w-full bg-input/40 border border-border/60 rounded-xl pl-10 pr-4 py-2 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:bg-input"
                />
              </div>

              {/* FAQ Tabs (Hide if searching) */}
              {!faqSearchQuery && (
                <div className="flex flex-wrap gap-1.5 border-b border-border/30 pb-3">
                  {[
                    { key: "wallet", label: "Wallet & Deposits" },
                    { key: "games", label: "Games Fairness" },
                    { key: "vip", label: "VIP Club" },
                    { key: "security", label: "Security & 2FA" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveFaqTab(tab.key as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition ${
                        activeFaqTab === tab.key
                          ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* FAQ Items */}
              <div className="space-y-3 pt-2">
                {searchedFAQs.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No matching articles found.</p>
                ) : (
                  searchedFAQs.map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border/40 bg-card/20 hover:bg-card/45 transition">
                      <p className="font-bold text-xs md:text-sm text-foreground">{faq.q}</p>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{faq.a}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ticket Submission Form */}
            <div className="glass rounded-3xl p-6 border border-border/60 space-y-4">
              <div className="flex items-center gap-2">
                <Ticket className="size-5 text-neon-pink" />
                <h3 className="font-display text-lg font-bold tracking-wide">Submit Help Ticket</h3>
              </div>

              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Topic Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="mt-1.5 w-full bg-input border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option>Wallet & Payouts</option>
                      <option>Game Fairness</option>
                      <option>VIP Skip upgrades</option>
                      <option>Speakeasy 2FA Setup</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Priority Level</label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      className="mt-1.5 w-full bg-input border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-xs text-muted-foreground font-bold uppercase">Subject Summary</label>
                    <input
                      type="text"
                      placeholder="e.g. Deposit delayed by 1 hour"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="mt-1.5 w-full bg-input border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase">Detailed Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide txn hashes, game round IDs, or detailed logs to expedite resolution."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="mt-1.5 w-full bg-input border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple font-bold text-xs uppercase tracking-wider text-white shadow-md hover:scale-[1.01] transition disabled:opacity-50"
                >
                  {submittingTicket ? "Submitting..." : "Generate Support Ticket"}
                </button>
              </form>
            </div>

            {/* Ticket Logs List */}
            <div className="glass rounded-3xl p-6 border border-border/60 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-neon-gold" />
                <h3 className="font-display text-lg font-bold tracking-wide">Ticket Logs</h3>
              </div>
              <div className="space-y-3">
                {ticketsList.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl border border-border/40 bg-card/25 flex items-center justify-between text-xs hover:border-border transition">
                    <div className="space-y-1">
                      <p className="font-bold text-foreground">
                        [{t.id}] {t.subject}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Category: {t.category} • Priority: <span className={t.priority === "High" ? "text-destructive font-semibold" : ""}>{t.priority}</span> • Created: {t.date}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded font-black uppercase tracking-wider text-[9px] ${
                      t.status === "Open" ? "bg-neon-gold/15 text-neon-gold border border-neon-gold/25" : "bg-success/15 text-success border border-success/25"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Live Support Chat Widget */}
          <aside className="glass rounded-3xl border border-border/60 flex flex-col h-[650px] overflow-hidden sticky top-20">
            {/* Operator header */}
            <div className="p-4 border-b border-border/60 bg-gradient-to-r from-neon-purple/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink grid place-items-center font-bold text-sm text-white relative">
                  <User className="size-5" />
                  <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success border-2 border-background" />
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">FastLuck Support</p>
                  <p className="text-[10px] text-success font-semibold">Concierge Bot (AI Assisted)</p>
                </div>
              </div>
              <LifeBuoy className="size-4 text-muted-foreground/60" />
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {chatLoading ? (
                <p className="text-center text-muted-foreground animate-pulse py-8">Loading connection...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Connection established. Ask any questions about wallet deposits, game fairness, or VIP tiers.
                </p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m._id}
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                      m.isAi
                        ? "bg-card border border-border/50 text-foreground mr-auto rounded-tl-none"
                        : "bg-gradient-to-br from-neon-pink to-neon-purple text-white ml-auto rounded-tr-none shadow-sm"
                    }`}
                  >
                    {m.message}
                  </div>
                ))
              )}
              {typing && (
                <div className="mr-auto bg-card border border-border/30 rounded-2xl rounded-tl-none px-3.5 py-2 text-[10px] text-muted-foreground animate-pulse">
                  Concierge is typing…
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Message input */}
            <div className="p-3 border-t border-border/60 bg-muted/20 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                className="flex-1 bg-input/80 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:bg-input"
              />
              <button
                onClick={sendChatMessage}
                className="size-8.5 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple grid place-items-center text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </CasinoLayout>
  );
}
