import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

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
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    // If room exists, send BOTH code and language
    if (room) {
      socket.emit("code-update", room.code);
      socket.emit("language-update", room.language); // <--- FIX 1: Send saved language
      console.log(`Loaded room ${roomId} | Language: ${room.language}`);
    }
  });

  socket.on("code-change", async (data) => {
    const { roomId, code } = data;

    if (roomId && code !== undefined) {
      socket.to(roomId).emit("code-update", code);

      try {
        await prisma.room.upsert({
          where: { id: roomId },
          update: { code: code },
          create: { id: roomId, code: code, language: "javascript" },
        });
      } catch (err) {
        console.error("Error saving code:", err);
      }
    }
  });

  // 2. HANDLE LANGUAGE CHANGE (Missing in your code)
  socket.on("language-change", async (data) => {
    const { roomId, language } = data;
    
    console.log(`Language changed in room ${roomId} to: ${language}`);

    // Broadcast to other users in the room so their dropdown updates too
    socket.to(roomId).emit("language-update", language);

    // Save to Database
    try {
      await prisma.room.upsert({
        where: { id: roomId },
        // Update ONLY the language, leave the code alone
        update: { language: language }, 
        // If room doesn't exist, create it with empty code
        create: { id: roomId, language: language, code: "" }, 
      });
    } catch (err) {
      console.error("Error saving language:", err);
    }
  });
  
  // 3. RUN CODE LISTENER (Future-Proof Version)
  socket.on("run-code", async ({ roomId, language, code }) => {
    console.log(`Running ${language} code for room ${roomId}...`);

    // 1. Define ALL supported runtimes now (so you don't have to edit this later)
    const pistonRuntimes: Record<string, { language: string; version: string }> = {
      javascript: { language: "javascript", version: "18.15.0" },
      python:     { language: "python",     version: "3.10.0" },
      java:       { language: "java",       version: "15.0.2" },
      cpp:        { language: "c++",        version: "10.2.0" },
    };

    // 2. Look up the language (or default to JS if the data is weird)
    // This makes it crash-proof if a user somehow sends "ruby"
    const runtime = pistonRuntimes[language] || pistonRuntimes["javascript"];

    try {
      const response = await axios.post("https://emkc.org/api/v2/piston/execute", {
        language: runtime.language,
        version: runtime.version,
        files: [{ content: code }],
      });

      const { run } = response.data;
      
      // 3. Handle Errors (Standard Error) vs Output
      // Piston puts syntax errors (like missing semicolons) in 'stderr'
      const output = run.stderr ? `Error:\n${run.stderr}` : (run.output || "No output");
      
      // Send result back to room
      io.to(roomId).emit("code-output", output);
      
    } catch (error) {
      console.error("Execution failed:", error);
      socket.emit("code-output", "Error: Failed to execute code via Piston API.");
    }
  });

  // 4. CURSOR MOVEMENT
  socket.on("cursor-move", ({ roomId, cursor }) => {
    // Broadcast the cursor position to everyone else
    // We send 'socket.id' so we know WHO is moving
    socket.to(roomId).emit("cursor-update", { 
      userId: socket.id, 
      cursor 
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

console.log("> Socket Server ready on port 4000");