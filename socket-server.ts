import { config } from "dotenv";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

// Load environment variables
config();

const prisma = new PrismaClient();

const PORT = Number(process.env.PORT) || 4000;

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

interface Participant {
  socketId: string;
  userId: string;
  username: string;
  isHost: boolean;
  canEdit: boolean;
  requestingEdit: boolean;
  color: string;
}

interface RoomState {
  hostToken: string;
  mode: "host-only" | "collaborative";
  participants: Map<string, Participant>;
}

const rooms = new Map<string, RoomState>();

const AVATAR_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ec4899", 
  "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"
];

function getRandomColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // Log all incoming events for debugging
  socket.onAny((eventName, ...args) => {
    console.log(`📨 [${socket.id}] Event: "${eventName}"`, 
      args.length > 0 ? `| Data: ${JSON.stringify(args).substring(0, 100)}...` : "");
  });

  socket.on("join-room", async (payload: string | { roomId: string; username?: string; hostToken?: string; userId?: string }) => {
    const roomId = typeof payload === "string" ? payload : payload.roomId;
    const username = (typeof payload === "object" && payload.username) ? payload.username : `User ${socket.id.substring(0, 4)}`;
    const hostToken = typeof payload === "object" ? payload.hostToken : undefined;
    const userId = (typeof payload === "object" && payload.userId) ? payload.userId : socket.id;

    socket.join(roomId);
    console.log(`🚪 User ${socket.id} (${username}) joined room: ${roomId}`);

    // 1. Get or initialize room state in memory
    let roomState = rooms.get(roomId);
    if (!roomState) {
      // First person to join or creator initializes the room
      const initialHostToken = hostToken || Math.random().toString(36).substring(2, 15);
      roomState = {
        hostToken: initialHostToken,
        mode: "host-only", // Default to host-only for clean classroom management
        participants: new Map(),
      };
      rooms.set(roomId, roomState);
    }

    // Check if any currently connected participant is the host
    const currentActiveHost = Array.from(roomState.participants.values()).find((p) => p.isHost);

    // Determine host:
    // 1. If client provided the matching hostToken -> definitely Host
    // 2. If there is NO active host currently connected in this room -> this user becomes Host!
    let isHost = false;
    if (hostToken && hostToken === roomState.hostToken) {
      isHost = true;
    } else if (!currentActiveHost) {
      isHost = true;
      if (hostToken) {
        roomState.hostToken = hostToken;
      }
    }

    // Determine edit permission: Host always can edit; others depend on room mode
    const canEdit = isHost ? true : roomState.mode === "collaborative";
    const color = getRandomColor(roomState.participants.size);

    const participant: Participant = {
      socketId: socket.id,
      userId,
      username,
      isHost,
      canEdit,
      requestingEdit: false,
      color,
    };

    roomState.participants.set(socket.id, participant);

    // Send full room state to the user who joined (including hostToken if host)
    socket.emit("room-init", {
      isHost,
      hostToken: isHost ? roomState.hostToken : undefined,
      canEdit,
      mode: roomState.mode,
      myParticipant: participant,
      participants: Array.from(roomState.participants.values()),
    });

    // Broadcast updated participant list to everyone in the room
    io.to(roomId).emit("participants-update", Array.from(roomState.participants.values()));

    // 2. LOAD SAVED CODE & LANGUAGE FROM POSTGRES
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      });

      if (room) {
        socket.emit("code-update", room.code);
        socket.emit("language-update", room.language);
        console.log(`✅ Loaded room ${roomId} | Language: ${room.language}`);
      }
    } catch (err) {
      console.error("⚠️ Database unavailable, continuing without saved data:", (err as Error).message);
      socket.emit("code-update", "// Database offline - code not loaded\nconsole.log('Hello World');");
      socket.emit("language-update", "javascript");
    }
  });

  // Handle participant display name update
  socket.on("update-name", ({ roomId, username }: { roomId: string; username: string }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const participant = room.participants.get(socket.id);
    if (participant && username && username.trim()) {
      participant.username = username.trim().substring(0, 30);
      io.to(roomId).emit("participants-update", Array.from(room.participants.values()));
      console.log(`👤 User ${socket.id} renamed to "${participant.username}"`);
    }
  });

  // Student requests edit access (Raise hand)
  socket.on("request-edit-access", ({ roomId }: { roomId: string }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const participant = room.participants.get(socket.id);
    if (participant && !participant.canEdit) {
      participant.requestingEdit = true;
      io.to(roomId).emit("participants-update", Array.from(room.participants.values()));
      io.to(roomId).emit("edit-access-requested", {
        socketId: socket.id,
        username: participant.username,
      });
      console.log(`✋ Edit access requested by ${participant.username} in room ${roomId}`);
    }
  });

  // Host sets edit permission for a participant
  socket.on("set-edit-permission", ({ roomId, targetSocketId, canEdit }: { roomId: string; targetSocketId: string; canEdit: boolean }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const sender = room.participants.get(socket.id);
    if (!sender || !sender.isHost) {
      console.warn(`⛔ Non-host ${socket.id} attempted to change permissions`);
      return;
    }

    const target = room.participants.get(targetSocketId);
    if (target) {
      target.canEdit = canEdit;
      target.requestingEdit = false;
      io.to(targetSocketId).emit("permission-updated", { canEdit });
      io.to(roomId).emit("participants-update", Array.from(room.participants.values()));
      console.log(`🔑 Permission changed for ${target.username}: canEdit=${canEdit}`);
    }
  });

  // Host toggles room mode: "host-only" or "collaborative"
  socket.on("set-room-mode", ({ roomId, mode }: { roomId: string; mode: "host-only" | "collaborative" }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const sender = room.participants.get(socket.id);
    if (!sender || !sender.isHost) {
      console.warn(`⛔ Non-host ${socket.id} attempted to change room mode`);
      return;
    }

    room.mode = mode;
    room.participants.forEach((p) => {
      if (mode === "collaborative") {
        p.canEdit = true;
        p.requestingEdit = false;
        io.to(p.socketId).emit("permission-updated", { canEdit: true });
      } else {
        // In host-only mode, only the host keeps edit access
        if (!p.isHost) {
          p.canEdit = false;
          io.to(p.socketId).emit("permission-updated", { canEdit: false });
        }
      }
    });

    io.to(roomId).emit("room-mode-updated", mode);
    io.to(roomId).emit("participants-update", Array.from(room.participants.values()));
    console.log(`⚙️ Room ${roomId} mode changed to: ${mode}`);
  });

  socket.on("code-change", async (data) => {
    const { roomId, code } = data;

    if (roomId && code !== undefined) {
      const room = rooms.get(roomId);
      const participant = room?.participants.get(socket.id);

      // Verify edit permission before broadcasting or saving
      if (participant && !participant.canEdit) {
        console.warn(`⛔ Blocked unauthorized code-change from ${socket.id} (${participant.username})`);
        return;
      }

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

  // HANDLE LANGUAGE CHANGE
  socket.on("language-change", async (data) => {
    const { roomId, language } = data;
    const room = rooms.get(roomId);
    const participant = room?.participants.get(socket.id);

    // Only allow editors or host to change language
    if (participant && !participant.canEdit) {
      console.warn(`⛔ Blocked unauthorized language-change from ${socket.id}`);
      return;
    }
    
    console.log(`Language changed in room ${roomId} to: ${language}`);
    socket.to(roomId).emit("language-update", language);

    try {
      await prisma.room.upsert({
        where: { id: roomId },
        update: { language: language }, 
        create: { id: roomId, language: language, code: "" }, 
      });
    } catch (err) {
      console.error("Error saving language:", err);
    }
  });
  
  // RUN CODE LISTENER (Using JDoodle API)
  socket.on("run-code", async ({ roomId, language, code }) => {
    console.log(`Running ${language} code for room ${roomId}...`);

    const jdoodleLanguages: Record<string, { language: string; versionIndex: string }> = {
      javascript: { language: "nodejs", versionIndex: "4" },    // Node.js 17.1.0
      python:     { language: "python3", versionIndex: "4" },   // Python 3.10.0
      java:       { language: "java", versionIndex: "4" },      // JDK 17.0.1
      cpp:        { language: "cpp17", versionIndex: "1" },     // GCC 11.1.0
    };

    const runtime = jdoodleLanguages[language] || jdoodleLanguages["javascript"];

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
      
      let output = "";
      if (result.error) {
        output = `Error:\n${result.error}`;
      } else if (result.output) {
        output = result.output;
      } else {
        output = "No output";
      }

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

  // CURSOR MOVEMENT
  socket.on("cursor-move", ({ roomId, cursor }) => {
    const room = rooms.get(roomId);
    const participant = room?.participants.get(socket.id);

    socket.to(roomId).emit("cursor-update", { 
      userId: socket.id, 
      username: participant?.username || `User ${socket.id.substring(0, 4)}`,
      color: participant?.color || "#3b82f6",
      cursor 
    });
  });

  // Allow a participant to claim host if room has no active host
  socket.on("claim-host", ({ roomId }: { roomId: string }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const currentActiveHost = Array.from(room.participants.values()).find((p) => p.isHost);
    if (!currentActiveHost) {
      const p = room.participants.get(socket.id);
      if (p) {
        p.isHost = true;
        p.canEdit = true;
        p.requestingEdit = false;
        socket.emit("host-promoted", { hostToken: room.hostToken });
        io.to(roomId).emit("participants-update", Array.from(room.participants.values()));
        console.log(`👑 User ${p.username} (${socket.id}) claimed host in room ${roomId}`);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    rooms.forEach((roomState, roomId) => {
      if (roomState.participants.has(socket.id)) {
        const p = roomState.participants.get(socket.id);
        const wasHost = p?.isHost;
        roomState.participants.delete(socket.id);
        console.log(`👋 ${p?.username || socket.id} left room ${roomId}`);

        // If the host left and there are remaining participants, promote the first one to host!
        if (wasHost && roomState.participants.size > 0) {
          const nextHost = Array.from(roomState.participants.values())[0];
          nextHost.isHost = true;
          nextHost.canEdit = true;
          nextHost.requestingEdit = false;
          io.to(nextHost.socketId).emit("host-promoted", { hostToken: roomState.hostToken });
          console.log(`👑 Host transferred to ${nextHost.username} in room ${roomId}`);
        }

        io.to(roomId).emit("participants-update", Array.from(roomState.participants.values()));

        if (roomState.participants.size === 0) {
          setTimeout(() => {
            const r = rooms.get(roomId);
            if (r && r.participants.size === 0) {
              rooms.delete(roomId);
              console.log(`🧹 Cleaned up empty room ${roomId}`);
            }
          }, 300000);
        }
      }
    });
  });
});

console.log("\n🚀 Socket Server ready on port 4000");
console.log("📡 Listening for events: join-room, code-change, language-change, run-code, cursor-move\n");