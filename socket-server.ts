import { Server } from "socket.io";

const io = new Server(4000, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 1. Join a specific room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // 2. Handle code changes ONLY for that room
  socket.on("code-change", ({ roomId, code }) => {
    // Broadcast to everyone in the room EXCEPT the sender
    socket.to(roomId).emit("code-update", code);
  });
});

console.log("> Socket Server ready on port 4000");