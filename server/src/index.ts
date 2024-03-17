// server/src/index.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { User, UserDocument } from './models/User';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 4000;
const MONGODB_URI = "mongodb://localhost:27017/chatApp";
//const MONGODB_URI = process.env.MONGODB_URI;

app.use('/api', authRoutes);

// Connect to MongoDB
mongoose.connect(MONGODB_URI as string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Enable CORS for the entire app
app.use(cors());
app.use(express.json()); // Middleware to parse JSON body

// User registration endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
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
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', username });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware to authenticate users
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Check if the user is authenticated
  if (!('user' in req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  next();
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

  socket.emit('message', 'Welcome to the chat!');

  socket.on('set username', (username: string) => {
    console.log(`User ${username} connected`);
    io.emit('user entered', username);
  });

  socket.on('chat message', (data) => {
    console.log(`message: ${data.message}, username: ${data.username}`);
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected');
    io.emit('user left');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
