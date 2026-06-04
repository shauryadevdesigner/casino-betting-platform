/** @type {import('socket.io').Server | null} */
let io = null;

export function setSocketIO(server) {
  io = server;
}

export function getIO() {
  return io;
}

export function emitToUser(userId, event, payload) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitGlobal(event, payload) {
  if (!io) return;
  io.emit(event, payload);
}

export function emitLeaderboardUpdate(payload) {
  emitGlobal("leaderboardUpdate", payload);
}
