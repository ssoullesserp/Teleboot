import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/init';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export const register = async (req: Request<{}, AuthResponse, RegisterRequest>, res: Response<AuthResponse | { error: string }>) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const db = getDatabase();
    
    // Check if user already exists
    const existingUser = await new Promise<User | null>((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row: User) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const userId = await new Promise<number>((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        [email, password_hash, name],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
    
    // Generate JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    
    // Return user data (without password)
    const user = {
      id: userId,
      email,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request<{}, AuthResponse, LoginRequest>, res: Response<AuthResponse | { error: string }>) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const db = getDatabase();
    
    // Find user
    const user = await new Promise<User | null>((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row: User) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    // Return user data (without password)
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const db = getDatabase();
    
    const user = await new Promise<User | null>((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, row: User) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};