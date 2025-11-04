import request from 'supertest';
import express from 'express';
import adminRoutes from '../admin';
import { Painting, Order } from '../../models';
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
    await Order.deleteMany({});
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
        .get('/api/admin/paintings?availability=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.paintings).toHaveLength(1);
      expect(response.body.data.paintings[0].isAvailable).toBe(true);
    });

    test('should filter by category', async () => {
      await Painting.create({ ...mockPaintingData, title: 'Portrait', category: 'portrait' });

      const response = await request(app)
        .get('/api/admin/paintings?category=landscape')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.paintings).toHaveLength(2); // Both landscape paintings
      expect(response.body.data.paintings.every((p: any) => p.category === 'landscape')).toBe(true);
    });

    test('should handle pagination', async () => {
      // Create more paintings
      for (let i = 0; i < 5; i++) {
        await Painting.create({ ...mockPaintingData, title: `Painting ${i}` });
      }

      const response = await request(app)
        .get('/api/admin/paintings?page=2&limit=3')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.paintings).toHaveLength(3);
      expect(response.body.data.pagination.currentPage).toBe(2);
      expect(response.body.data.pagination.totalPages).toBe(3); // 7 total paintings, 3 per page
    });

    test('should sort paintings', async () => {
      await Painting.create({ ...mockPaintingData, title: 'A Painting', price: 100 });
      await Painting.create({ ...mockPaintingData, title: 'Z Painting', price: 900 });

      const response = await request(app)
        .get('/api/admin/paintings?sortBy=price&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const prices = response.body.data.paintings.map((p: any) => p.price);
      expect(prices).toEqual(prices.slice().sort((a: number, b: number) => a - b));
    });
  });

  describe('POST /api/admin/paintings', () => {
    test('should create painting with valid data', async () => {
      const response = await request(app)
        .post('/api/admin/paintings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mockPaintingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.painting.title).toBe('Test Painting');
      expect(response.body.message).toBe('Painting created successfully');

      // Verify painting was saved to database
      const savedPainting = await Painting.findById(response.body.data.painting._id);
      expect(savedPainting).toBeTruthy();
      expect(savedPainting?.title).toBe('Test Painting');
    });

    test('should return 400 for missing required fields', async () => {
      const invalidData = { title: 'Test Painting' }; // Missing other required fields

      const response = await request(app)
        .post('/api/admin/paintings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    test('should return 400 for validation errors', async () => {
      const invalidData = { 
        ...mockPaintingData, 
        price: -100 // Invalid negative price
      };

      const response = await request(app)
        .post('/api/admin/paintings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('PUT /api/admin/paintings/:id', () => {
    let testPainting: any;

    beforeEach(async () => {
      testPainting = await Painting.create(mockPaintingData);
    });

    test('should update painting with valid data', async () => {
      const updateData = { title: 'Updated Painting', price: 600 };

      const response = await request(app)
        .put(`/api/admin/paintings/${testPainting._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.painting.title).toBe('Updated Painting');
      expect(response.body.data.painting.price).toBe(600);
      expect(response.body.message).toBe('Painting updated successfully');
    });

    test('should return 404 for non-existent painting', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/admin/paintings/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Painting not found');
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .put('/api/admin/paintings/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid painting ID format');
    });

    test('should return 400 for validation errors', async () => {
      const invalidData = { price: -100 };

      const response = await request(app)
        .put(`/api/admin/paintings/${testPainting._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('DELETE /api/admin/paintings/:id', () => {
    let testPainting: any;

    beforeEach(async () => {
      testPainting = await Painting.create(mockPaintingData);
    });

    test('should delete painting', async () => {
      const response = await request(app)
        .delete(`/api/admin/paintings/${testPainting._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Painting deleted successfully');

      // Verify painting was deleted from database
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

  describe('GET /api/admin/orders', () => {
    beforeEach(async () => {
      const painting = await Painting.create(mockPaintingData);
      
      // Create test orders
      await Order.create({
        orderNumber: 'ORD-20241104-0001',
        items: [{
          paintingId: painting._id,
          title: painting.title,
          price: painting.price,
          image: painting.images.thumbnail
        }],
        customer: { name: 'John Doe', email: 'john@example.com' },
        shipping: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        payment: { stripePaymentId: 'pi_test_123', amount: 515, status: 'completed' },
        status: 'pending'
      });

      await Order.create({
        orderNumber: 'ORD-20241104-0002',
        items: [{
          paintingId: painting._id,
          title: painting.title,
          price: painting.price,
          image: painting.images.thumbnail
        }],
        customer: { name: 'Jane Smith', email: 'jane@example.com' },
        shipping: {
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'United States'
        },
        payment: { stripePaymentId: 'pi_test_456', amount: 515, status: 'completed' },
        status: 'shipped'
      });
    });

    test('should return all orders', async () => {
      const response = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orders).toHaveLength(2);
      expect(response.body.data.pagination.totalCount).toBe(2);
    });

    test('should filter by status', async () => {
      const response = await request(app)
        .get('/api/admin/orders?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0].status).toBe('pending');
    });

    test('should filter by payment status', async () => {
      const response = await request(app)
        .get('/api/admin/orders?paymentStatus=completed')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.orders).toHaveLength(2);
      expect(response.body.data.orders.every((o: any) => o.payment.status === 'completed')).toBe(true);
    });

    test('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/admin/orders?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('PUT /api/admin/orders/:id/status', () => {
    let testOrder: any;

    beforeEach(async () => {
      const painting = await Painting.create(mockPaintingData);
      
      testOrder = await Order.create({
        orderNumber: 'ORD-20241104-0001',
        items: [{
          paintingId: painting._id,
          title: painting.title,
          price: painting.price,
          image: painting.images.thumbnail
        }],
        customer: { name: 'John Doe', email: 'john@example.com' },
        shipping: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        payment: { stripePaymentId: 'pi_test_123', amount: 515, status: 'completed' },
        status: 'pending'
      });
    });

    test('should update order status', async () => {
      const response = await request(app)
        .put(`/api/admin/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.status).toBe('processing');
      expect(response.body.message).toBe('Order status updated successfully');

      // Verify order was updated in database
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder?.status).toBe('processing');
    });

    test('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put(`/api/admin/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid-status' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid status');
    });

    test('should return 404 for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .put(`/api/admin/orders/${fakeId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .put('/api/admin/orders/invalid-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid order ID format');
    });
  });

  describe('GET /api/admin/dashboard/stats', () => {
    beforeEach(async () => {
      // Create test data
      const painting1 = await Painting.create(mockPaintingData);
      const painting2 = await Painting.create({ ...mockPaintingData, title: 'Sold Painting', isAvailable: false });
      
      await Order.create({
        orderNumber: 'ORD-20241104-0001',
        items: [{ paintingId: painting1._id, title: painting1.title, price: 500, image: 'test.jpg' }],
        customer: { name: 'John Doe', email: 'john@example.com' },
        shipping: { address: '123 Main St', city: 'NY', state: 'NY', zipCode: '10001', country: 'US' },
        payment: { stripePaymentId: 'pi_test_123', amount: 515, status: 'completed' },
        status: 'pending'
      });

      await Order.create({
        orderNumber: 'ORD-20241104-0002',
        items: [{ paintingId: painting2._id, title: painting2.title, price: 300, image: 'test2.jpg' }],
        customer: { name: 'Jane Smith', email: 'jane@example.com' },
        shipping: { address: '456 Oak Ave', city: 'LA', state: 'CA', zipCode: '90210', country: 'US' },
        payment: { stripePaymentId: 'pi_test_456', amount: 315, status: 'completed' },
        status: 'delivered'
      });
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
      expect(response.body.data.stats.orders.total).toBe(2);
      expect(response.body.data.stats.orders.pending).toBe(1);
      expect(response.body.data.stats.orders.completed).toBe(1);
      expect(response.body.data.stats.revenue.total).toBe(830); // 515 + 315
      expect(response.body.data.recentOrders).toHaveLength(2);
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
      expect(response.body.data.images[0].url).toBeDefined();
      expect(response.body.data.images[0].thumbnailUrl).toBeDefined();
    });

    test('should return 400 for no images', async () => {
      const response = await request(app)
        .post('/api/admin/images/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No images provided');
    });

    test('should delete image', async () => {
      const response = await request(app)
        .delete('/api/admin/images/test-public-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Image deleted successfully');
    });

    test('should generate optimized URLs', async () => {
      const response = await request(app)
        .post('/api/admin/images/optimize')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ publicIds: ['test-id-1', 'test-id-2'] })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.optimizedUrls).toHaveLength(2);
      expect(response.body.data.optimizedUrls[0].thumbnailUrl).toBeDefined();
    });
  });
});