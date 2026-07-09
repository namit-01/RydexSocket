import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import User from "./models/user.Model.js";

dotenv.config();

const port = process.env.PORT || 5000;
const mongoUrl = process.env.MONGODB_URL;

const connectDb = async () => {
  try {
    await mongoose.connect(mongoUrl);
    console.log("db connected");
  } catch (err) {
    console.error("Database connection error:", err);
  }
};

const app = express();
app.use(express.json());
const server = http.createServer(app);
console.log("NEXT_BASE_URL =", process.env.NEXT_BASE_URL);

const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.post("/emit", async (req, res) => {
  try {
    const { userId, event, data } = req.body;
    const user = await User.findById(userId);
    if (user.socketId) {
      io.to(user.socketId).emit(event, data);
    }
    return res.json({ succes: true });
  } catch {
    return res.json({ succes: false });
  }
});
app.get("/test", (req, res) => {
  console.log("HTTP request received");
  res.send("OK");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("identity", async (data) => {
    try {
      console.log("Identity received:", data);
  console.log("Socket ID:", socket.id);

  const user = await User.findById(data.userId);
  console.log("User:", user);

  if (!user) {
    console.log("User not found");
    return;
  }

  user.socketId = socket.id;
  user.isOnline = true;

  await user.save();

  console.log("Saved:", user.socketId);

      await user.save();
    } catch (err) {
      console.error("Identity Error:", err);
    }
  });

  socket.on("update-location", async (data) => {
    try {
      const user = await User.findById(data.userId);

      if (!user) {
        console.log("User not found");
        return;
      }

      user.location = {
        type: "Point",
        coordinates: [data.lon, data.lat],
      };

      await user.save();
    } catch (err) {
      console.error("Update Location Error:", err);
    }
  });

  socket.on("disconnect", async () => {
    try {
      if (!socket.userId) return;

      const user = await User.findById(socket.userId);

      if (!user) {
        console.log("User not found");
        return;
      }

      user.socketId = null;
      user.isOnline = false;

      await user.save();

      console.log("Client disconnected:", socket.id);
    } catch (err) {
      console.error("Disconnect Error:", err);
    }
  });

  socket.on("error", (err) => {
    console.error("Socket Error:", err);
  });
});

server.listen(port, async () => {
  try {
    await connectDb();
    console.log(`Socket server started on port ${port}`);
  } catch (err) {
    console.error("Server Startup Error:", err);
  }
});
