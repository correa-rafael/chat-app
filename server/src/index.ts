// server/src/index.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { User, UserDocument } from './models/User';

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
app.use(express.json()); // Middleware to parse JSON body

const users: { [socketId: string]: string } = {};

// Connect to MongoDB
const uri = 'mongodb://localhost:27017/chatApp';
const client = new MongoClient(uri);
client.connect().then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

// User registration endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if the password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // User authenticated successfully
    res.json({ message: 'Login successful', username });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware to authenticate users
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Set the authenticated user in the request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User authentication middleware
app.use('/chat', authenticateUser);

// Chat application endpoint
app.get('/chat', (req, res) => {
  res.send('Welcome to the chat application!');
});

// Handle socket connections
io.on('connection', (socket) => {
  console.log('a user connected');

  // Send a welcome message to the client upon connection
  socket.emit('message', 'Welcome to the chat!');

  // Handle setting the username
  socket.on('set username', (username: string) => {
    users[socket.id] = username;
    io.emit('user entered', username);
    io.emit('users', Object.values(users));
  });

  // Handle messages received from the client
  socket.on('chat message', (data) => {
    console.log(`message: ${data.message}, username: ${data.username}`);
    // Broadcast to all connected clients
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit('user left', username);
    io.emit('users', Object.values(users));
    console.log('user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
