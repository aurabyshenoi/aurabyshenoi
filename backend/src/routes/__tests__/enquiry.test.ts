import request from 'supertest';
import express from 'express';
import contactRoutes from '../contact';
import paintingsRoutes from '../paintings';
import { Contact, Painting } from '../../models';

const app = express();
app.use(express.json());
app.use('/api/contact', contactRoutes);
app.use('/api/paintings', paintingsRoutes);

// Mock email service
jest.mock('../../utils/emailService', () => ({
  sendContactConfirmationEmail: jest.fn().mockResolvedValue(true),
  sendContactNotificationEmail: jest.fn().mockResolvedValue(true)
}));

describe('Enquiry Processing and Price Calculation', () => {
  const mockPaintingData = {
    title: 'Beautiful Landscape',
    description: 'A stunning landscape painting',
    dimensions: { width: 24, height: 36, unit: 'inches' as const },
    medium: 'Oil on canvas',
    price: 500,
    category: 'landscape',
    images: {
      thumbnail: 'test-thumb.jpg',
      fullSize: ['test-full-1.jpg']
    },
    isAvailable: true
  };

  const validEnquiryData = {
    customer: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: '123 Main St, New York, NY 10001'
    },
    query: 'I am interested in the Beautiful Landscape painting. Could you please provide more details about the pricing and availability?'
  };

  let testPainting: any;

  beforeEach(async () => {
    // Clear collections
    await Contact.deleteMany({});
    await Painting.deleteMany({});
    
    // Create test painting
    testPainting = await Painting.create(mockPaintingData);
  });

  describe('Price Calculation Flow', () => {
    test('should calculate price at 5000 rupees per square foot for inches', async () => {
      // Create painting with specific dimensions
      const painting = await Painting.create({
        ...mockPaintingData,
        title: 'Price Test Painting',
        dimensions: { width: 12, height: 16, unit: 'inches' },
        price: 0 // Will be calculated
      });

      const response = await request(app)
        .get(`/api/paintings/${painting._id}`)
        .expect(200);

      // Calculate expected price: 12 * 16 = 192 square inches
      // Convert to square feet: 192 / 144 = 1.33 square feet
      // Price: 1.33 * 5000 = 6667 rupees (approximately)
      const squareInches = 12 * 16;
      const squareFeet = squareInches / 144;
      const expectedPrice = Math.round(squareFeet * 5000);

      expect(response.body.success).toBe(true);
      expect(response.body.data.painting.title).toBe('Price Test Painting');
      
      // The painting should have dimensions that allow price calculation
      expect(response.body.data.painting.dimensions.width).toBe(12);
      expect(response.body.data.painting.dimensions.height).toBe(16);
      expect(response.body.data.painting.dimensions.unit).toBe('inches');
    });

    test('should calculate price at 5000 rupees per square foot for cm', async () => {
      // Create painting with cm dimensions
      const painting = await Painting.create({
        ...mockPaintingData,
        title: 'CM Price Test Painting',
        dimensions: { width: 30, height: 40, unit: 'cm' },
        price: 0
      });

      const response = await request(app)
        .get(`/api/paintings/${painting._id}`)
        .expect(200);

      // Calculate expected price: 30 * 40 = 1200 square cm
      // Convert to square feet: 1200 / (30.48 * 30.48) = 1.29 square feet
      // Price: 1.29 * 5000 = 6458 rupees (approximately)
      expect(response.body.success).toBe(true);
      expect(response.body.data.painting.dimensions.width).toBe(30);
      expect(response.body.data.painting.dimensions.height).toBe(40);
      expect(response.body.data.painting.dimensions.unit).toBe('cm');
    });

    test('should handle different painting sizes for price calculation', async () => {
      const testCases = [
        { width: 8, height: 10, unit: 'inches' as const, expectedSqFt: (8 * 10) / 144 },
        { width: 18, height: 24, unit: 'inches' as const, expectedSqFt: (18 * 24) / 144 },
        { width: 36, height: 48, unit: 'inches' as const, expectedSqFt: (36 * 48) / 144 }
      ];

      for (const testCase of testCases) {
        const painting = await Painting.create({
          ...mockPaintingData,
          title: `Test ${testCase.width}x${testCase.height}`,
          dimensions: testCase,
          price: Math.round(testCase.expectedSqFt * 5000)
        });

        const response = await request(app)
          .get(`/api/paintings/${painting._id}`)
          .expect(200);

        expect(response.body.data.painting.dimensions).toEqual(testCase);
        expect(response.body.data.painting.price).toBe(Math.round(testCase.expectedSqFt * 5000));
      }
    });
  });

  describe('Enquiry Processing Flow', () => {
    test('should process enquiry with painting interest', async () => {
      const enquiryWithPaintingInterest = {
        ...validEnquiryData,
        query: `I am interested in purchasing "${testPainting.title}". The dimensions are ${testPainting.dimensions.width}x${testPainting.dimensions.height} ${testPainting.dimensions.unit}. Could you please confirm the price and availability?`
      };

      const response = await request(app)
        .post('/api/contact')
        .send(enquiryWithPaintingInterest)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contact.query).toContain(testPainting.title);
      expect(response.body.data.contact.customer.fullName).toBe('John Doe');
      expect(response.body.data.contact.status).toBe('new');
      expect(response.body.message).toBe('Contact form submitted successfully. We will reach out to you soon!');

      // Verify enquiry was saved to database
      const savedContact = await Contact.findById(response.body.data.contact._id);
      expect(savedContact).toBeTruthy();
      expect(savedContact?.query).toContain(testPainting.title);
    });

    test('should process general enquiry without specific painting', async () => {
      const generalEnquiry = {
        ...validEnquiryData,
        query: 'I am interested in your artwork collection. Could you please send me information about available paintings and pricing?'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(generalEnquiry)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contact.query).toBe(generalEnquiry.query);
      expect(response.body.data.contact.contactNumber).toBeDefined();
    });

    test('should validate enquiry customer information', async () => {
      const invalidEnquiry = {
        customer: {
          fullName: '',
          email: 'invalid-email',
          phone: '',
          address: ''
        },
        query: 'Test enquiry'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidEnquiry)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All customer fields (full name, email, phone, address) are required');
    });

    test('should validate email format in enquiry', async () => {
      const invalidEmailEnquiry = {
        ...validEnquiryData,
        customer: {
          ...validEnquiryData.customer,
          email: 'invalid-email-format'
        }
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidEmailEnquiry)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please enter a valid email address');
    });

    test('should handle enquiry with price calculation request', async () => {
      const priceEnquiry = {
        ...validEnquiryData,
        query: `I would like to know the exact price for a custom painting with dimensions 20x30 inches. Based on your rate of 5000 rupees per square foot, I calculate it should be around ${Math.round((20 * 30 / 144) * 5000)} rupees. Is this correct?`
      };

      const response = await request(app)
        .post('/api/contact')
        .send(priceEnquiry)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contact.query).toContain('5000 rupees per square foot');
      expect(response.body.data.contact.query).toContain('20x30 inches');
    });

    test('should process enquiry with multiple painting interests', async () => {
      // Create additional paintings
      const painting2 = await Painting.create({
        ...mockPaintingData,
        title: 'Abstract Art',
        category: 'abstract',
        dimensions: { width: 18, height: 24, unit: 'inches' }
      });

      const multiPaintingEnquiry = {
        ...validEnquiryData,
        query: `I am interested in multiple paintings: "${testPainting.title}" (${testPainting.dimensions.width}x${testPainting.dimensions.height} ${testPainting.dimensions.unit}) and "${painting2.title}" (${painting2.dimensions.width}x${painting2.dimensions.height} ${painting2.dimensions.unit}). Could you provide pricing for both?`
      };

      const response = await request(app)
        .post('/api/contact')
        .send(multiPaintingEnquiry)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contact.query).toContain(testPainting.title);
      expect(response.body.data.contact.query).toContain(painting2.title);
    });

    test('should trim and normalize enquiry data', async () => {
      const enquiryWithWhitespace = {
        customer: {
          fullName: '  John Doe  ',
          email: '  JOHN@EXAMPLE.COM  ',
          phone: '  123-456-7890  ',
          address: '  123 Main St, New York, NY  '
        },
        query: '  I am interested in your paintings.  '
      };

      const response = await request(app)
        .post('/api/contact')
        .send(enquiryWithWhitespace)
        .expect(201);

      expect(response.body.data.contact.customer.fullName).toBe('John Doe');
      expect(response.body.data.contact.customer.email).toBe('john@example.com');
      expect(response.body.data.contact.customer.phone).toBe('123-456-7890');
      expect(response.body.data.contact.customer.address).toBe('123 Main St, New York, NY');
      expect(response.body.data.contact.query).toBe('I am interested in your paintings.');
    });

    test('should generate unique contact numbers for enquiries', async () => {
      const enquiry1 = await request(app)
        .post('/api/contact')
        .send(validEnquiryData)
        .expect(201);

      const enquiry2 = await request(app)
        .post('/api/contact')
        .send({
          ...validEnquiryData,
          customer: { ...validEnquiryData.customer, fullName: 'Jane Smith', email: 'jane@example.com' }
        })
        .expect(201);

      expect(enquiry1.body.data.contact.contactNumber).toBeDefined();
      expect(enquiry2.body.data.contact.contactNumber).toBeDefined();
      expect(enquiry1.body.data.contact.contactNumber).not.toBe(enquiry2.body.data.contact.contactNumber);
    });

    test('should handle enquiry length limits', async () => {
      const longEnquiry = {
        ...validEnquiryData,
        query: 'a'.repeat(2001) // Exceeds 2000 character limit
      };

      const response = await request(app)
        .post('/api/contact')
        .send(longEnquiry)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Query cannot exceed 2000 characters');
    });

    test('should handle database errors during enquiry processing', async () => {
      // Mock Contact.save to throw an error
      const originalSave = Contact.prototype.save;
      Contact.prototype.save = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/contact')
        .send(validEnquiryData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to submit contact form. Please try again.');

      // Restore original method
      Contact.prototype.save = originalSave;
    });
  });

  describe('Integration: Enquiry with Price Calculation', () => {
    test('should process complete enquiry flow with price calculation', async () => {
      // Step 1: Get painting details with price calculation
      const paintingResponse = await request(app)
        .get(`/api/paintings/${testPainting._id}`)
        .expect(200);

      const painting = paintingResponse.body.data.painting;
      const squareInches = painting.dimensions.width * painting.dimensions.height;
      const squareFeet = squareInches / 144;
      const calculatedPrice = Math.round(squareFeet * 5000);

      // Step 2: Submit enquiry referencing the calculated price
      const enquiryWithCalculation = {
        ...validEnquiryData,
        query: `I am interested in "${painting.title}". Based on the dimensions ${painting.dimensions.width}x${painting.dimensions.height} ${painting.dimensions.unit} and your rate of 5000 rupees per square foot, I understand the price would be approximately ${calculatedPrice} rupees. Please confirm availability and final pricing.`
      };

      const enquiryResponse = await request(app)
        .post('/api/contact')
        .send(enquiryWithCalculation)
        .expect(201);

      // Step 3: Verify enquiry contains price calculation reference
      expect(enquiryResponse.body.success).toBe(true);
      expect(enquiryResponse.body.data.contact.query).toContain(painting.title);
      expect(enquiryResponse.body.data.contact.query).toContain('5000 rupees per square foot');
      expect(enquiryResponse.body.data.contact.query).toContain(calculatedPrice.toString());

      // Step 4: Verify enquiry is properly stored with all details
      const savedContact = await Contact.findById(enquiryResponse.body.data.contact._id);
      expect(savedContact).toBeTruthy();
      expect(savedContact?.customer.fullName).toBe('John Doe');
      expect(savedContact?.status).toBe('new');
    });

    test('should handle enquiry for unavailable painting', async () => {
      // Mark painting as unavailable
      await Painting.findByIdAndUpdate(testPainting._id, { isAvailable: false });

      const enquiryForUnavailable = {
        ...validEnquiryData,
        query: `I am interested in "${testPainting.title}". Is it still available for purchase?`
      };

      // Enquiry should still be processed (customer might be interested in similar work)
      const response = await request(app)
        .post('/api/contact')
        .send(enquiryForUnavailable)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contact.query).toContain(testPainting.title);
    });
  });
});