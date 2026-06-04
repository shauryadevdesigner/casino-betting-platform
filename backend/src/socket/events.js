import { ChatMessage } from "../models/ChatMessage.js";
import { SupportChat } from "../models/SupportChat.js";
import { getSupportReply } from "../services/support.service.js";
import { emitToUser } from "../services/socket.service.js";

export function registerSocketEvents(io, socket) {
  socket.on("joinTournament", (tournamentId) => {
    if (tournamentId) socket.join(`tournament:${tournamentId}`);
  });

  socket.on("sendMessage", async ({ chatId, message }) => {
    if (!message?.trim()) return;

    let chat = chatId
      ? await SupportChat.findOne({ _id: chatId, userId: socket.userId })
      : await SupportChat.findOne({ userId: socket.userId, status: "open" });

    if (!chat) {
      chat = await SupportChat.create({ userId: socket.userId, status: "open" });
    }

    const userMsg = await ChatMessage.create({
      chatId: chat._id,
      senderId: socket.userId,
      message: message.trim(),
      isAi: false,
    });

    emitToUser(socket.userId, "newMessage", {
      chatId: chat._id,
      message: userMsg,
    });

    io.to(`chat:${chat._id}`).emit("typingIndicator", { typing: true, isAi: true });

    try {
      const reply = await getSupportReply(message.trim(), socket.user);
      const aiMsg = await ChatMessage.create({
        chatId: chat._id,
        message: reply,
        isAi: true,
      });
      emitToUser(socket.userId, "newMessage", {
        chatId: chat._id,
        message: aiMsg,
      });
    } finally {
      io.to(`chat:${chat._id}`).emit("typingIndicator", { typing: false, isAi: true });
    }
  });

  socket.on("joinChat", (chatId) => {
    if (chatId) socket.join(`chat:${chatId}`);
  });
}
