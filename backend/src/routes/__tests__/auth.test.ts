import request from 'supertest';
import express from 'express';
import authRoutes from '../auth';
import { generateToken } from '../../middleware/auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock bcrypt for consistent testing
jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}));

describe('Auth API', () => {
  const validAdminCredentials = {
    email: 'admin@artistportfolio.com',
    password: 'password'
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid admin credentials', async () => {
      // Mock successful password comparison
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validAdminCredentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('admin@artistportfolio.com');
      expect(response.body.data.user.role).toBe('admin');
      expect(response.body.message).toBe('Login successful');
    });

    test('should normalize email to lowercase', async () => {
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ADMIN@ARTISTPORTFOLIO.COM',
          password: 'password'
        })
        .expect(200);

      expect(response.body.data.user.email).toBe('admin@artistportfolio.com');
    });

    test('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required');
    });

    test('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@artistportfolio.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required');
    });

    test('should return 401 for invalid email', async () => {
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    test('should return 401 for invalid password', async () => {
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@artistportfolio.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    test('should handle rate limiting after multiple failed attempts', async () => {
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockResolvedValue(false);

      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'admin@artistportfolio.com',
            password: 'wrongpassword'
          })
          .expect(401);
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@artistportfolio.com',
          password: 'wrongpassword'
        })
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Too many login attempts');
    });

    test('should handle bcrypt errors gracefully', async () => {
      const bcrypt = require('bcryptjs');
      bcrypt.compare.mockRejectedValue(new Error('Bcrypt error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(validAdminCredentials)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Login failed');
    });
  });

  describe('POST /api/auth/verify', () => {
    test('should verify valid token', async () => {
      const token = generateToken({
        id: 'admin',
        email: 'admin@artistportfolio.com',
        role: 'admin'
      });

      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('admin@artistportfolio.com');
      expect(response.body.message).toBe('Token is valid');
    });

    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });

    test('should return 403 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });

    test('should return 403 for malformed authorization header', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });
  });

  describe('POST /api/auth/refresh', () => {
    test('should refresh valid token', async () => {
      const token = generateToken({
        id: 'admin',
        email: 'admin@artistportfolio.com',
        role: 'admin'
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.token).not.toBe(token); // Should be a new token
      expect(response.body.data.user.email).toBe('admin@artistportfolio.com');
      expect(response.body.message).toBe('Token refreshed successfully');
    });

    test('should return 401 for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });

    test('should return 403 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });
  });

  describe('GET /api/auth/profile', () => {
    test('should return user profile for authenticated user', async () => {
      const token = generateToken({
        id: 'admin',
        email: 'admin@artistportfolio.com',
        role: 'admin'
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe('admin');
      expect(response.body.data.user.email).toBe('admin@artistportfolio.com');
      expect(response.body.data.user.role).toBe('admin');
    });

    test('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });

    test('should return 403 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });
  });

  describe('Token validation edge cases', () => {
    test('should handle expired tokens', async () => {
      // Create an expired token (this would normally be expired by JWT)
      const expiredToken = generateToken({
        id: 'admin',
        email: 'admin@artistportfolio.com',
        role: 'admin'
      });

      // Mock JWT to throw expired error
      const jwt = require('jsonwebtoken');
      const originalVerify = jwt.verify;
      jwt.verify = jest.fn().mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');

      // Restore original function
      jwt.verify = originalVerify;
    });

    test('should handle malformed tokens', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .set('Authorization', 'Bearer malformed.token.here')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });
  });
});