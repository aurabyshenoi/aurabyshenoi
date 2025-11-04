import axios from 'axios';
import { IContact } from '../models/Contact';
import { logger } from './logger';
import { emailConfigValidator, FormSubmitConfig } from './emailConfigValidator';

export interface FormSubmitResult {
  success: boolean;
  provider: 'formsubmit';
  messageId?: string;
  error?: string;
  retryCount?: number;
}

export class FormSubmitService {
  private config: FormSubmitConfig | null;

  constructor() {
    this.config = emailConfigValidator.getFormSubmitConfig();
  }

  /**
   * Sends contact notification via FormSubmit
   * FormSubmit handles both artist notification and customer confirmation automatically
   */
  public async sendContactNotification(contact: IContact): Promise<FormSubmitResult> {
    try {
      if (!this.config || !this.config.isEnabled) {
        throw new Error('FormSubmit not configured or disabled');
      }

      const formData = this.prepareFormData(contact);
      
      logger.info(`Sending contact notification via FormSubmit for contact ${contact.contactNumber}`, {
        endpoint: this.config.endpoint,
        customerEmail: contact.customer.email
      });

      const response = await axios.post(this.config.endpoint, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      if (response.status === 200) {
        logger.info(`FormSubmit notification sent successfully for contact ${contact.contactNumber}`);
        return {
          success: true,
          provider: 'formsubmit',
          messageId: `formsubmit-${contact.contactNumber}-${Date.now()}`
        };
      } else {
        throw new Error(`FormSubmit returned status ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown FormSubmit error';
      logger.error(`FormSubmit notification failed for contact ${contact.contactNumber}:`, error as Error);
      
      return {
        success: false,
        provider: 'formsubmit',
        error: errorMessage
      };
    }
  }

  /**
   * Sends contact notification with retry mechanism
   */
  public async sendContactNotificationWithRetry(
    contact: IContact, 
    maxRetries: number = 3
  ): Promise<boolean> {
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < maxRetries) {
      try {
        attempts++;
        logger.info(`Attempting FormSubmit notification (attempt ${attempts}/${maxRetries}) for contact ${contact.contactNumber}`);
        
        const result = await this.sendContactNotification(contact);
        
        if (result.success) {
          // Update email notification tracking in database
          const Contact = require('../models/Contact').default;
          await Contact.findByIdAndUpdate(contact._id, {
            emailNotificationSent: true,
            emailNotificationSentAt: new Date(),
            emailNotificationAttempts: attempts
          });
          
          logger.info(`FormSubmit notification sent successfully on attempt ${attempts} for contact ${contact.contactNumber}`);
          return true;
        } else {
          throw new Error(result.error || 'FormSubmit failed');
        }
        
      } catch (error) {
        lastError = error as Error;
        logger.error(`FormSubmit attempt ${attempts}/${maxRetries} failed for contact ${contact.contactNumber}:`, error as Error);
        
        // Wait before retrying (exponential backoff)
        if (attempts < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempts - 1), 30000); // Max 30 seconds
          logger.info(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Update database with failure status
    try {
      const Contact = require('../models/Contact').default;
      await Contact.findByIdAndUpdate(contact._id, {
        emailNotificationSent: false,
        emailNotificationSentAt: null,
        emailNotificationAttempts: attempts,
        emailNotificationError: lastError?.message || 'Unknown error'
      });
    } catch (dbError) {
      logger.error(`Failed to update contact ${contact.contactNumber} with email failure status:`, dbError as Error);
    }
    
    logger.error(`FormSubmit notification failed after ${maxRetries} attempts for contact ${contact.contactNumber}:`, lastError || new Error('Unknown error'));
    return false;
  }

  /**
   * Schedules FormSubmit notification with delay (within 2 minutes as per requirements)
   */
  public scheduleContactNotification(contact: IContact, delayMs: number = 5000): void {
    // Ensure delay is within 2 minutes (120,000 ms) as per requirements
    const maxDelay = 2 * 60 * 1000; // 2 minutes in milliseconds
    const actualDelay = Math.min(delayMs, maxDelay);
    
    logger.info(`Scheduling FormSubmit notification for contact ${contact.contactNumber} with delay of ${actualDelay}ms`);
    
    setTimeout(async () => {
      try {
        const success = await this.sendContactNotificationWithRetry(contact);
        if (!success) {
          logger.error(`Failed to send scheduled FormSubmit notification for contact ${contact.contactNumber}`);
        }
      } catch (error) {
        logger.error(`Error in scheduled FormSubmit notification for contact ${contact.contactNumber}:`, error as Error);
      }
    }, actualDelay);
  }

  /**
   * Prepares form data for FormSubmit API
   */
  private prepareFormData(contact: IContact): URLSearchParams {
    const formData = new URLSearchParams();
    
    // FormSubmit standard fields
    formData.append('name', contact.customer.fullName);
    formData.append('email', contact.customer.email);
    formData.append('phone', contact.customer.phone || '');
    formData.append('message', contact.query);
    
    // Additional fields for better tracking
    formData.append('contact_number', contact.contactNumber);
    formData.append('address', contact.customer.address || '');
    formData.append('submission_date', new Date().toISOString());
    
    // FormSubmit configuration options
    formData.append('_subject', `New Contact Form Submission - ${contact.contactNumber}`);
    formData.append('_captcha', 'false'); // Disable captcha for API submissions
    formData.append('_template', 'table'); // Use table template for better formatting
    
    // Auto-response configuration (customer confirmation)
    formData.append('_autoresponse', 'Thank you for contacting AuraByShenoi! We have received your message and will get back to you soon. Your contact reference number is: ' + contact.contactNumber);
    
    return formData;
  }

  /**
   * Checks if FormSubmit is properly configured
   */
  public isConfigured(): boolean {
    return this.config !== null && this.config.isEnabled;
  }

  /**
   * Gets current FormSubmit configuration
   */
  public getConfig(): FormSubmitConfig | null {
    return this.config;
  }

  /**
   * Refreshes configuration (useful after environment changes)
   */
  public refreshConfig(): void {
    this.config = emailConfigValidator.getFormSubmitConfig();
  }
}

// Export singleton instance
export const formSubmitService = new FormSubmitService();