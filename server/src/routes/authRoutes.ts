import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = express.Router();

// Route to handle user registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Extract registration details from request body
    const { username, password } = req.body;

    // Check if the username is already in use
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user record
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ username: newUser.username }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    // Send token in response
    res.status(201).json({ token });
  } catch (error) {
    // Handle errors
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to handle user login
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Extract login details from request body
    const { username, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    // Send token in response
    res.json({ token });
  } catch (error) {
    // Handle errors
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
