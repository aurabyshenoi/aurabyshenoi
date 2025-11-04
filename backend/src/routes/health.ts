import express from 'express';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const router = express.Router();

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    disk?: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  performance?: {
    responseTime: number;
    requestsPerSecond?: number;
  };
}

// Simple health check
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'disconnected',
        memory: {
          used: 0,
          total: 0,
          percentage: 0,
        },
      },
    };

    // Check database connection
    try {
      if (mongoose.connection.readyState === 1) {
        // Test database with a simple query
        await mongoose.connection.db.admin().ping();
        healthStatus.services.database = 'connected';
      } else {
        healthStatus.services.database = 'disconnected';
        healthStatus.status = 'unhealthy';
      }
    } catch (error) {
      logger.error('Database health check failed', error as Error);
      healthStatus.services.database = 'error';
      healthStatus.status = 'unhealthy';
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    healthStatus.services.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / totalMemory) * 100),
    };

    // Check if memory usage is too high
    if (healthStatus.services.memory.percentage > 90) {
      healthStatus.status = 'unhealthy';
    }

    // Response time
    const responseTime = Date.now() - startTime;
    healthStatus.performance = {
      responseTime,
    };

    // Set appropriate status code
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed', error as Error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      uptime: process.uptime(),
    });
  }
});

// Readiness probe (for Kubernetes)
router.get('/ready', async (req, res) => {
  try {
    // Check if the application is ready to serve requests
    if (mongoose.connection.readyState === 1) {
      res.status(200).json({ status: 'ready' });
    } else {
      res.status(503).json({ status: 'not ready', reason: 'database not connected' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Liveness probe (for Kubernetes)
router.get('/live', (req, res) => {
  // Simple liveness check - if the process is running, it's alive
  res.status(200).json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;