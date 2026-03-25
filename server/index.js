const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",   // In production, replace * with your Netlify URL
    methods: ["GET", "POST"],
  },
});

// Track connected users
const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins with a username
  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("system", `${username} joined the chat`);
    io.emit("users", Object.values(users));
  });

  // User sends a message
  socket.on("message", (data) => {
    io.emit("message", {
      username: users[socket.id],
      text: data.text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });
  });

  // User disconnects
  socket.on("disconnect", () => {
    const username = users[socket.id];
    delete users[socket.id];
    if (username) {
      io.emit("system", `${username} left the chat`);
      io.emit("users", Object.values(users));
    }
  });
});

app.get("/", (req, res) => res.send("Chat server running ✅"));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));