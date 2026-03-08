import { config } from "dotenv";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

// Load environment variables
config();

const prisma = new PrismaClient();

const io = new Server(4000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Log all incoming events for debugging
  socket.onAny((eventName, ...args) => {
    console.log(`📨 [${socket.id}] Event: "${eventName}"`, 
      args.length > 0 ? `| Data: ${JSON.stringify(args).substring(0, 100)}...` : "");
  });

  socket.on("join-room", async (roomId) => {
    socket.join(roomId);
    console.log(`🚪 User ${socket.id} joined room: ${roomId}`);

    // 1. LOAD FROM POSTGRES (with error handling)
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      });

      // If room exists, send BOTH code and language
      if (room) {
        socket.emit("code-update", room.code);
        socket.emit("language-update", room.language);
        console.log(`✅ Loaded room ${roomId} | Language: ${room.language}`);
      }
    } catch (err) {
      console.error("⚠️ Database unavailable, continuing without saved data:", (err as Error).message);
      // Send default values so app still works
      socket.emit("code-update", "// Database offline - code not loaded\nconsole.log('Hello World');");
      socket.emit("language-update", "javascript");
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
  
  // 3. RUN CODE LISTENER (Using JDoodle API)
  socket.on("run-code", async ({ roomId, language, code }) => {
    console.log(`Running ${language} code for room ${roomId}...`);

    // JDoodle language configurations
    // Docs: https://docs.jdoodle.com/integrating-compiler-ide-to-your-application/languages-and-versions-supported-in-api-and-plugins
    const jdoodleLanguages: Record<string, { language: string; versionIndex: string }> = {
      javascript: { language: "nodejs", versionIndex: "4" },    // Node.js 17.1.0
      python:     { language: "python3", versionIndex: "4" },   // Python 3.10.0
      java:       { language: "java", versionIndex: "4" },      // JDK 17.0.1
      cpp:        { language: "cpp17", versionIndex: "1" },     // GCC 11.1.0
    };

    const runtime = jdoodleLanguages[language] || jdoodleLanguages["javascript"];

    // Get JDoodle credentials from environment variables
    const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID || "";
    const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || "";
    
    if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
      console.error("JDoodle credentials not found in environment variables");
      socket.emit("code-output", "Error: JDoodle API credentials not configured. Please set JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET in .env file.");
      return;
    }

    try {
      const response = await axios.post("https://api.jdoodle.com/v1/execute", {
        script: code,
        language: runtime.language,
        versionIndex: runtime.versionIndex,
        clientId: JDOODLE_CLIENT_ID,
        clientSecret: JDOODLE_CLIENT_SECRET,
      });

      const result = response.data;
      
      // Handle output
      let output = "";
      if (result.error) {
        output = `Error:\n${result.error}`;
      } else if (result.output) {
        output = result.output;
      } else {
        output = "No output";
      }

      // Send result back to entire room
      io.to(roomId).emit("code-output", output);
      
    } catch (error) {
      console.error("Execution failed:", error);
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        socket.emit("code-output", "Error: Rate limit exceeded. Please try again later.");
      } else if (axios.isAxiosError(error) && error.response?.data?.error) {
        socket.emit("code-output", `Error: ${error.response.data.error}`);
      } else {
        socket.emit("code-output", "Error: Failed to execute code. Check server logs.");
      }
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
    console.log("❌ User disconnected:", socket.id);
  });
});

console.log("\n🚀 Socket Server ready on port 4000");
console.log("📡 Listening for events: join-room, code-change, language-change, run-code, cursor-move\n");