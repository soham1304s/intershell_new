import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { authRoutes } from "./routes/authRoutes.js";
import { jobRoutes } from "./routes/jobRoutes.js";
import { applicationRoutes } from "./routes/applicationRoutes.js";
import { profileRoutes } from "./routes/profileRoutes.js";
import { aiRoutes } from "./routes/aiRoutes.js";
import { messageRoutes } from "./routes/messageRoutes.js";
import { systemRoutes } from "./routes/systemRoutes.js";

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Internshell API is healthy", data: { time: new Date().toISOString() } });
});
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", aiRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", systemRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: config.nodeEnv === "production" ? "Something went wrong" : error.message
  });
});
