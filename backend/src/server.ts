import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { logger } from './utils/logger';
import paintingRoutes from './routes/paintings';

import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';

import contactRoutes from './routes/contact';
import testimonialRoutes from './routes/testimonials';
import healthRoutes from './routes/health';
import newsletterRoutes from './routes/newsletter';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging
app.use(logger.requestLogger());

// Health check routes (before other routes for faster response)
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// API routes
app.use('/api/paintings', paintingRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/contact', contactRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Error logging middleware
app.use(logger.errorLogger());

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'AuraByShenoi API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    // Simple database connection test
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({
      message: 'Database connection test',
      connected: isConnected,
      status: isConnected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Try to connect to database with retry logic
    try {
      logger.info('Initializing database connection...');
      await connectDB(3, 5000); // 3 retries with 5 second delay
      logger.info('Database connected successfully', {
        connectionState: 'connected',
        database: require('mongoose').connection.db?.databaseName || 'unknown'
      });
    } catch (dbError) {
      logger.error('Database connection failed after all retries', dbError as Error);
      logger.warn('Server will start but database-dependent features may not work');
    }
    
    const server = app.listen(PORT, () => {
      const mongoose = require('mongoose');
      const dbConnected = mongoose.connection.readyState === 1;
      
      logger.info(`AuraByShenoi server started`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        databaseConnected: dbConnected,
        databaseState: dbConnected ? 'connected' : 'disconnected'
      });
      logger.info(`Health check available at: http://localhost:${PORT}/health`);
      
      if (!dbConnected) {
        logger.warn('Server started without database connection - some features may be unavailable');
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      
      server.close(() => {
        logger.info('HTTP server closed');
        
        // Close database connection
        require('mongoose').connection.close(() => {
          logger.info('Database connection closed');
          process.exit(0);
        });
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
};

startServer();