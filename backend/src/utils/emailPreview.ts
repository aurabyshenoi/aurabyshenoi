import { IContact } from '../models/Contact';
import {
  generateContactConfirmationHTML,
  generateContactNotificationHTML
} from '../templates/emailTemplates';

// Mock contact data for testing email templates
const mockContact: IContact = {
  _id: '507f1f77bcf86cd799439011' as any,
  contactNumber: 'CNT-2024-001',
  customer: {
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0123',
    address: '123 Art Street, San Francisco, CA 94102'
  },
  query: 'Hello! I am interested in learning more about your artwork, particularly the landscape paintings. Could you please provide more information about pricing and availability? I am looking for a piece for my living room.',
  status: 'new' as any,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z')
} as IContact;

// Generate preview HTML for contact confirmation email (sent to customer)
export const generateContactConfirmationPreview = (): string => {
  return generateContactConfirmationHTML(mockContact);
};

// Generate preview HTML for contact notification email (sent to artist)
export const generateContactNotificationPreview = (): string => {
  return generateContactNotificationHTML(mockContact);
};

// Utility function to save preview HTML to file (for development testing)
export const saveEmailPreview = (html: string, filename: string): void => {
  const fs = require('fs');
  const path = require('path');
  
  const previewDir = path.join(__dirname, '../../email-previews');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
  
  const filePath = path.join(previewDir, `${filename}.html`);
  fs.writeFileSync(filePath, html);
  
  console.log(`Email preview saved to: ${filePath}`);
};

// Generate all email previews
export const generateAllPreviews = (): void => {
  try {
    // Contact confirmation preview (sent to customer)
    const confirmationHTML = generateContactConfirmationPreview();
    saveEmailPreview(confirmationHTML, 'contact-confirmation');
    
    // Contact notification preview (sent to artist)
    const notificationHTML = generateContactNotificationPreview();
    saveEmailPreview(notificationHTML, 'contact-notification');
    
    console.log('All email previews generated successfully!');
  } catch (error) {
    console.error('Error generating email previews:', error);
  }
};

// Export mock data for testing
export { mockContact };