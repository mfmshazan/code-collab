import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client"; // <--- Import Prisma

const prisma = new PrismaClient(); // <--- Connect to Neon

const io = new Server(4000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", async (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);

    // 1. LOAD FROM POSTGRES
    // Try to find the room in the database
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    // If room exists, send the saved code to the user
    if (room) {
      socket.emit("code-update", room.code);
      console.log(`Loaded saved code for room: ${roomId}`);
    }
  });

  socket.on("code-change", async (data) => {
    const { roomId, code } = data;

    if (roomId && code !== undefined) {
      // Broadcast to others immediately
      socket.to(roomId).emit("code-update", code);

      // 2. SAVE TO POSTGRES
      // "upsert" means: Update if exists, Create if it doesn't.
      try {
        await prisma.room.upsert({
          where: { id: roomId },
          update: { code: code },
          create: { id: roomId, code: code },
        });
      } catch (err) {
        console.error("Error saving to DB:", err);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

console.log("> Socket Server ready on port 4000");