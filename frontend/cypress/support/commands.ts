/// <reference types="cypress" />

// Custom commands for AuraByShenoi e2e tests

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to fill out contact form
       * @example cy.fillContactForm('John Doe', 'john@example.com', '123-456-7890', '123 Main St', 'Test query')
       */
      fillContactForm(name: string, email: string, phone: string, address: string, query: string): Chainable<Element>
      
      /**
       * Custom command to fill out FormSubmit contact form
       * @example cy.fillFormSubmitForm('John Doe', 'john@example.com', '123-456-7890', 'Test message')
       */
      fillFormSubmitForm(name: string, email: string, phone?: string, message?: string): Chainable<Element>
      
      /**
       * Custom command to verify FormSubmit request data
       * @example cy.verifyFormSubmitData(interception, expectedData)
       */
      verifyFormSubmitData(interception: any, expectedData: { name: string, email: string, phone?: string, message: string }): Chainable<Element>
      
      /**
       * Custom command to navigate to a specific page
       * @example cy.navigateToPage('gallery')
       */
      navigateToPage(page: 'home' | 'gallery' | 'about' | 'contact'): Chainable<Element>
      
      /**
       * Custom command to wait for page to load
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<Element>
      
      /**
       * Custom command to simulate FormSubmit.co responses
       * @example cy.mockFormSubmitResponse('success')
       */
      mockFormSubmitResponse(type: 'success' | 'network-error' | 'server-error' | 'rate-limit'): Chainable<Element>
    }
  }
}

Cypress.Commands.add('fillContactForm', (name: string, email: string, phone: string, address: string, query: string) => {
  // Support both old and new form structures
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="contact-form"]').length > 0) {
      // Old form structure
      cy.get('[data-testid="contact-form"]').within(() => {
        cy.get('input[id="fullName"]').type(name);
        cy.get('input[id="email"]').type(email);
        cy.get('input[id="phone"]').type(phone);
        cy.get('textarea[id="address"]').type(address);
        cy.get('textarea[id="query"]').type(query);
      });
    } else {
      // New FormSubmit form structure
      cy.get('input[id="name"]').type(name);
      cy.get('input[id="email"]').type(email);
      if (phone) cy.get('input[id="phone"]').type(phone);
      cy.get('textarea[id="message"]').type(query);
    }
  });
});

Cypress.Commands.add('navigateToPage', (page: 'home' | 'gallery' | 'about' | 'contact') => {
  const pageMap = {
    home: 'Home',
    gallery: 'Gallery', 
    about: 'About',
    contact: 'Contact'
  };
  
  cy.get('nav').contains(pageMap[page]).click();
  cy.waitForPageLoad();
});

Cypress.Commands.add('fillFormSubmitForm', (name: string, email: string, phone?: string, message?: string) => {
  cy.get('input[id="name"]').type(name);
  cy.get('input[id="email"]').type(email);
  if (phone) {
    cy.get('input[id="phone"]').type(phone);
  }
  if (message) {
    cy.get('textarea[id="message"]').type(message);
  }
});

Cypress.Commands.add('verifyFormSubmitData', (interception: any, expectedData: { name: string, email: string, phone?: string, message: string }) => {
  const formData = interception.request.body;
  
  // Verify form fields
  expect(formData).to.include(`name=${encodeURIComponent(expectedData.name)}`);
  expect(formData).to.include(`email=${encodeURIComponent(expectedData.email.toLowerCase())}`);
  expect(formData).to.include(`message=${encodeURIComponent(expectedData.message)}`);
  
  if (expectedData.phone) {
    expect(formData).to.include(`phone=${encodeURIComponent(expectedData.phone)}`);
  }
  
  // Verify FormSubmit.co configuration fields
  expect(formData).to.include('_template=box');
  expect(formData).to.include('_captcha=false');
  expect(formData).to.include('_format=html');
  expect(formData).to.include(`_replyto=${encodeURIComponent(expectedData.email.toLowerCase())}`);
  expect(formData).to.include(`_subject=${encodeURIComponent(`🎨 New Contact Form Submission - ${expectedData.name}`)}`);
});

Cypress.Commands.add('mockFormSubmitResponse', (type: 'success' | 'network-error' | 'server-error' | 'rate-limit') => {
  switch (type) {
    case 'success':
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 200,
        body: { success: true }
      }).as('formSubmitResponse');
      break;
    case 'network-error':
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        forceNetworkError: true
      }).as('formSubmitResponse');
      break;
    case 'server-error':
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('formSubmitResponse');
      break;
    case 'rate-limit':
      cy.intercept('POST', 'https://formsubmit.co/aurabyshenoi@gmail.com', {
        statusCode: 429,
        body: { error: 'Too Many Requests' }
      }).as('formSubmitResponse');
      break;
  }
});

Cypress.Commands.add('waitForPageLoad', () => {
  // Wait for any loading indicators to disappear
  cy.get('body').should('be.visible');
  
  // Wait for potential API calls to complete
  cy.wait(500);
});