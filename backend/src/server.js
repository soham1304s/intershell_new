import http from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { app } from "./app.js";
import { config } from "./config.js";

await mongoose.connect(config.mongoUri);
console.log("Connected to MongoDB");

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: config.corsOrigin, credentials: true }
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    socket.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    next(new Error("Authentication required"));
  }
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.id, "User ID:", socket.user.sub);
  socket.join(`user:${socket.user.sub}`);
  if (socket.user.role === "admin") socket.join("admin");
  socket.on("join_conversation", (conversationId) => socket.join(`conversation:${conversationId}`));
  socket.on("typing", ({ conversationId, isTyping }) => {
    socket.to(`conversation:${conversationId}`).emit("typing", { userId: socket.user.sub, isTyping });
  });
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

app.set("io", io);
server.listen(config.port, () => {
  console.log(`Internshell API running at http://localhost:${config.port}`);
});
