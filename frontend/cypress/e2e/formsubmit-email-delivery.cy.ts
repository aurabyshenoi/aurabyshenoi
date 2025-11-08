/**
 * End-to-End Test: FormSubmit Email Delivery Flow
 * 
 * This test validates the complete email delivery flow using FormSubmit.co:
 * - Form submission with valid data
 * - Email delivery to aurabyshenoi@gmail.com
 * - Reply-to functionality
 * - Auto-response to customer
 * - Email formatting and content accuracy
 * 
 * Requirements: 1.1, 3.1, 3.2, 3.3, 3.4
 */

describe('FormSubmit Email Delivery Flow', () => {
  const testEmail = 'test.customer@example.com';
  const testName = 'Test Customer';
  const testPhone = '+1234567890';
  const testMessage = 'This is a test inquiry about artwork. Please respond with more information.';

  beforeEach(() => {
    cy.visit('/contact');
    cy.wait(1000); // Allow page to fully load
  });

  describe('Form Submission and Email Delivery', () => {
    it('should submit contact form successfully and trigger email delivery', () => {
      // Requirement 1.1: Form submission triggers email delivery
      
      // Fill out the form
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="phone"]').type(testPhone);
      cy.get('textarea[name="message"]').type(testMessage);

      // Intercept the FormSubmit.co request
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', (req) => {
        // Verify the request is being sent to the correct endpoint
        expect(req.url).to.include('formsubmit.co/aurabyshenoi@gmail.com');
        
        // Verify form data is included
        const formData = req.body;
        expect(formData.get('name')).to.equal(testName);
        expect(formData.get('email')).to.equal(testEmail);
        expect(formData.get('phone')).to.equal(testPhone);
        expect(formData.get('message')).to.equal(testMessage);
        
        // Requirement 3.2: Verify email formatting configuration
        expect(formData.get('_subject')).to.include(testName);
        expect(formData.get('_template')).to.be.oneOf(['table', 'basic']);
        
        // Requirement 3.3: Verify reply-to header is set correctly
        expect(formData.get('_replyto')).to.equal(testEmail);
        
        // Requirement 3.4: Verify all form fields are included
        expect(formData.has('name')).to.be.true;
        expect(formData.has('email')).to.be.true;
        expect(formData.has('message')).to.be.true;
        
        // Verify auto-response configuration
        expect(formData.get('_autoresponse')).to.include('Thank you');
        expect(formData.get('_autoresponse')).to.include('24-48 hours');
        
        // Verify captcha is disabled for testing
        expect(formData.get('_captcha')).to.equal('false');
        
        // Mock successful response
        req.reply({
          statusCode: 200,
          body: { success: true }
        });
      }).as('formSubmit');

      // Submit the form
      cy.get('button[type="submit"]').click();

      // Wait for the request to complete
      cy.wait('@formSubmit');

      // Requirement 1.2: Verify success message is displayed
      cy.contains('Message Sent Successfully!', { timeout: 10000 }).should('be.visible');
      cy.contains('Your message has been received successfully').should('be.visible');
      cy.contains('24-48 hours').should('be.visible');
    });

    it('should include artwork reference in email when inquiring about specific artwork', () => {
      // Navigate to gallery and click on an artwork
      cy.visit('/gallery');
      cy.wait(1000);
      
      // Click on first artwork card
      cy.get('[data-testid="painting-card"]').first().click();
      cy.wait(500);
      
      // Click "Inquire About This Piece" button
      cy.contains('button', 'Inquire About This Piece').click();
      cy.wait(500);

      // Verify we're on contact page with artwork reference
      cy.url().should('include', '/contact');
      
      // Intercept FormSubmit request
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', (req) => {
        const formData = req.body;
        
        // Requirement 3.4: Verify artwork reference is included
        expect(formData.has('artwork_inquiry')).to.be.true;
        expect(formData.get('artwork_inquiry')).to.not.be.empty;
        
        // Verify subject line includes artwork inquiry
        expect(formData.get('_subject')).to.include('Artwork Inquiry');
        
        req.reply({
          statusCode: 200,
          body: { success: true }
        });
      }).as('artworkInquiry');

      // Fill out remaining form fields
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Wait for submission
      cy.wait('@artworkInquiry');
      
      // Verify success
      cy.contains('Message Sent Successfully!').should('be.visible');
    });
  });

  describe('Email Configuration Validation', () => {
    it('should use correct FormSubmit endpoint URL', () => {
      // Requirement 3.1: Verify correct endpoint URL
      
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('textarea[name="message"]').type(testMessage);

      cy.intercept('POST', '**/formsubmit.co/**', (req) => {
        // Verify endpoint is exactly correct
        expect(req.url).to.equal('https://formsubmit.co/aurabyshenoi@gmail.com');
        
        req.reply({
          statusCode: 200,
          body: { success: true }
        });
      }).as('endpointCheck');

      cy.get('button[type="submit"]').click();
      cy.wait('@endpointCheck');
    });

    it('should include proper email formatting with table template', () => {
      // Requirement 3.2: Verify email formatting
      
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('textarea[name="message"]').type(testMessage);

      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', (req) => {
        const formData = req.body;
        
        // Verify template is set (table or basic)
        const template = formData.get('_template');
        expect(template).to.be.oneOf(['table', 'basic']);
        
        // Verify subject line is properly formatted
        const subject = formData.get('_subject');
        expect(subject).to.include('Contact Form:');
        expect(subject).to.include(testName);
        
        req.reply({
          statusCode: 200,
          body: { success: true }
        });
      }).as('formatCheck');

      cy.get('button[type="submit"]').click();
      cy.wait('@formatCheck');
    });

    it('should set reply-to header to customer email', () => {
      // Requirement 3.3: Verify reply-to functionality
      
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('textarea[name="message"]').type(testMessage);

      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', (req) => {
        const formData = req.body;
        
        // Verify reply-to is set to customer email
        expect(formData.get('_replyto')).to.equal(testEmail);
        
        // Verify email is lowercase and trimmed
        expect(formData.get('email')).to.equal(testEmail.toLowerCase());
        
        req.reply({
          statusCode: 200,
          body: { success: true }
        });
      }).as('replyToCheck');

      cy.get('button[type="submit"]').click();
      cy.wait('@replyToCheck');
    });

    it('should include all necessary form fields in email', () => {
      // Requirement 3.4: Verify all form fields are included
      
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="phone"]').type(testPhone);
      cy.get('textarea[name="message"]').type(testMessage);

      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', (req) => {
        const formData = req.body;
        
        // Verify all required fields are present
        expect(formData.has('name')).to.be.true;
        expect(formData.has('email')).to.be.true;
        expect(formData.has('message')).to.be.true;
        
        // Verify optional phone field is included when provided
        expect(formData.has('phone')).to.be.true;
        expect(formData.get('phone')).to.equal(testPhone);
        
        // Verify configuration fields
        expect(formData.has('_subject')).to.be.true;
        expect(formData.has('_replyto')).to.be.true;
        expect(formData.has('_template')).to.be.true;
        expect(formData.has('_autoresponse')).to.be.true;
        expect(formData.has('_captcha')).to.be.true;
        
        req.reply({
          statusCode: 200,
          body: { success: true }
        });
      }).as('fieldsCheck');

      cy.get('button[type="submit"]').click();
      cy.wait('@fieldsCheck');
    });

    it('should configure auto-response message for customer', () => {
      // Verify auto-response configuration
      
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('textarea[name="message"]').type(testMessage);

      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', (req) => {
        const formData = req.body;
        
        // Verify auto-response is configured
        const autoResponse = formData.get('_autoresponse');
        expect(autoResponse).to.include('Thank you');
        expect(autoResponse).to.include('24-48 hours');
        
        req.reply({
          statusCode: 200,
          body: { success: true }
        });
      }).as('autoResponseCheck');

      cy.get('button[type="submit"]').click();
      cy.wait('@autoResponseCheck');
    });
  });

  describe('Error Handling and Fallback', () => {
    it('should handle FormSubmit service unavailability gracefully', () => {
      // Requirement 1.3: Display fallback contact information
      
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('textarea[name="message"]').type(testMessage);

      // Simulate service unavailability
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 503,
        body: { error: 'Service Unavailable' }
      }).as('serviceError');

      cy.get('button[type="submit"]').click();
      cy.wait('@serviceError');

      // Verify error message is displayed
      cy.contains('FormSubmit service is temporarily unavailable').should('be.visible');
      
      // Verify retry button is available
      cy.contains('button', 'Try Again').should('be.visible');
    });

    it('should display fallback contact information after max retries', () => {
      // Requirement 1.3: Display fallback contact information
      
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('textarea[name="message"]').type(testMessage);

      // Simulate network error
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        forceNetworkError: true
      }).as('networkError');

      cy.get('button[type="submit"]').click();
      cy.wait('@networkError');

      // Click retry button twice (max retries)
      cy.contains('button', 'Try Again').click();
      cy.wait('@networkError');
      
      cy.contains('button', 'Try Again').click();
      cy.wait('@networkError');

      // Verify fallback button appears
      cy.contains('button', 'Show Alternative Contact Methods').should('be.visible').click();

      // Verify fallback contact information is displayed
      cy.contains('aurabyshenoi@gmail.com').should('be.visible');
      cy.contains('Having trouble with the form?').should('be.visible');
    });

    it('should validate form fields before submission', () => {
      // Requirement 1.4: Validate all form fields
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click();

      // Verify validation errors are displayed
      cy.contains('Name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Message is required').should('be.visible');

      // Fill with invalid email
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('textarea[name="message"]').type('Short');

      cy.get('button[type="submit"]').click();

      // Verify specific validation errors
      cy.contains('Please enter a valid email address').should('be.visible');
      cy.contains('Message must be at least 10 characters').should('be.visible');
    });

    it('should provide clear error messages for failed submissions', () => {
      // Requirement 1.5: Clear error messages
      
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('textarea[name="message"]').type(testMessage);

      // Test different error scenarios
      const errorScenarios = [
        { status: 429, message: 'Too many submissions' },
        { status: 400, message: 'Invalid form data' },
        { status: 500, message: 'temporarily unavailable' }
      ];

      errorScenarios.forEach((scenario, index) => {
        if (index > 0) {
          // Reset form for subsequent tests
          cy.visit('/contact');
          cy.wait(500);
          cy.get('input[name="name"]').type(testName);
          cy.get('input[name="email"]').type(testEmail);
          cy.get('textarea[name="message"]').type(testMessage);
        }

        cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
          statusCode: scenario.status,
          body: { error: 'Error' }
        }).as(`error${scenario.status}`);

        cy.get('button[type="submit"]').click();
        cy.wait(`@error${scenario.status}`);

        // Verify appropriate error message is displayed
        cy.contains(scenario.message, { matchCase: false }).should('be.visible');
      });
    });
  });

  describe('Template Fallback Mechanism', () => {
    it('should fallback to basic template if table template fails', () => {
      // Test the template fallback mechanism
      
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('textarea[name="message"]').type(testMessage);

      let requestCount = 0;
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', (req) => {
        requestCount++;
        const formData = req.body;
        
        if (requestCount === 1) {
          // First request with table template should fail
          expect(formData.get('_template')).to.equal('table');
          req.reply({
            statusCode: 400,
            body: { error: 'Template error' }
          });
        } else if (requestCount === 2) {
          // Second request should use basic template
          expect(formData.get('_template')).to.equal('basic');
          req.reply({
            statusCode: 200,
            body: { success: true }
          });
        }
      }).as('templateFallback');

      cy.get('button[type="submit"]').click();
      
      // Wait for both requests
      cy.wait('@templateFallback');
      cy.wait('@templateFallback');

      // Verify success after fallback
      cy.contains('Message Sent Successfully!').should('be.visible');
    });
  });

  describe('Form Data Sanitization', () => {
    it('should trim and sanitize form data before submission', () => {
      // Test data sanitization
      
      const nameWithSpaces = '  Test Customer  ';
      const emailWithSpaces = '  TEST.CUSTOMER@EXAMPLE.COM  ';
      const phoneWithSpaces = '  +1234567890  ';
      const messageWithSpaces = '  Test message with spaces  ';

      cy.get('input[name="name"]').type(nameWithSpaces);
      cy.get('input[name="email"]').type(emailWithSpaces);
      cy.get('input[name="phone"]').type(phoneWithSpaces);
      cy.get('textarea[name="message"]').type(messageWithSpaces);

      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', (req) => {
        const formData = req.body;
        
        // Verify data is trimmed
        expect(formData.get('name')).to.equal('Test Customer');
        expect(formData.get('phone')).to.equal('+1234567890');
        expect(formData.get('message')).to.equal('Test message with spaces');
        
        // Verify email is lowercase and trimmed
        expect(formData.get('email')).to.equal('test.customer@example.com');
        expect(formData.get('_replyto')).to.equal('test.customer@example.com');
        
        req.reply({
          statusCode: 200,
          body: { success: true }
        });
      }).as('sanitizationCheck');

      cy.get('button[type="submit"]').click();
      cy.wait('@sanitizationCheck');
    });
  });

  describe('Success State and Form Reset', () => {
    it('should display success message and allow sending another message', () => {
      // Test success state and form reset
      
      cy.get('input[name="name"]').type(testName);
      cy.get('input[name="email"]').type(testEmail);
      cy.get('textarea[name="message"]').type(testMessage);

      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 200,
        body: { success: true }
      }).as('successSubmit');

      cy.get('button[type="submit"]').click();
      cy.wait('@successSubmit');

      // Verify success message
      cy.contains('Message Sent Successfully!').should('be.visible');
      cy.contains('What happens next?').should('be.visible');
      cy.contains('Check your email for a confirmation message').should('be.visible');

      // Click "Send Another Message" button
      cy.contains('button', 'Send Another Message').click();

      // Verify form is reset and ready for new submission
      cy.get('input[name="name"]').should('have.value', '');
      cy.get('input[name="email"]').should('have.value', '');
      cy.get('input[name="phone"]').should('have.value', '');
      cy.get('textarea[name="message"]').should('have.value', '');
      
      // Verify form is functional after reset
      cy.get('button[type="submit"]').should('be.visible').and('not.be.disabled');
    });
  });
});
