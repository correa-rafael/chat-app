// server/src/index.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 4000;

// Enable CORS for the entire app
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send a welcome message to the client upon connection
  socket.emit('message', 'Welcome to the chat!');

  // Handle messages received from the client
  socket.on('chat message', (msg) => {
    console.log(`message: ${msg}`);
    // Broadcast to all connected clients
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
