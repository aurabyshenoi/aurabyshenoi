import request from 'supertest';
import express from 'express';
import contactRoutes from '../contact';
import { Contact } from '../../models';

const app = express();
app.use(express.json());
app.use('/api/contact', contactRoutes);

describe('Contact API', () => {
  const validContactData = {
    customer: {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: '123 Main St, City, State'
    },
    query: 'I am interested in your artwork and would like to know more about pricing.'
  };

  describe('POST /api/contact', () => {
    test('should create contact with valid data', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send(validContactData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.contact).toMatchObject({
        customer: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          address: '123 Main St, City, State'
        },
        query: 'I am interested in your artwork and would like to know more about pricing.',
        status: 'new'
      });
      expect(response.body.data.contact.contactNumber).toBeDefined();
      expect(response.body.data.contact._id).toBeDefined();
      expect(response.body.message).toBe('Contact form submitted successfully. We will reach out to you soon!');

      // Verify contact was saved to database
      const savedContact = await Contact.findById(response.body.data.contact._id);
      expect(savedContact).toBeTruthy();
      expect(savedContact?.customer.fullName).toBe('John Doe');
    });

    test('should trim whitespace from input fields', async () => {
      const dataWithWhitespace = {
        customer: {
          fullName: '  John Doe  ',
          email: '  JOHN@EXAMPLE.COM  ',
          phone: '  123-456-7890  ',
          address: '  123 Main St, City, State  '
        },
        query: '  I am interested in your artwork.  '
      };

      const response = await request(app)
        .post('/api/contact')
        .send(dataWithWhitespace)
        .expect(201);

      expect(response.body.data.contact.customer.fullName).toBe('John Doe');
      expect(response.body.data.contact.customer.email).toBe('john@example.com');
      expect(response.body.data.contact.customer.phone).toBe('123-456-7890');
      expect(response.body.data.contact.customer.address).toBe('123 Main St, City, State');
      expect(response.body.data.contact.query).toBe('I am interested in your artwork.');
    });

    test('should return 400 for missing customer data', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send({ query: 'Test query' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All customer fields (full name, email, phone, address) are required');
    });

    test('should return 400 for missing full name', async () => {
      const invalidData = {
        customer: {
          fullName: '',
          email: 'john@example.com',
          phone: '123-456-7890',
          address: '123 Main St'
        },
        query: 'Test query'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All customer fields (full name, email, phone, address) are required');
    });

    test('should return 400 for missing email', async () => {
      const invalidData = {
        customer: {
          fullName: 'John Doe',
          email: '',
          phone: '123-456-7890',
          address: '123 Main St'
        },
        query: 'Test query'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('All customer fields (full name, email, phone, address) are required');
    });

    test('should return 400 for missing query', async () => {
      const invalidData = {
        customer: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          address: '123 Main St'
        },
        query: ''
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Query message is required');
    });

    test('should return 400 for invalid email format', async () => {
      const invalidData = {
        ...validContactData,
        customer: {
          ...validContactData.customer,
          email: 'invalid-email'
        }
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please enter a valid email address');
    });

    test('should return 400 for full name exceeding 100 characters', async () => {
      const invalidData = {
        ...validContactData,
        customer: {
          ...validContactData.customer,
          fullName: 'a'.repeat(101)
        }
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Full name cannot exceed 100 characters');
    });

    test('should return 400 for phone exceeding 20 characters', async () => {
      const invalidData = {
        ...validContactData,
        customer: {
          ...validContactData.customer,
          phone: '1'.repeat(21)
        }
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Phone number cannot exceed 20 characters');
    });

    test('should return 400 for address exceeding 500 characters', async () => {
      const invalidData = {
        ...validContactData,
        customer: {
          ...validContactData.customer,
          address: 'a'.repeat(501)
        }
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Address cannot exceed 500 characters');
    });

    test('should return 400 for query exceeding 2000 characters', async () => {
      const invalidData = {
        ...validContactData,
        query: 'a'.repeat(2001)
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Query cannot exceed 2000 characters');
    });

    test('should handle database errors gracefully', async () => {
      // Mock Contact.save to throw an error
      const originalSave = Contact.prototype.save;
      Contact.prototype.save = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/contact')
        .send(validContactData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to submit contact form. Please try again.');

      // Restore original method
      Contact.prototype.save = originalSave;
    });

    test('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        'user123@test-domain.com'
      ];

      for (const email of validEmails) {
        const testData = {
          ...validContactData,
          customer: {
            ...validContactData.customer,
            email
          }
        };

        const response = await request(app)
          .post('/api/contact')
          .send(testData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.contact.customer.email).toBe(email.toLowerCase());
      }
    });

    test('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test.example.com',
        'test@.com',
        'test@com'
      ];

      for (const email of invalidEmails) {
        const testData = {
          ...validContactData,
          customer: {
            ...validContactData.customer,
            email
          }
        };

        const response = await request(app)
          .post('/api/contact')
          .send(testData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('Please enter a valid email address');
      }
    });
  });
});