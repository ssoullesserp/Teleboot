import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/init';
import botRoutes from './routes/bots';
import flowRoutes from './routes/flows';
import authRoutes from './routes/auth';
import templateRoutes from './routes/templates';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/flows', flowRoutes);
app.use('/api/templates', templateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Teleboot server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Teleboot API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();