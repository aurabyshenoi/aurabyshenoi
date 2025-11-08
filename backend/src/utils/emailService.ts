import { formSubmitService } from './formSubmitService';
import { IContact } from '../models/Contact';
import { logger } from './logger';

/**
 * Email service that wraps FormSubmit functionality
 * This provides a unified interface for all email operations
 */

export interface OrderConfirmationData {
  orderId: string;
  customerEmail: string;
  customerName: string;
  orderItems: Array<{
    title: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

/**
 * Sends order confirmation email via FormSubmit
 */
export async function sendOrderConfirmationEmail(orderData: OrderConfirmationData): Promise<boolean> {
  try {
    logger.info(`Sending order confirmation email for order ${orderData.orderId}`);
    
    // For now, we'll use the contact form service to send order confirmations
    // In a production environment, you might want to use a dedicated email service
    // or extend FormSubmit to handle order confirmations
    
    // Create a contact-like object for the order confirmation
    const orderContact = {
      _id: `order-${orderData.orderId}`,
      contactNumber: `ORD-${orderData.orderId}`,
      customer: {
        fullName: orderData.customerName,
        email: orderData.customerEmail,
        phone: '',
        address: `${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.zipCode}, ${orderData.shippingAddress.country}`
      },
      query: `Order Confirmation - Order ID: ${orderData.orderId}\n\nItems:\n${orderData.orderItems.map(item => `- ${item.title} x${item.quantity}: $${item.price}`).join('\n')}\n\nTotal: $${orderData.totalAmount}`,
      status: 'new' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailNotificationSent: false,
      emailNotificationSentAt: null
    };

    const result = await formSubmitService.sendContactNotification(orderContact as any);
    
    if (result.success) {
      logger.info(`Order confirmation email sent successfully for order ${orderData.orderId}`);
      return true;
    } else {
      logger.error(`Failed to send order confirmation email for order ${orderData.orderId}: ${result.error}`);
      return false;
    }
    
  } catch (error) {
    logger.error(`Error sending order confirmation email for order ${orderData.orderId}:`, error as Error);
    return false;
  }
}

/**
 * Sends contact notification with retry mechanism
 */
export async function sendContactNotificationWithRetry(
  contact: IContact, 
  maxRetries: number = 3
): Promise<boolean> {
  return await formSubmitService.sendContactNotificationWithRetry(contact, maxRetries);
}

/**
 * Schedules contact notification with delay
 */
export function scheduleContactNotification(contact: IContact, delayMs: number = 5000): void {
  formSubmitService.scheduleContactNotification(contact, delayMs);
}

/**
 * Checks if email service is properly configured
 */
export function isEmailServiceConfigured(): boolean {
  return formSubmitService.isConfigured();
}

/**
 * Gets email service configuration status
 */
export function getEmailServiceStatus() {
  return {
    configured: formSubmitService.isConfigured(),
    provider: 'formsubmit',
    config: formSubmitService.getConfig()
  };
}