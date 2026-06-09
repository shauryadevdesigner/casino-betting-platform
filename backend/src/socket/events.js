import { supabase } from "../lib/supabase.js";
import { getSupportReply } from "../services/support.service.js";
import { emitToUser } from "../services/socket.service.js";

export function registerSocketEvents(io, socket) {
  socket.on("joinTournament", (tournamentId) => {
    if (tournamentId) socket.join(`tournament:${tournamentId}`);
  });

  socket.on("sendMessage", async ({ chatId, message }) => {
    if (!message?.trim()) return;

    let chat = null;

    if (chatId) {
      const { data } = await supabase
        .from("support_chats")
        .select("*")
        .eq("id", chatId)
        .eq("user_id", socket.userId)
        .maybeSingle();
      chat = data;
    } else {
      const { data } = await supabase
        .from("support_chats")
        .select("*")
        .eq("user_id", socket.userId)
        .eq("status", "open")
        .maybeSingle();
      chat = data;
    }

    if (!chat) {
      const { data: newChat } = await supabase
        .from("support_chats")
        .insert({ user_id: socket.userId, status: "open" })
        .select()
        .single();
      chat = newChat;
    }

    // Insert user message in database
    const { data: userMsg } = await supabase
      .from("chat_messages")
      .insert({
        chat_id: chat.id,
        sender_id: socket.userId,
        message: message.trim(),
        is_ai: false,
      })
      .select()
      .single();

    const legacyUserMsg = userMsg ? {
      _id: userMsg.id,
      chatId: userMsg.chat_id,
      senderId: userMsg.sender_id,
      message: userMsg.message,
      isAi: userMsg.is_ai,
      createdAt: userMsg.created_at,
    } : null;

    emitToUser(socket.userId, "newMessage", {
      chatId: chat.id,
      message: legacyUserMsg,
    });

    io.to(`chat:${chat.id}`).emit("typingIndicator", { typing: true, isAi: true });

    try {
      const reply = await getSupportReply(message.trim(), socket.user);
      
      // Insert AI message in database
      const { data: aiMsg } = await supabase
        .from("chat_messages")
        .insert({
          chat_id: chat.id,
          message: reply,
          is_ai: true,
        })
        .select()
        .single();

      const legacyAiMsg = aiMsg ? {
        _id: aiMsg.id,
        chatId: aiMsg.chat_id,
        senderId: aiMsg.sender_id,
        message: aiMsg.message,
        isAi: aiMsg.is_ai,
        createdAt: aiMsg.created_at,
      } : null;

      emitToUser(socket.userId, "newMessage", {
        chatId: chat.id,
        message: legacyAiMsg,
      });
    } finally {
      io.to(`chat:${chat.id}`).emit("typingIndicator", { typing: false, isAi: true });
    }
  });

  socket.on("joinChat", (chatId) => {
    if (chatId) socket.join(`chat:${chatId}`);
  });
}
