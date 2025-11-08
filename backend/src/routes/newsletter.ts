import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Newsletter } from '../models';
import { logger } from '../utils/logger';

const router = express.Router();

// Interface for newsletter subscription request
interface NewsletterSubscribeRequest {
  email: string;
  source?: string;
}

// POST /api/newsletter/subscribe - Subscribe to newsletter
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    // Check database connection before processing request
    const dbState = mongoose.connection.readyState;
    
    if (dbState !== 1) {
      logger.warn('Newsletter subscription attempted with database disconnected', {
        connectionState: dbState,
        stateDescription: dbState === 0 ? 'disconnected' : dbState === 2 ? 'connecting' : 'disconnecting'
      });
      
      return res.status(503).json({
        success: false,
        message: 'Newsletter service is temporarily unavailable. Please try again later.',
        error: {
          code: 'DB_CONNECTION_ERROR',
          details: 'Database connection not established'
        }
      });
    }
    
    logger.info('Processing newsletter subscription request', {
      connectionState: 'connected'
    });
    
    const { email, source }: NewsletterSubscribeRequest = req.body;

    // Validate required fields
    if (!email || email.trim().length === 0) {
      logger.warn('Newsletter subscription validation failed: missing email');
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
        error: {
          code: 'VALIDATION_ERROR',
          field: 'email'
        }
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!emailRegex.test(trimmedEmail)) {
      logger.warn('Newsletter subscription validation failed: invalid email format', {
        email: trimmedEmail
      });
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
        error: {
          code: 'VALIDATION_ERROR',
          field: 'email',
          details: 'Invalid email format'
        }
      });
    }

    // Validate email length
    if (trimmedEmail.length > 254) {
      logger.warn('Newsletter subscription validation failed: email too long', {
        emailLength: trimmedEmail.length
      });
      return res.status(400).json({
        success: false,
        message: 'Email address cannot exceed 254 characters',
        error: {
          code: 'VALIDATION_ERROR',
          field: 'email',
          details: 'Email too long'
        }
      });
    }

    // Check for duplicate email
    const existingSubscription = await Newsletter.findOne({ email: trimmedEmail });
    
    if (existingSubscription) {
      logger.info('Newsletter subscription attempt with existing email', {
        email: trimmedEmail
      });
      return res.status(409).json({
        success: false,
        message: 'This email is already subscribed to our newsletter',
        error: {
          code: 'DUPLICATE_EMAIL',
          details: 'Email already exists in newsletter list'
        }
      });
    }

    // Create newsletter subscription
    const newsletter = new Newsletter({
      email: trimmedEmail,
      source: source || 'homepage',
      status: 'active'
    });

    await newsletter.save();

    logger.info('Newsletter subscription created successfully', {
      email: newsletter.email,
      source: newsletter.source
    });

    res.status(201).json({
      success: true,
      data: {
        email: newsletter.email,
        subscribedAt: newsletter.subscribedAt
      },
      message: 'Successfully subscribed to newsletter!'
    });

  } catch (error) {
    logger.error('Error subscribing to newsletter', error as Error, {
      email: req.body.email
    });
    
    // Handle duplicate key error (in case of race condition)
    if ((error as any).code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This email is already subscribed to our newsletter',
        error: {
          code: 'DUPLICATE_EMAIL',
          details: 'Email already exists in newsletter list'
        }
      });
    }
    
    // Handle mongoose validation errors
    if ((error as any).name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription data',
        error: {
          code: 'VALIDATION_ERROR',
          details: (error as any).message
        }
      });
    }
    
    // Handle database connection errors
    if ((error as any).name === 'MongoNetworkError' || (error as any).name === 'MongooseServerSelectionError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again later.',
        error: {
          code: 'DB_ERROR',
          details: 'Unable to connect to database'
        }
      });
    }
    
    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter. Please try again later.',
      error: {
        code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : 'An unexpected error occurred'
      }
    });
  }
});

export default router;
