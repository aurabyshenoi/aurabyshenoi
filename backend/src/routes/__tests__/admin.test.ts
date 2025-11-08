import request from 'supertest';
import express from 'express';
import adminRoutes from '../admin';
import { Painting } from '../../models';
import { generateToken } from '../../middleware/auth';

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

// Mock Cloudinary functions
jest.mock('../../config/cloudinary', () => ({
  uploadImageToCloudinary: jest.fn().mockResolvedValue({
    secureUrl: 'https://cloudinary.com/test-image.jpg',
    publicId: 'test-public-id',
    width: 800,
    height: 600
  }),
  deleteImageFromCloudinary: jest.fn().mockResolvedValue(true),
  generateOptimizedImageUrl: jest.fn().mockImplementation((publicId, options) => 
    `https://cloudinary.com/${publicId}_optimized.jpg`
  )
}));

describe('Admin API', () => {
  let adminToken: string;

  const mockPaintingData = {
    title: 'Test Painting',
    description: 'A beautiful test painting',
    dimensions: { width: 24, height: 36, unit: 'inches' },
    medium: 'Oil on canvas',
    price: 500,
    category: 'landscape',
    images: {
      thumbnail: 'test-thumb.jpg',
      fullSize: ['test-full-1.jpg']
    },
    isAvailable: true
  };

  beforeEach(async () => {
    // Generate admin token
    adminToken = generateToken({
      id: 'admin',
      email: 'admin@artistportfolio.com',
      role: 'admin'
    });

    // Clear collections
    await Painting.deleteMany({});
  });

  describe('Authentication and Authorization', () => {
    test('should require authentication for all admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/paintings')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });

    test('should require admin role', async () => {
      const userToken = generateToken({
        id: 'user',
        email: 'user@example.com',
        role: 'user'
      });

      const response = await request(app)
        .get('/api/admin/paintings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Admin access required');
    });

    test('should allow access with valid admin token', async () => {
      const response = await request(app)
        .get('/api/admin/paintings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/admin/paintings', () => {
    beforeEach(async () => {
      // Create test paintings
      await Painting.create(mockPaintingData);
      await Painting.create({ ...mockPaintingData, title: 'Another Painting', isAvailable: false });
    });

    test('should return all paintings including unavailable ones', async () => {
      const response = await request(app)
        .get('/api/admin/paintings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paintings).toHaveLength(2);
      expect(response.body.data.pagination.totalCount).toBe(2);
    });

    test('should filter by availability', async () => {
      const response = await request(app)
        .get('/api/admin/paintings?availability=available')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.paintings).toHaveLength(1);
      expect(response.body.data.paintings.every((p: any) => p.isAvailable === true)).toBe(true);
    });

    test('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/admin/paintings?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.paintings).toHaveLength(1);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    test('should handle sorting', async () => {
      const response = await request(app)
        .get('/api/admin/paintings?sortBy=price&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paintings).toHaveLength(2);
    });
  });

  describe('POST /api/admin/paintings', () => {
    test('should create a new painting', async () => {
      const response = await request(app)
        .post('/api/admin/paintings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockPaintingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.painting.title).toBe(mockPaintingData.title);
      expect(response.body.message).toBe('Painting created successfully');
    });

    test('should return 400 for invalid data', async () => {
      const invalidData: any = { ...mockPaintingData };
      delete invalidData.title;

      const response = await request(app)
        .post('/api/admin/paintings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/paintings/:id', () => {
    let testPainting: any;

    beforeEach(async () => {
      testPainting = await Painting.create(mockPaintingData);
    });

    test('should update a painting', async () => {
      const updateData = { title: 'Updated Title', price: 600 };

      const response = await request(app)
        .put(`/api/admin/paintings/${testPainting._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.painting.title).toBe('Updated Title');
      expect(response.body.data.painting.price).toBe(600);
    });

    test('should return 404 for non-existent painting', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/admin/paintings/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Painting not found');
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .put('/api/admin/paintings/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid painting ID format');
    });
  });

  describe('DELETE /api/admin/paintings/:id', () => {
    let testPainting: any;

    beforeEach(async () => {
      testPainting = await Painting.create(mockPaintingData);
    });

    test('should delete a painting', async () => {
      const response = await request(app)
        .delete(`/api/admin/paintings/${testPainting._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Painting deleted successfully');

      // Verify painting was deleted
      const deletedPainting = await Painting.findById(testPainting._id);
      expect(deletedPainting).toBeNull();
    });

    test('should return 404 for non-existent painting', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/admin/paintings/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Painting not found');
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .delete('/api/admin/paintings/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid painting ID format');
    });
  });

  describe('GET /api/admin/dashboard/stats', () => {
    beforeEach(async () => {
      // Create test data
      await Painting.create(mockPaintingData);
      await Painting.create({ ...mockPaintingData, title: 'Sold Painting', isAvailable: false });
    });

    test('should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats.paintings.total).toBe(2);
      expect(response.body.data.stats.paintings.available).toBe(1);
      expect(response.body.data.stats.paintings.sold).toBe(1);
    });
  });

  describe('Image Upload Routes', () => {
    test('should handle image upload', async () => {
      const response = await request(app)
        .post('/api/admin/images/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', Buffer.from('fake image data'), 'test.jpg')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(1);
    });

    test('should return 400 when no images provided', async () => {
      const response = await request(app)
        .post('/api/admin/images/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No images provided');
    });
  });
});