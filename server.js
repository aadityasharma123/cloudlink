const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"]
  }
});

let clipboardData = ""; // Shared clipboard data

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send current clipboard data to newly connected users
  socket.emit('clipboardUpdate', clipboardData);

  // When a user updates clipboard data
  socket.on('updateClipboard', (data) => {
    clipboardData = data;
    console.log(`Clipboard updated by ${socket.id}: ${data}`);
    
    // Broadcast to all connected clients except the sender
    socket.broadcast.emit('clipboardUpdate', clipboardData);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on http://localhost:${PORT}`);
});