import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  [key: string]: string;
}

interface ContactFormSubmitProps {
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: string) => void;
}

interface ErrorState {
  type: 'network' | 'timeout' | 'server' | 'ratelimit' | 'validation' | 'unknown';
  message: string;
  isRetryable: boolean;
  fallbackInfo?: boolean;
}

const ContactFormSubmit: React.FC<ContactFormSubmitProps> = ({
  onSubmitSuccess,
  onSubmitError
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorState, setErrorState] = useState<ErrorState | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showFallback, setShowFallback] = useState(false);

  // FormSubmit.co configuration
  const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/aurabyshenoi@gmail.com';
  const MAX_RETRY_ATTEMPTS = 2;
  const NETWORK_TIMEOUT = 15000; // 15 seconds for better reliability

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Name validation (required)
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    // Email validation (required)
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Phone validation (optional but validate format if provided)
    if (formData.phone.trim() && formData.phone.trim().length > 0) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // Message validation (required)
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters';
    }

    return newErrors;
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear submission error when user starts typing
    if (errorState) {
      setErrorState(null);
      setShowFallback(false);
    }
  };

  const createErrorState = (error: any): ErrorState => {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          type: 'timeout',
          message: 'Request timed out. Please check your internet connection and try again.',
          isRetryable: true
        };
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        return {
          type: 'network',
          message: 'Network connection failed. Please check your internet connection and try again.',
          isRetryable: true
        };
      }
      
      if (error.message.includes('429') || error.message.includes('Too many')) {
        return {
          type: 'ratelimit',
          message: 'Too many submissions detected. Please wait 5 minutes before trying again.',
          isRetryable: false,
          fallbackInfo: true
        };
      }
      
      if (error.message.includes('500') || error.message.includes('Server error')) {
        return {
          type: 'server',
          message: 'FormSubmit service is temporarily unavailable. Please try again in a few minutes.',
          isRetryable: true
        };
      }
    }
    
    return {
      type: 'unknown',
      message: 'Network error. Please check your internet connection and try again.',
      isRetryable: true
    };
  };

  const submitFormData = async (formDataToSubmit: FormData): Promise<void> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);

    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: 'POST',
        body: formDataToSubmit,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json, text/html, */*'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = '';
        
        switch (response.status) {
          case 429:
            errorMessage = 'Too many submissions. Please wait 5 minutes before trying again.';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'FormSubmit service is temporarily unavailable. Please try again in a few minutes.';
            break;
          case 400:
            errorMessage = 'Invalid form data. Please check your information and try again.';
            break;
          case 403:
            errorMessage = 'Form submission blocked. Please contact us directly.';
            break;
          default:
            errorMessage = `Submission failed (Error ${response.status}). Please try again or contact us directly.`;
        }
        
        const error = new Error(errorMessage);
        error.name = `HttpError${response.status}`;
        throw error;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new Error('Request timed out. Please check your internet connection and try again.');
          timeoutError.name = 'AbortError';
          throw timeoutError;
        }
        throw error;
      }
      
      const networkError = new Error('Network error. Please check your internet connection and try again.');
      networkError.name = 'NetworkError';
      throw networkError;
    }
  };

  // Simplified FormSubmit data creation - uses built-in templates instead of custom content
  const createFormSubmitData = (useBasicTemplate: boolean = false): FormData => {
    const formDataToSubmit = new FormData();
    
    // Add form fields - these will be included in the email automatically
    formDataToSubmit.append('name', formData.name.trim());
    formDataToSubmit.append('email', formData.email.toLowerCase().trim());
    if (formData.phone.trim()) {
      formDataToSubmit.append('phone', formData.phone.trim());
    }
    formDataToSubmit.append('message', formData.message.trim());
    
    // Basic FormSubmit configuration
    formDataToSubmit.append('_subject', `Contact Form: ${formData.name.trim()}`);
    formDataToSubmit.append('_replyto', formData.email.toLowerCase().trim());
    formDataToSubmit.append('_captcha', 'false');
    formDataToSubmit.append('_autoresponse', 'Thank you for contacting us! We will respond within 24-48 hours.');
    
    // Use FormSubmit's built-in templates instead of custom content
    if (useBasicTemplate) {
      // Use FormSubmit's most basic template
      formDataToSubmit.append('_template', 'basic');
    } else {
      // Use FormSubmit's table template for better formatting
      formDataToSubmit.append('_template', 'table');
    }
    
    return formDataToSubmit;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrorState(null);
    setShowFallback(false);

    try {
      // Try with table template first (better formatting)
      let formDataToSubmit = createFormSubmitData(false);
  
      try {
        await submitFormData(formDataToSubmit);
      } catch (tableError) {
        console.warn('Table template failed, trying basic template:', tableError);
        // Fallback to basic template if table template fails
        formDataToSubmit = createFormSubmitData(true);
        await submitFormData(formDataToSubmit);
      }

      // Success - update state
      setIsSubmitted(true);
      setRetryCount(0);
      
      // Reset form data
      resetFormData();

      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      const errorStateData = createErrorState(error);
      setErrorState(errorStateData);
      
      // Show fallback after max retries
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        setShowFallback(true);
      }
      
      // Call error callback if provided
      if (onSubmitError) {
        onSubmitError(errorStateData.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async () => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setShowFallback(true);
      return;
    }

    setRetryCount(prev => prev + 1);
    setIsSubmitting(true);
    setShowFallback(false);
    
    // Validate form again before retry
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Add exponential backoff delay for retries
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Try with table template first
      let formDataToSubmit = createFormSubmitData(false);
      
      try {
        await submitFormData(formDataToSubmit);
      } catch (tableError) {
        console.warn('Table template failed on retry, trying basic template:', tableError);
        // Fallback to basic template if table template fails
        formDataToSubmit = createFormSubmitData(true);
        await submitFormData(formDataToSubmit);
      }

      // Success - update state
      setIsSubmitted(true);
      setRetryCount(0);
      
      // Reset form data
      resetFormData();

      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

    } catch (error) {
      console.error('Error retrying form submission:', error);
      const errorStateData = createErrorState(error);
      setErrorState(errorStateData);
      
      // Show fallback after max retries
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        setShowFallback(true);
      }
      
      // Call error callback if provided
      if (onSubmitError) {
        onSubmitError(errorStateData.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setErrors({});
  };

  const resetForm = () => {
    setIsSubmitted(false);
    resetFormData();
    setErrorState(null);
    setRetryCount(0);
    setShowFallback(false);
  };

  const FallbackContactInfo = () => (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6 mt-4">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-amber-800 mb-3">
            Having trouble with the form? Contact us directly!
          </h3>
          <div className="space-y-3 text-sm text-amber-700">
            <div className="bg-white rounded-md p-4 border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2">Email</h4>
              <p className="text-amber-600">
                <strong>Email:</strong>{' '}
                <a 
                  href="mailto:aurabyshenoi@gmail.com"
                  className="text-brown hover:text-brown-dark underline"
                >
                  aurabyshenoi@gmail.com
                </a>
              </p>
              <p className="text-xs text-amber-600 mt-1">
                We typically respond within 24-48 hours
              </p>
            </div>
            
            <div className="bg-white rounded-md p-4 border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2">Include in your email</h4>
              <ul className="text-xs text-amber-600 space-y-1">
                <li>• Your name and contact information</li>
                <li>• Details about your inquiry or commission request</li>
                <li>• Any specific questions about artwork or pricing</li>
                <li>• Preferred method and time for response</li>
              </ul>
            </div>

            <div className="bg-white rounded-md p-4 border border-amber-100">
              <h4 className="font-medium text-amber-800 mb-2">Alternative contact</h4>
              <div className="text-xs text-amber-600 space-y-1">
                <p>• Visit our gallery during business hours</p>
                <p>• Follow us on social media for updates</p>
                <p>• Check our FAQ section for common questions</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={() => {
                setShowFallback(false);
                setErrorState(null);
                setRetryCount(0);
              }}
              className="text-sm text-amber-700 hover:text-amber-800 underline"
            >
              Try the form again
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div className="bg-cream rounded-lg p-4 sm:p-8 shadow-sm">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-sage-green mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-serif text-brown mb-4">Message Sent Successfully!</h2>
          <div className="text-text-dark mb-6 space-y-4">
            <p className="text-lg">
              Your message has been received successfully. We will reach out to you within 24-48 hours.
            </p>
            <div className="bg-sage-green bg-opacity-10 rounded-lg p-4 sm:p-6 border border-sage-green border-opacity-20">
              <h3 className="text-lg sm:text-xl font-serif text-brown mb-3">What happens next?</h3>
              <ul className="text-sm sm:text-base text-text-dark space-y-1 sm:space-y-2 text-left">
                <li>• We'll review your message within 24 hours</li>
                <li>• You'll receive a personalized response via email</li>
                <li>• For commission inquiries, we'll schedule a consultation</li>
              </ul>
            </div>
            <div className="text-sm text-text-light">
              <p>Check your email for a confirmation message.</p>
            </div>
          </div>
          <div className="space-y-4">
            <button
              onClick={resetForm}
              className="bg-brown hover:bg-brown-dark text-cream px-6 py-3 rounded-md transition-colors text-sm sm:text-base"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream rounded-lg p-4 sm:p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-serif text-brown mb-2">Get in Touch</h2>
        <p className="text-text-dark">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-colors ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-warm-gray bg-white'
            }`}
            placeholder="Enter your full name"
            maxLength={100}
            required
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-colors ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-warm-gray bg-white'
            }`}
            placeholder="Enter your email address"
            required
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-2">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-colors ${
              errors.phone ? 'border-red-300 bg-red-50' : 'border-warm-gray bg-white'
            }`}
            placeholder="Enter your phone number"
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>{errors.phone}</span>
            </p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-text-dark mb-2">
            Your Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-colors resize-vertical ${
              errors.message ? 'border-red-300 bg-red-50' : 'border-warm-gray bg-white'
            }`}
            placeholder="Tell us about your inquiry, commission request, or any questions you have..."
            maxLength={1000}
            required
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          <div className="flex justify-between items-start mt-1">
            {errors.message ? (
              <p id="message-error" className="text-sm text-red-600 flex items-center flex-1 mr-4">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{errors.message}</span>
              </p>
            ) : (
              <div className="flex-1"></div>
            )}
            <p className="text-xs text-text-light flex-shrink-0">
              {formData.message.length}/1000
            </p>
          </div>
        </div>

        {/* Submit Error */}
        {errorState && (
          <div className={`border rounded-md p-4 ${
            errorState.type === 'timeout' || errorState.type === 'network' 
              ? 'bg-orange-50 border-orange-200' 
              : errorState.type === 'ratelimit'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-2">
              <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                errorState.type === 'timeout' || errorState.type === 'network' 
                  ? 'text-orange-600'
                  : errorState.type === 'ratelimit'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`} />
              <div className="flex-1">
                <p className={`text-sm mb-3 ${
                  errorState.type === 'timeout' || errorState.type === 'network'
                    ? 'text-orange-600' 
                    : errorState.type === 'ratelimit'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {errorState.message}
                </p>
                
                {/* Retry button for retryable errors */}
                {errorState.isRetryable && retryCount < MAX_RETRY_ATTEMPTS && (
                  <div className="flex items-center space-x-3 mb-3">
                    <button
                      type="button"
                      onClick={handleRetry}
                      disabled={isSubmitting}
                      className={`px-4 py-2 text-sm text-white rounded-md transition-colors ${
                        errorState.type === 'timeout' || errorState.type === 'network'
                          ? 'bg-orange-500 hover:bg-orange-600'
                          : 'bg-red-500 hover:bg-red-600'
                      } disabled:opacity-50`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Retrying...</span>
                        </div>
                      ) : (
                        `Try Again${retryCount > 0 ? ` (${retryCount + 1}/${MAX_RETRY_ATTEMPTS + 1})` : ''}`
                      )}
                    </button>
                    {retryCount > 0 && (
                      <div className={`text-xs ${
                        errorState.type === 'timeout' || errorState.type === 'network' 
                          ? 'text-orange-500' 
                          : 'text-red-500'
                      }`}>
                        Attempt {retryCount + 1}
                      </div>
                    )}
                  </div>
                )}

                {/* Show fallback button after max retries */}
                {(retryCount >= MAX_RETRY_ATTEMPTS || !errorState.isRetryable) && (
                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => setShowFallback(true)}
                      className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
                    >
                      Show Alternative Contact Methods
                    </button>
                  </div>
                )}

                {/* Error-specific help text */}
                {errorState.type === 'network' && (
                  <div className="bg-orange-100 border border-orange-200 rounded-md p-3 mt-2">
                    <p className="text-orange-700 text-sm font-medium mb-1">Network Connection Issues</p>
                    <ul className="text-xs text-orange-600 space-y-1">
                      <li>• Check your internet connection</li>
                      <li>• Try refreshing the page</li>
                      <li>• Disable any VPN or proxy temporarily</li>
                    </ul>
                  </div>
                )}

                {errorState.type === 'timeout' && (
                  <div className="bg-orange-100 border border-orange-200 rounded-md p-3 mt-2">
                    <p className="text-orange-700 text-sm font-medium mb-1">Connection Timeout</p>
                    <ul className="text-xs text-orange-600 space-y-1">
                      <li>• Your connection may be slow</li>
                      <li>• Try again with a better connection</li>
                      <li>• Consider using alternative contact methods below</li>
                    </ul>
                  </div>
                )}

                {errorState.type === 'ratelimit' && (
                  <div className="bg-yellow-100 border border-yellow-200 rounded-md p-3 mt-2">
                    <p className="text-yellow-700 text-sm font-medium mb-1">Rate Limit Reached</p>
                    <ul className="text-xs text-yellow-600 space-y-1">
                      <li>• Please wait 5 minutes before trying again</li>
                      <li>• This helps prevent spam and ensures service quality</li>
                      <li>• Use direct email contact for urgent inquiries</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fallback Contact Information */}
        {showFallback && <FallbackContactInfo />}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brown hover:bg-brown-dark text-cream px-6 py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-cream border-t-transparent"></div>
              <span className="text-sm sm:text-base">
                {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRY_ATTEMPTS})` : 'Sending Message...'}
              </span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Send Message</span>
            </>
          )}
        </button>

        {/* Loading State Indicator */}
        {isSubmitting && (
          <div className="text-center">
            <div className="bg-sage-green bg-opacity-10 border border-sage-green border-opacity-20 rounded-md p-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-sage-green border-t-transparent"></div>
                <p className="text-sage-green font-medium">
                  {retryCount > 0 
                    ? `Retrying your message... (Attempt ${retryCount + 1})` 
                    : 'Sending your message...'
                  }
                </p>
              </div>
              <p className="text-sm text-text-light mt-2">
                {retryCount > 0 
                  ? 'Please wait while we retry sending your message.'
                  : 'This may take a few seconds. Please don\'t refresh the page.'
                }
              </p>
              {retryCount > 0 && (
                <p className="text-xs text-text-light mt-1">
                  Using simplified email format for better compatibility.
                </p>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ContactFormSubmit;