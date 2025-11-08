import { logger } from './logger';

export interface FormSubmitConfig {
  endpoint: string;
  isEnabled: boolean;
}

export class EmailConfigValidator {
  /**
   * Gets FormSubmit configuration from environment variables
   */
  public getFormSubmitConfig(): FormSubmitConfig | null {
    try {
      const endpoint = process.env.FORMSUBMIT_ENDPOINT;
      
      if (!endpoint) {
        logger.warn('FORMSUBMIT_ENDPOINT not configured in environment variables');
        return null;
      }

      // Validate endpoint format
      if (!this.isValidFormSubmitEndpoint(endpoint)) {
        logger.error('Invalid FormSubmit endpoint format');
        return null;
      }

      return {
        endpoint,
        isEnabled: true
      };
      
    } catch (error) {
      logger.error('Error validating FormSubmit configuration:', error as Error);
      return null;
    }
  }

  /**
   * Validates FormSubmit endpoint format
   */
  private isValidFormSubmitEndpoint(endpoint: string): boolean {
    try {
      const url = new URL(endpoint);
      return url.hostname === 'formsubmit.co' && url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validates all email configurations
   */
  public validateAllConfigurations(): {
    formsubmit: { valid: boolean; config: FormSubmitConfig | null };
  } {
    const formsubmitConfig = this.getFormSubmitConfig();
    
    return {
      formsubmit: {
        valid: formsubmitConfig !== null,
        config: formsubmitConfig
      }
    };
  }
}

// Export singleton instance
export const emailConfigValidator = new EmailConfigValidator();