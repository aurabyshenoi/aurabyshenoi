/**
 * E2E tests for artwork inquiry functionality
 * Tests the flow from gallery to contact form with artwork reference
 */

describe('Artwork Inquiry Flow E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Gallery to Contact Inquiry Flow', () => {
    it('should navigate to contact form when inquiry button is clicked on painting card', () => {
      // Navigate to gallery
      cy.navigateToPage('gallery');
      cy.url().should('include', '/gallery');

      // Find and click inquiry button on first painting
      cy.get('[data-testid^="painting-card"]').first().within(() => {
        cy.contains('button', /Inquire About This Piece/i).click();
      });

      // Should navigate to contact page
      cy.url().should('include', '/contact');
      
      // Should show inquiry-specific heading
      cy.get('h1').should('contain', 'Inquire About');
    });

    it('should pre-populate contact form with artwork reference', () => {
      // Navigate to gallery
      cy.navigateToPage('gallery');

      // Click inquiry button on a specific painting
      cy.get('[data-testid="painting-card-1"]').within(() => {
        cy.contains('button', /Inquire About This Piece/i).click();
      });

      // Verify artwork reference is displayed
      cy.get('[data-testid="artwork-reference"]').should('be.visible');
      cy.get('[data-testid="artwork-reference"]').should('contain', 'Sunset Over Mountains');
    });

    it('should display artwork thumbnail in contact form', () => {
      cy.navigateToPage('gallery');

      // Click inquiry button
      cy.get('[data-testid^="painting-card"]').first().within(() => {
        cy.contains('button', /Inquire About This Piece/i).click();
      });

      // Verify artwork thumbnail is displayed
      cy.get('[data-testid="artwork-reference"]').within(() => {
        cy.get('img').should('be.visible');
        cy.get('img').should('have.attr', 'alt');
      });
    });

    it('should not show inquiry button for sold paintings', () => {
      cy.navigateToPage('gallery');

      // Find a sold painting (if any)
      cy.get('[data-testid^="painting-card"]').each(($card) => {
        if ($card.text().includes('Sold')) {
          cy.wrap($card).within(() => {
            cy.contains('button', 'Sold').should('be.disabled');
          });
        }
      });
    });
  });

  describe('Modal to Contact Inquiry Flow', () => {
    it('should navigate to contact from painting modal', () => {
      cy.navigateToPage('gallery');

      // Click on a painting to open modal
      cy.get('[data-testid^="painting-card"]').first().click();

      // Wait for modal to open
      cy.get('[data-testid="painting-modal"]').should('be.visible');

      // Click inquiry button in modal
      cy.get('[data-testid="painting-modal"]').within(() => {
        cy.contains('button', /Inquire About This Piece/i).click();
      });

      // Should navigate to contact page
      cy.url().should('include', '/contact');
    });

    it('should maintain artwork reference when navigating from modal', () => {
      cy.navigateToPage('gallery');

      // Open modal for specific painting
      cy.get('[data-testid="painting-card-1"]').click();
      cy.get('[data-testid="painting-modal"]').should('be.visible');

      // Get painting title from modal
      cy.get('[data-testid="painting-modal"]').find('h2').invoke('text').then((title) => {
        // Click inquiry button
        cy.get('[data-testid="painting-modal"]').within(() => {
          cy.contains('button', /Inquire About This Piece/i).click();
        });

        // Verify same painting is referenced in contact form
        cy.get('[data-testid="artwork-reference"]').should('contain', title);
      });
    });
  });

  describe('Contact Form Submission with Artwork Reference', () => {
    it('should submit inquiry with artwork reference', () => {
      cy.navigateToPage('gallery');

      // Click inquiry button
      cy.get('[data-testid^="painting-card"]').first().within(() => {
        cy.contains('button', /Inquire About This Piece/i).click();
      });

      // Fill out contact form
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('textarea[name="message"]').type('I am interested in this artwork. Can you provide more details?');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Should show success message
      cy.get('[data-testid="contact-success"]').should('be.visible');
    });

    it('should include artwork details in form submission', () => {
      cy.navigateToPage('gallery');

      // Click inquiry button on specific painting
      cy.get('[data-testid="painting-card-1"]').within(() => {
        cy.contains('button', /Inquire About This Piece/i).click();
      });

      // Verify hidden field with artwork reference exists
      cy.get('input[name="artworkReference"]').should('exist');
      cy.get('input[name="artworkReference"]').should('have.value');
    });
  });

  describe('General Contact Form (No Artwork Reference)', () => {
    it('should allow general contact without artwork reference', () => {
      cy.navigateToPage('contact');

      // Should show general contact heading
      cy.get('h1').should('contain', 'Contact Us');
      cy.get('h1').should('not.contain', 'Inquire About');

      // Should not show artwork reference
      cy.get('[data-testid="artwork-reference"]').should('not.exist');
    });

    it('should submit general inquiry successfully', () => {
      cy.navigateToPage('contact');

      // Fill out form
      cy.get('input[name="name"]').type('Jane Smith');
      cy.get('input[name="email"]').type('jane@example.com');
      cy.get('textarea[name="message"]').type('I have a general question about your artwork.');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Should show success message
      cy.get('[data-testid="contact-success"]').should('be.visible');
    });
  });

  describe('Navigation Between Pages', () => {
    it('should navigate back to gallery from contact page', () => {
      cy.navigateToPage('gallery');
      
      // Go to contact via inquiry
      cy.get('[data-testid^="painting-card"]').first().within(() => {
        cy.contains('button', /Inquire About This Piece/i).click();
      });

      // Click Browse Gallery button
      cy.contains('button', 'Browse Gallery').click();

      // Should return to gallery
      cy.url().should('include', '/gallery');
    });

    it('should navigate back to home from contact page', () => {
      cy.navigateToPage('contact');

      // Click Back to Home
      cy.contains('Back to Home').click();

      // Should return to home
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });

    it('should maintain navigation state after inquiry submission', () => {
      cy.navigateToPage('gallery');

      // Submit inquiry
      cy.get('[data-testid^="painting-card"]').first().within(() => {
        cy.contains('button', /Inquire About This Piece/i).click();
      });

      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('textarea[name="message"]').type('Test inquiry');
      cy.get('button[type="submit"]').click();

      // From success page, navigate to gallery
      cy.contains('button', 'Gallery').click();
      cy.url().should('include', '/gallery');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible inquiry buttons', () => {
      cy.navigateToPage('gallery');

      // Check inquiry buttons have proper labels
      cy.get('[data-testid^="painting-card"]').first().within(() => {
        cy.contains('button', /Inquire About This Piece/i)
          .should('have.attr', 'aria-label')
          .and('include', 'Inquire about');
      });
    });

    it('should be keyboard navigable', () => {
      cy.navigateToPage('gallery');

      // Tab to inquiry button
      cy.get('body').tab();
      cy.focused().should('have.attr', 'type', 'button');

      // Press enter to activate
      cy.focused().type('{enter}');

      // Should navigate to contact
      cy.url().should('include', '/contact');
    });
  });

  describe('Responsive Behavior', () => {
    it('should work on mobile devices', () => {
      cy.viewport('iphone-x');
      cy.navigateToPage('gallery');

      // Click inquiry button on mobile
      cy.get('[data-testid^="painting-card"]').first().within(() => {
        cy.contains('button', /Inquire About This Piece/i).click();
      });

      // Should navigate to contact
      cy.url().should('include', '/contact');

      // Artwork reference should be visible on mobile
      cy.get('[data-testid="artwork-reference"]').should('be.visible');
    });

    it('should work on tablet devices', () => {
      cy.viewport('ipad-2');
      cy.navigateToPage('gallery');

      // Test inquiry flow on tablet
      cy.get('[data-testid^="painting-card"]').first().within(() => {
        cy.contains('button', /Inquire About This Piece/i).click();
      });

      cy.url().should('include', '/contact');
      cy.get('[data-testid="artwork-reference"]').should('be.visible');
    });
  });
});
