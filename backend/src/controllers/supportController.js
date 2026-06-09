import { supabase } from "../lib/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.js";

export const getOrCreateChat = asyncHandler(async (req, res) => {
  // Find open chat
  let { data: chat, error } = await supabase
    .from("support_chats")
    .select("*")
    .eq("user_id", req.user._id)
    .eq("status", "open")
    .maybeSingle();

  if (error) throw new AppError(error.message, 500);

  if (!chat) {
    const { data: newChat, error: createErr } = await supabase
      .from("support_chats")
      .insert({ user_id: req.user._id, status: "open" })
      .select()
      .single();

    if (createErr) throw new AppError("Failed to create support chat", 500);
    chat = newChat;
  }

  // Fetch recent messages
  const { data: messages, error: msgErr } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("chat_id", chat.id)
    .order("created_at", { ascending: true })
    .limit(100);

  if (msgErr) throw new AppError("Failed to fetch support messages", 500);

  const mappedMessages = (messages || []).map((m) => ({
    _id: m.id,
    chatId: m.chat_id,
    senderId: m.sender_id,
    message: m.message,
    isAi: m.is_ai,
    createdAt: m.created_at,
  }));

  res.json({
    success: true,
    chat: {
      ...chat,
      _id: chat.id,
    },
    messages: mappedMessages,
  });
});

export const rateChat = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  
  const { error } = await supabase
    .from("support_chats")
    .update({ rating, status: "closed" })
    .eq("id", req.params.id)
    .eq("user_id", req.user._id);

  if (error) throw new AppError("Failed to submit rating", 500);

  res.json({ success: true });
});
