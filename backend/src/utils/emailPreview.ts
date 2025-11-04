import { IOrder } from '../models/Order';
import {
  OrderConfirmationData,
  generateOrderConfirmationHTML,
  generateOrderStatusUpdateHTML
} from '../templates/emailTemplates';

// Mock order data for testing email templates
const mockOrder: IOrder = {
  _id: '507f1f77bcf86cd799439011' as any,
  orderNumber: 'ART-2024-001',
  items: [
    {
      paintingId: '507f1f77bcf86cd799439012' as any,
      title: 'Sunset Over Mountains',
      price: 450.00,
      image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_400/sample.jpg'
    },
    {
      paintingId: '507f1f77bcf86cd799439013' as any,
      title: 'Ocean Waves',
      price: 320.00,
      image: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_400/sample2.jpg'
    }
  ],
  customer: {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0123'
  },
  shipping: {
    address: '123 Art Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'United States'
  },
  payment: {
    stripePaymentId: 'pi_1234567890',
    amount: 785.00,
    status: 'completed' as any
  },
  status: 'pending' as any,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z')
} as IOrder;

// Generate preview HTML for order confirmation email
export const generateOrderConfirmationPreview = (): string => {
  const mockData: OrderConfirmationData = {
    order: mockOrder,
    subtotal: 770.00,
    shippingCost: 15.00,
    totalAmount: 785.00
  };

  return generateOrderConfirmationHTML(mockData);
};

// Generate preview HTML for order status update email
export const generateOrderStatusUpdatePreview = (status: string = 'shipped'): string => {
  const message = status === 'shipped' 
    ? 'Great news! Your order has been shipped and is on its way to you.'
    : 'Your order status has been updated.';

  return generateOrderStatusUpdateHTML(mockOrder, status, message);
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
    // Order confirmation preview
    const confirmationHTML = generateOrderConfirmationPreview();
    saveEmailPreview(confirmationHTML, 'order-confirmation');
    
    // Order status update previews
    const statusUpdates = ['processing', 'shipped', 'delivered'];
    statusUpdates.forEach(status => {
      const statusHTML = generateOrderStatusUpdatePreview(status);
      saveEmailPreview(statusHTML, `order-status-${status}`);
    });
    
    console.log('All email previews generated successfully!');
  } catch (error) {
    console.error('Error generating email previews:', error);
  }
};

// Export mock data for testing
export { mockOrder };