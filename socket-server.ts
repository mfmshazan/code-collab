import { Server } from "socket.io";

const io = new Server(4000, {
  cors: {
    origin: "*", // Allow connection from your Next.js app
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected to Socket Server on 4000");

  socket.on("code-change", (data) => {
    // Broadcast to everyone else
    socket.broadcast.emit("code-update", data);
  });
});

console.log("> Socket Server ready on port 4000");