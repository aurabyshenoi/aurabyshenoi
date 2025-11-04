import request from 'supertest';
import express from 'express';
import orderRoutes from '../orders';
import { Order, Painting } from '../../models';

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn()
    }
  }));
});

// Mock email service
jest.mock('../../utils/emailService', () => ({
  sendOrderConfirmationEmail: jest.fn().mockResolvedValue(true)
}));

describe('Orders API', () => {
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

  const validOrderData: any = {
    items: [],
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890'
    },
    shipping: {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    paymentMethodId: 'pm_test_123'
  };

  let testPainting: any;

  beforeEach(async () => {
    // Clear collections
    await Order.deleteMany({});
    await Painting.deleteMany({});
    
    // Create test painting
    testPainting = await Painting.create(mockPaintingData);
    validOrderData.items = [{ paintingId: testPainting._id.toString() }];
  });

  describe('POST /api/orders/validate', () => {
    test('should validate order with available paintings', async () => {
      const response = await request(app)
        .post('/api/orders/validate')
        .send({
          items: [{ paintingId: testPainting._id.toString() }],
          shipping: { country: 'United States' }
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isValid).toBe(true);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].title).toBe('Test Painting');
      expect(response.body.data.totals.subtotal).toBe(500);
      expect(response.body.data.totals.shippingCost).toBe(15); // US shipping
      expect(response.body.data.totals.totalAmount).toBe(515);
    });

    test('should calculate free shipping for orders over $500', async () => {
      // Update painting price to trigger free shipping
      await Painting.findByIdAndUpdate(testPainting._id, { price: 600 });

      const response = await request(app)
        .post('/api/orders/validate')
        .send({
          items: [{ paintingId: testPainting._id.toString() }],
          shipping: { country: 'United States' }
        })
        .expect(200);

      expect(response.body.data.totals.subtotal).toBe(600);
      expect(response.body.data.totals.shippingCost).toBe(0); // Free shipping
      expect(response.body.data.totals.totalAmount).toBe(600);
    });

    test('should calculate international shipping', async () => {
      const response = await request(app)
        .post('/api/orders/validate')
        .send({
          items: [{ paintingId: testPainting._id.toString() }],
          shipping: { country: 'Canada' }
        })
        .expect(200);

      expect(response.body.data.totals.shippingCost).toBe(35); // International shipping
      expect(response.body.data.totals.totalAmount).toBe(535);
    });

    test('should return 400 for empty items', async () => {
      const response = await request(app)
        .post('/api/orders/validate')
        .send({
          items: [],
          shipping: { country: 'United States' }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order must contain at least one item');
    });

    test('should return 400 for unavailable paintings', async () => {
      // Mark painting as unavailable
      await Painting.findByIdAndUpdate(testPainting._id, { isAvailable: false });

      const response = await request(app)
        .post('/api/orders/validate')
        .send({
          items: [{ paintingId: testPainting._id.toString() }],
          shipping: { country: 'United States' }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Some paintings are no longer available');
    });

    test('should return 400 for non-existent paintings', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post('/api/orders/validate')
        .send({
          items: [{ paintingId: fakeId }],
          shipping: { country: 'United States' }
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Some paintings are no longer available');
    });
  });

  describe('POST /api/orders', () => {
    beforeEach(() => {
      // Mock successful Stripe payment
      const mockStripe = require('stripe');
      mockStripe().paymentIntents.create.mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        client_secret: 'pi_test_123_secret_test'
      });
    });

    test('should create order with valid data', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send(validOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.orderNumber).toBeDefined();
      expect(response.body.data.order.items).toHaveLength(1);
      expect(response.body.data.order.customer.name).toBe('John Doe');
      expect(response.body.data.order.status).toBe('pending');
      expect(response.body.data.totals.subtotal).toBe(500);

      // Verify order was saved to database
      const savedOrder = await Order.findById(response.body.data.order._id);
      expect(savedOrder).toBeTruthy();
      expect(savedOrder?.customer.name).toBe('John Doe');

      // Verify painting was marked as unavailable
      const updatedPainting = await Painting.findById(testPainting._id);
      expect(updatedPainting?.isAvailable).toBe(false);
    });

    test('should return 400 for missing items', async () => {
      const invalidData = { ...validOrderData, items: [] };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order must contain at least one item');
    });

    test('should return 400 for missing customer data', async () => {
      const invalidData = { ...validOrderData, customer: { name: '', email: '' } };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Customer name and email are required');
    });

    test('should return 400 for incomplete shipping address', async () => {
      const invalidData = { 
        ...validOrderData, 
        shipping: { address: '123 Main St', city: '', state: '', zipCode: '', country: '' }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Complete shipping address is required');
    });

    test('should return 400 for missing payment method', async () => {
      const invalidData = { ...validOrderData, paymentMethodId: '' };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Payment method is required');
    });

    test('should handle payment requiring additional authentication', async () => {
      // Mock payment requiring action
      const mockStripe = require('stripe');
      mockStripe().paymentIntents.create.mockResolvedValue({
        id: 'pi_test_123',
        status: 'requires_action',
        client_secret: 'pi_test_123_secret_test'
      });

      const response = await request(app)
        .post('/api/orders')
        .send(validOrderData)
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.requiresAction).toBe(true);
      expect(response.body.clientSecret).toBeDefined();
      expect(response.body.message).toBe('Payment requires additional authentication');
    });

    test('should handle failed payment', async () => {
      // Mock failed payment
      const mockStripe = require('stripe');
      mockStripe().paymentIntents.create.mockResolvedValue({
        id: 'pi_test_123',
        status: 'requires_payment_method'
      });

      const response = await request(app)
        .post('/api/orders')
        .send(validOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Payment failed. Please try again.');
      expect(response.body.paymentStatus).toBe('requires_payment_method');
    });

    test('should handle Stripe errors', async () => {
      // Mock Stripe error
      const mockStripe = require('stripe');
      const StripeError = class extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'StripeCardError';
        }
      };
      mockStripe().paymentIntents.create.mockRejectedValue(new StripeError('Your card was declined'));

      const response = await request(app)
        .post('/api/orders')
        .send(validOrderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Payment processing failed');
    });

    test('should trim and normalize customer data', async () => {
      const dataWithWhitespace = {
        ...validOrderData,
        customer: {
          name: '  John Doe  ',
          email: '  JOHN@EXAMPLE.COM  ',
          phone: '  123-456-7890  '
        },
        shipping: {
          address: '  123 Main St  ',
          city: '  New York  ',
          state: '  NY  ',
          zipCode: '  10001  ',
          country: '  United States  '
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(dataWithWhitespace)
        .expect(201);

      expect(response.body.data.order.customer.name).toBe('John Doe');
      expect(response.body.data.order.customer.email).toBe('john@example.com');
      expect(response.body.data.order.customer.phone).toBe('123-456-7890');
      expect(response.body.data.order.shipping.address).toBe('123 Main St');
    });
  });

  describe('GET /api/orders/:orderNumber', () => {
    let testOrder: any;

    beforeEach(async () => {
      testOrder = await Order.create({
        orderNumber: 'ORD-20241104-0001',
        items: [{
          paintingId: testPainting._id,
          title: testPainting.title,
          price: testPainting.price,
          image: testPainting.images.thumbnail
        }],
        customer: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        shipping: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        payment: {
          stripePaymentId: 'pi_test_123',
          amount: 515,
          status: 'completed'
        },
        status: 'pending'
      });
    });

    test('should return order by order number', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.orderNumber}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order.orderNumber).toBe(testOrder.orderNumber);
      expect(response.body.data.order.customer.name).toBe('John Doe');
      expect(response.body.data.order.payment.amount).toBe(515);
    });

    test('should return 404 for non-existent order number', async () => {
      const response = await request(app)
        .get('/api/orders/ORD-20241104-9999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });

    test('should return 400 for missing order number', async () => {
      const response = await request(app)
        .get('/api/orders/')
        .expect(404); // Express returns 404 for missing route parameter
    });
  });

  describe('GET /api/orders/id/:id', () => {
    let testOrder: any;

    beforeEach(async () => {
      testOrder = await Order.create({
        orderNumber: 'ORD-20241104-0001',
        items: [{
          paintingId: testPainting._id,
          title: testPainting.title,
          price: testPainting.price,
          image: testPainting.images.thumbnail
        }],
        customer: {
          name: 'John Doe',
          email: 'john@example.com'
        },
        shipping: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        payment: {
          stripePaymentId: 'pi_test_123',
          amount: 515,
          status: 'completed'
        },
        status: 'pending'
      });
    });

    test('should return order by ID', async () => {
      const response = await request(app)
        .get(`/api/orders/id/${testOrder._id}`)
        .expect(200);

      expect(response.body.id).toBe(testOrder._id.toString());
      expect(response.body.orderNumber).toBe(testOrder.orderNumber);
      expect(response.body.customer.name).toBe('John Doe');
      expect(response.body.total).toBe(515);
    });

    test('should return 404 for non-existent order ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/orders/id/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });

    test('should return 400 for missing order ID', async () => {
      const response = await request(app)
        .get('/api/orders/id/')
        .expect(404); // Express returns 404 for missing route parameter
    });
  });
});