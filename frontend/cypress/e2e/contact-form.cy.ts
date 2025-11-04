describe('FormSubmit Integration E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Complete Form Submission Flow', () => {
    it('should submit contact form successfully with FormSubmit.co integration', () => {
      // Navigate to contact page
      cy.navigateToPage('contact');
      
      // Verify FormSubmit contact form is loaded
      cy.get('form').should('contain', 'Get in Touch');
      
      // Fill out the FormSubmit contact form with valid data
      cy.get('input[id="name"]').type('John Doe');
      cy.get('input[id="email"]').type('john.doe@example.com');
      cy.get('input[id="phone"]').type('+1234567890');
      cy.get('textarea[id="message"]').type('I am interested in your artwork and would like to know more about pricing and availability for custom commissions.');
      
      // Intercept FormSubmit.co request to verify proper data formatting
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 200,
        body: { success: true }
      }).as('formSubmitRequest');
      
      // Submit form
      cy.get('button[type="submit"]').contains('Send Message').click();
      
      // Verify loading state appears
      cy.get('button').contains('Sending Message...').should('be.visible');
      cy.get('.animate-spin').should('be.visible');
      
      // Wait for FormSubmit request and verify data formatting
      cy.wait('@formSubmitRequest').then((interception) => {
        const formData = interception.request.body;
        
        // Verify required form fields are present
        expect(formData).to.include('name=John%20Doe');
        expect(formData).to.include('email=john.doe%40example.com');
        expect(formData).to.include('phone=%2B1234567890');
        expect(formData).to.include('message=I%20am%20interested');
        
        // Verify FormSubmit.co configuration fields
        expect(formData).to.include('_subject=%F0%9F%8E%A8%20New%20Contact%20Form%20Submission%20-%20John%20Doe');
        expect(formData).to.include('_template=box');
        expect(formData).to.include('_replyto=john.doe%40example.com');
        expect(formData).to.include('_captcha=false');
        expect(formData).to.include('_format=html');
        expect(formData).to.include('_autoresponse=Thank%20you%20for%20contacting%20us');
      });
      
      // Verify success message is displayed
      cy.contains('Thank You!').should('be.visible');
      cy.contains('Your message has been received successfully').should('be.visible');
      cy.contains('We will reach out to you within 24-48 hours').should('be.visible');
      
      // Verify success page elements
      cy.get('[data-cy="success-icon"]').should('be.visible');
      cy.contains('What happens next?').should('be.visible');
      cy.contains('We\'ll review your message within 24 hours').should('be.visible');
      cy.contains('You\'ll receive a personal response within 24-48 hours').should('be.visible');
    });

    it('should handle form submission with minimal required fields', () => {
      cy.navigateToPage('contact');
      
      // Fill only required fields (name, email, message)
      cy.get('input[id="name"]').type('Jane Smith');
      cy.get('input[id="email"]').type('jane@example.com');
      cy.get('textarea[id="message"]').type('Hello, I would like more information about your paintings.');
      
      // Intercept FormSubmit.co request
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 200,
        body: { success: true }
      }).as('minimalFormSubmit');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Verify request contains required fields and empty phone field
      cy.wait('@minimalFormSubmit').then((interception) => {
        const formData = interception.request.body;
        expect(formData).to.include('name=Jane%20Smith');
        expect(formData).to.include('email=jane%40example.com');
        expect(formData).to.include('phone='); // Empty phone field
        expect(formData).to.include('message=Hello%2C%20I%20would%20like%20more');
      });
      
      // Verify success state
      cy.contains('Thank You!').should('be.visible');
    });
  });

  describe('Form Validation Tests', () => {
    beforeEach(() => {
      cy.navigateToPage('contact');
    });

    it('should show validation errors for empty required fields', () => {
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Verify validation errors for required fields
      cy.contains('Name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Message is required').should('be.visible');
      
      // Verify form is not submitted
      cy.get('button').should('contain', 'Send Message');
    });

    it('should validate email format', () => {
      // Fill form with invalid email
      cy.get('input[id="name"]').type('Test User');
      cy.get('input[id="email"]').type('invalid-email-format');
      cy.get('textarea[id="message"]').type('Test message for validation');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Verify email validation error
      cy.contains('Please enter a valid email address').should('be.visible');
    });

    it('should validate phone number format when provided', () => {
      // Fill form with invalid phone number
      cy.get('input[id="name"]').type('Test User');
      cy.get('input[id="email"]').type('test@example.com');
      cy.get('input[id="phone"]').type('invalid-phone');
      cy.get('textarea[id="message"]').type('Test message');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Verify phone validation error
      cy.contains('Please enter a valid phone number').should('be.visible');
    });

    it('should validate message length requirements', () => {
      // Test minimum length validation
      cy.get('input[id="name"]').type('Test User');
      cy.get('input[id="email"]').type('test@example.com');
      cy.get('textarea[id="message"]').type('Short');
      
      cy.get('button[type="submit"]').click();
      cy.contains('Message must be at least 10 characters').should('be.visible');
      
      // Test maximum length validation
      cy.get('textarea[id="message"]').clear();
      cy.get('textarea[id="message"]').type('a'.repeat(1001));
      
      cy.get('button[type="submit"]').click();
      cy.contains('Message cannot exceed 1000 characters').should('be.visible');
    });

    it('should clear validation errors when user starts typing', () => {
      // Trigger validation errors
      cy.get('button[type="submit"]').click();
      cy.contains('Name is required').should('be.visible');
      
      // Start typing in name field
      cy.get('input[id="name"]').type('J');
      
      // Verify error is cleared
      cy.contains('Name is required').should('not.exist');
    });

    it('should show character count for message field', () => {
      const testMessage = 'This is a test message for character counting';
      cy.get('textarea[id="message"]').type(testMessage);
      
      // Verify character count is displayed
      cy.contains(`${testMessage.length}/1000`).should('be.visible');
    });
  });

  describe('Error Handling and Fallback Scenarios', () => {
    beforeEach(() => {
      cy.navigateToPage('contact');
    });

    it('should handle network timeout errors with retry functionality', () => {
      // Fill valid form data
      cy.get('input[id="name"]').type('Network Test User');
      cy.get('input[id="email"]').type('network@example.com');
      cy.get('textarea[id="message"]').type('Testing network timeout handling');
      
      // Intercept and simulate timeout
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        forceNetworkError: true
      }).as('networkError');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Wait for network error
      cy.wait('@networkError');
      
      // Verify timeout error message is displayed
      cy.contains('Network connection failed').should('be.visible');
      cy.contains('Please check your internet connection').should('be.visible');
      
      // Verify retry button is available
      cy.get('button').contains('Try Again').should('be.visible');
      
      // Verify network connection tips are shown
      cy.contains('Network Connection Tips:').should('be.visible');
      cy.contains('Check your internet connection').should('be.visible');
    });

    it('should handle server errors with appropriate messaging', () => {
      // Fill valid form data
      cy.get('input[id="name"]').type('Server Error Test');
      cy.get('input[id="email"]').type('server@example.com');
      cy.get('textarea[id="message"]').type('Testing server error handling');
      
      // Intercept and simulate server error
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('serverError');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Wait for server error
      cy.wait('@serverError');
      
      // Verify server error message
      cy.contains('FormSubmit service is temporarily unavailable').should('be.visible');
      cy.contains('Please try again in a few minutes').should('be.visible');
      
      // Verify retry functionality is available
      cy.get('button').contains('Try Again').should('be.visible');
    });

    it('should handle rate limiting with fallback contact information', () => {
      // Fill valid form data
      cy.get('input[id="name"]').type('Rate Limit Test');
      cy.get('input[id="email"]').type('ratelimit@example.com');
      cy.get('textarea[id="message"]').type('Testing rate limit handling');
      
      // Intercept and simulate rate limiting
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 429,
        body: { error: 'Too Many Requests' }
      }).as('rateLimitError');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Wait for rate limit error
      cy.wait('@rateLimitError');
      
      // Verify rate limit error message
      cy.contains('Too many submissions detected').should('be.visible');
      cy.contains('Please wait 5 minutes before trying again').should('be.visible');
      
      // Verify rate limit help text
      cy.contains('Rate Limit Reached:').should('be.visible');
      cy.contains('This helps prevent spam').should('be.visible');
    });

    it('should show fallback contact information after multiple failures', () => {
      // Fill valid form data
      cy.get('input[id="name"]').type('Fallback Test');
      cy.get('input[id="email"]').type('fallback@example.com');
      cy.get('textarea[id="message"]').type('Testing fallback contact information');
      
      // Intercept and simulate repeated failures
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        forceNetworkError: true
      }).as('repeatedFailure');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      cy.wait('@repeatedFailure');
      
      // Try again (first retry)
      cy.get('button').contains('Try Again').click();
      cy.wait('@repeatedFailure');
      
      // Try again (second retry)
      cy.get('button').contains('Try Again').click();
      cy.wait('@repeatedFailure');
      
      // After max retries, fallback should be available
      cy.get('button').contains('Show Alternative Contact Methods').should('be.visible');
      cy.get('button').contains('Show Alternative Contact Methods').click();
      
      // Verify fallback contact information is displayed
      cy.contains('Having trouble with the form? Contact us directly!').should('be.visible');
      cy.contains('aurabyshenoi@gmail.com').should('be.visible');
      cy.contains('We typically respond within 24-48 hours').should('be.visible');
      
      // Verify fallback contact sections
      cy.contains('Primary Contact').should('be.visible');
      cy.contains('What to include in your email').should('be.visible');
      cy.contains('Alternative Options').should('be.visible');
      
      // Verify try again option is still available
      cy.contains('Try the form again').should('be.visible');
    });

    it('should handle successful retry after initial failure', () => {
      // Fill valid form data
      cy.get('input[id="name"]').type('Retry Success Test');
      cy.get('input[id="email"]').type('retry@example.com');
      cy.get('textarea[id="message"]').type('Testing successful retry functionality');
      
      // First request fails
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        forceNetworkError: true
      }).as('firstFailure');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      cy.wait('@firstFailure');
      
      // Verify error message
      cy.contains('Network connection failed').should('be.visible');
      
      // Second request succeeds
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 200,
        body: { success: true }
      }).as('retrySuccess');
      
      // Click retry
      cy.get('button').contains('Try Again').click();
      cy.wait('@retrySuccess');
      
      // Verify success message
      cy.contains('Thank You!').should('be.visible');
      cy.contains('Your message has been received successfully').should('be.visible');
    });
  });

  describe('Success Page Navigation and Display', () => {
    it('should navigate to success page after successful submission', () => {
      cy.navigateToPage('contact');
      
      // Fill and submit form
      cy.get('input[id="name"]').type('Success Page Test');
      cy.get('input[id="email"]').type('success@example.com');
      cy.get('textarea[id="message"]').type('Testing success page navigation');
      
      // Mock successful submission
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 200,
        body: { success: true }
      }).as('successfulSubmission');
      
      cy.get('button[type="submit"]').click();
      cy.wait('@successfulSubmission');
      
      // Verify success page elements are displayed
      cy.get('[data-cy="success-icon"]').should('be.visible');
      cy.contains('Thank You!').should('be.visible');
      cy.contains('Your message has been received successfully').should('be.visible');
      
      // Verify what happens next section
      cy.contains('What happens next?').should('be.visible');
      cy.contains('Review').should('be.visible');
      cy.contains('Response').should('be.visible');
      cy.contains('Follow-up').should('be.visible');
      
      // Verify action buttons
      cy.get('button').contains('Send Another Message').should('be.visible');
      
      // Test send another message functionality
      cy.get('button').contains('Send Another Message').click();
      
      // Verify form is reset and ready for new submission
      cy.get('input[id="name"]').should('have.value', '');
      cy.get('input[id="email"]').should('have.value', '');
      cy.get('textarea[id="message"]').should('have.value', '');
      cy.get('button[type="submit"]').should('contain', 'Send Message');
    });

    it('should display comprehensive success page information', () => {
      cy.navigateToPage('contact');
      
      // Submit form successfully
      cy.get('input[id="name"]').type('Comprehensive Test');
      cy.get('input[id="email"]').type('comprehensive@example.com');
      cy.get('textarea[id="message"]').type('Testing comprehensive success page display');
      
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 200,
        body: { success: true }
      }).as('comprehensiveSuccess');
      
      cy.get('button[type="submit"]').click();
      cy.wait('@comprehensiveSuccess');
      
      // Verify detailed success information
      cy.contains('We will reach out to you within 24-48 hours').should('be.visible');
      cy.contains('We\'ll review your message within 24 hours').should('be.visible');
      cy.contains('You\'ll receive a personal response within 24-48 hours').should('be.visible');
      cy.contains('For urgent inquiries, feel free to email directly').should('be.visible');
      
      // Verify direct contact information
      cy.contains('Need immediate assistance?').should('be.visible');
      cy.contains('aurabyshenoi@gmail.com').should('be.visible');
      
      // Verify email link is functional
      cy.get('a[href="mailto:aurabyshenoi@gmail.com"]').should('be.visible');
    });
  });

  describe('FormSubmit.co Data Formatting Tests', () => {
    it('should format email template with professional structure', () => {
      cy.navigateToPage('contact');
      
      // Fill form with comprehensive data
      cy.get('input[id="name"]').type('Professional Template Test');
      cy.get('input[id="email"]').type('template@example.com');
      cy.get('input[id="phone"]').type('+1-555-123-4567');
      cy.get('textarea[id="message"]').type('This is a comprehensive test message to verify that the email template formatting includes all necessary information and maintains professional presentation standards.');
      
      // Intercept and verify template formatting
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', (req) => {
        const formData = req.body;
        
        // Verify custom email template is included
        expect(formData).to.include('_template_content=');
        expect(formData).to.include('Professional%20Template%20Test');
        expect(formData).to.include('template%40example.com');
        expect(formData).to.include('%2B1-555-123-4567');
        
        // Verify professional formatting elements
        expect(formData).to.include('New%20Contact%20Form%20Submission');
        expect(formData).to.include('Customer%20Information');
        expect(formData).to.include('Quick%20Actions');
        
        req.reply({
          statusCode: 200,
          body: { success: true }
        });
      }).as('templateFormatting');
      
      cy.get('button[type="submit"]').click();
      cy.wait('@templateFormatting');
      
      // Verify success
      cy.contains('Thank You!').should('be.visible');
    });

    it('should include proper FormSubmit.co configuration fields', () => {
      cy.navigateToPage('contact');
      
      // Fill form
      cy.get('input[id="name"]').type('Config Test User');
      cy.get('input[id="email"]').type('config@example.com');
      cy.get('textarea[id="message"]').type('Testing FormSubmit configuration fields');
      
      // Intercept and verify configuration
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', (req) => {
        const formData = req.body;
        
        // Verify all required configuration fields
        expect(formData).to.include('_subject=%F0%9F%8E%A8%20New%20Contact%20Form%20Submission%20-%20Config%20Test%20User');
        expect(formData).to.include('_template=box');
        expect(formData).to.include('_replyto=config%40example.com');
        expect(formData).to.include('_captcha=false');
        expect(formData).to.include('_format=html');
        expect(formData).to.include('_autoresponse=Thank%20you%20for%20contacting%20us');
        
        req.reply({
          statusCode: 200,
          body: { success: true }
        });
      }).as('configFields');
      
      cy.get('button[type="submit"]').click();
      cy.wait('@configFields');
      
      // Verify success
      cy.contains('Thank You!').should('be.visible');
    });
  });
});