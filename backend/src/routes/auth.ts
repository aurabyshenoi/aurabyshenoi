import express, { Request, Response } from 'express';
import { 
  validateAdminCredentials, 
  generateToken, 
  authenticateToken,
  rateLimitLogin,
  recordLoginAttempt
} from '../middleware/auth';

const router = express.Router();

// Interface for login request
interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/login - Admin login
router.post('/login', rateLimitLogin, async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;
    const ip = req.ip || req.connection.remoteAddress || 'unknown';

    // Validate input
    if (!email || !password) {
      recordLoginAttempt(ip, false);
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Authenticate admin credentials
    const isValidAdmin = await validateAdminCredentials(email, password);
    
    if (!isValidAdmin) {
      recordLoginAttempt(ip, false);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: 'admin',
      email: email.toLowerCase(),
      role: 'admin'
    });

    recordLoginAttempt(ip, true);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: 'admin',
          email: email.toLowerCase(),
          role: 'admin'
        }
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    recordLoginAttempt(ip, false);
    
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/auth/verify - Verify token validity
router.post('/verify', authenticateToken, (req: Request, res: Response) => {
  // If we reach here, the token is valid (middleware verified it)
  res.json({
    success: true,
    data: {
      user: req.user
    },
    message: 'Token is valid'
  });
});

// POST /api/auth/refresh - Refresh token (extend expiration)
router.post('/refresh', authenticateToken, (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Generate new token with extended expiration
    const newToken = generateToken({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    });

    res.json({
      success: true,
      data: {
        token: newToken,
        user: req.user
      },
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateToken, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

export default router;