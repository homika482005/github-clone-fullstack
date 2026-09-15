const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup for real-time notifications
const io = new Server(server, {
  cors: {
    origin: "*", // Allows your Vercel frontend to connect
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware
app.use(express.json());
app.use(cors());

// Make Socket.io accessible to your routers
app.set("io", io);

// Routers
const userRouter = require("./routes/user.router");
const repoRouter = require("./routes/repo.router");
const notificationRouter = require("./routes/notification.router");
// Note: Ensure these file names match EXACTLY what is in your /routes folder.
// If you have a pr.router.js or issue.router.js, add them here too.

app.use("/api/users", userRouter);
app.use("/api/repo", repoRouter);
app.use("/api/notifications", notificationRouter);

// Socket.io Connection Logging
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Database Connection and Server Start
// CRITICAL FIX: process.env.PORT is strictly required by Render
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in environment variables.");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server is running and listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
