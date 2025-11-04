import { 
  sendContactNotificationWithRetry, 
  scheduleContactNotification 
} from '../utils/emailService';
import { 
  retryFailedContactNotifications,
  getEmailNotificationStats,
  isEmailNotificationOverdue,
  getOverdueEmailNotifications
} from '../utils/emailNotificationMonitor';

// Mock contact object for testing
const mockContact = {
  _id: 'test-contact-id',
  contactNumber: 'CNT-20251104-0001',
  customer: {
    fullName: 'Test Customer',
    email: 'test@example.com',
    phone: '+1234567890',
    address: '123 Test Street, Test City, TC 12345'
  },
  query: 'This is a test query about artwork pricing and availability.',
  status: 'new' as const,
  emailNotificationSent: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('Email Notification System', () => {
  describe('scheduleContactNotification', () => {
    it('should schedule email notification with proper delay', (done) => {
      const startTime = Date.now();
      const delay = 1000; // 1 second for testing
      
      // Mock the sendContactNotificationWithRetry function
      jest.spyOn(require('../utils/emailService'), 'sendContactNotificationWithRetry')
        .mockImplementation(async () => {
          const elapsedTime = Date.now() - startTime;
          expect(elapsedTime).toBeGreaterThanOrEqual(delay - 50); // Allow 50ms tolerance
          expect(elapsedTime).toBeLessThan(delay + 500); // Allow 500ms tolerance
          done();
          return true;
        });
      
      scheduleContactNotification(mockContact as any, delay);
    });

    it('should enforce maximum delay of 2 minutes', (done) => {
      const startTime = Date.now();
      const requestedDelay = 5 * 60 * 1000; // 5 minutes
      const maxDelay = 2 * 60 * 1000; // 2 minutes
      
      // Mock the sendContactNotificationWithRetry function
      jest.spyOn(require('../utils/emailService'), 'sendContactNotificationWithRetry')
        .mockImplementation(async () => {
          const elapsedTime = Date.now() - startTime;
          expect(elapsedTime).toBeLessThan(maxDelay + 1000); // Should be capped at 2 minutes
          done();
          return true;
        });
      
      scheduleContactNotification(mockContact as any, requestedDelay);
    });
  });

  describe('isEmailNotificationOverdue', () => {
    it('should return true for contacts older than 2 minutes without email sent', () => {
      const overdueContact = {
        ...mockContact,
        createdAt: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
        emailNotificationSent: false
      };
      
      expect(isEmailNotificationOverdue(overdueContact)).toBe(true);
    });

    it('should return false for recent contacts', () => {
      const recentContact = {
        ...mockContact,
        createdAt: new Date(Date.now() - 1 * 60 * 1000), // 1 minute ago
        emailNotificationSent: false
      };
      
      expect(isEmailNotificationOverdue(recentContact)).toBe(false);
    });

    it('should return false for contacts with email already sent', () => {
      const emailSentContact = {
        ...mockContact,
        createdAt: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
        emailNotificationSent: true
      };
      
      expect(isEmailNotificationOverdue(emailSentContact)).toBe(false);
    });
  });

  describe('Email notification tracking', () => {
    it('should properly format contact details in notification', () => {
      // Test that the email templates include all required contact information
      const { generateContactNotificationHTML, generateContactNotificationText } = require('../templates/emailTemplates');
      
      const htmlContent = generateContactNotificationHTML(mockContact);
      const textContent = generateContactNotificationText(mockContact);
      
      // Check that all contact details are included
      expect(htmlContent).toContain(mockContact.customer.fullName);
      expect(htmlContent).toContain(mockContact.customer.email);
      expect(htmlContent).toContain(mockContact.customer.phone);
      expect(htmlContent).toContain(mockContact.customer.address);
      expect(htmlContent).toContain(mockContact.query);
      expect(htmlContent).toContain(mockContact.contactNumber);
      
      expect(textContent).toContain(mockContact.customer.fullName);
      expect(textContent).toContain(mockContact.customer.email);
      expect(textContent).toContain(mockContact.customer.phone);
      expect(textContent).toContain(mockContact.customer.address);
      expect(textContent).toContain(mockContact.query);
      expect(textContent).toContain(mockContact.contactNumber);
    });

    it('should include proper formatting and call-to-action', () => {
      const { generateContactNotificationHTML, generateContactNotificationText } = require('../templates/emailTemplates');
      
      const htmlContent = generateContactNotificationHTML(mockContact);
      const textContent = generateContactNotificationText(mockContact);
      
      // Check for proper formatting and call-to-action
      expect(htmlContent).toContain('Action Required');
      expect(htmlContent).toContain('24-48 hours');
      expect(htmlContent).toContain('aurabyshenoi@gmail.com');
      
      expect(textContent).toContain('ACTION REQUIRED');
      expect(textContent).toContain('24-48 hours');
    });

    it('should include timestamp information', () => {
      const { generateContactNotificationHTML, generateContactNotificationText } = require('../templates/emailTemplates');
      
      const htmlContent = generateContactNotificationHTML(mockContact);
      const textContent = generateContactNotificationText(mockContact);
      
      // Check that submission time is included
      expect(htmlContent).toContain('Submitted On');
      expect(textContent).toContain('Submitted On');
      
      // Check that it mentions the 2-minute notification timing
      expect(htmlContent).toContain('within 2 minutes');
      expect(textContent).toContain('within 2 minutes');
    });
  });
});

// Integration test for the complete email notification flow
describe('Email Notification Integration', () => {
  it('should handle the complete notification flow', async () => {
    // This test would require a database connection and email service
    // For now, we'll just verify the function signatures and basic logic
    
    expect(typeof scheduleContactNotification).toBe('function');
    expect(typeof sendContactNotificationWithRetry).toBe('function');
    expect(typeof retryFailedContactNotifications).toBe('function');
    expect(typeof getEmailNotificationStats).toBe('function');
    expect(typeof getOverdueEmailNotifications).toBe('function');
  });
});