describe('Admin Workflow E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to admin login page', () => {
    // Navigate to admin (this would depend on your routing implementation)
    cy.visit('/admin');
    
    // Verify admin login page
    cy.get('h1').should('contain', 'Admin Login');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Login');
  });

  it('should show validation errors for empty login form', () => {
    cy.visit('/admin');
    
    // Try to submit empty form
    cy.get('button[type="submit"]').click();
    
    // Verify validation errors
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.visit('/admin');
    
    // Fill form with invalid credentials
    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Verify error message
    cy.contains('Invalid credentials').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.visit('/admin');
    
    // Fill form with valid credentials (these would be test credentials)
    cy.get('input[type="email"]').type('admin@aurabyshenoi.com');
    cy.get('input[type="password"]').type('testpassword');
    cy.get('button[type="submit"]').click();
    
    // Verify redirect to admin dashboard
    cy.url().should('include', '/admin/dashboard');
    cy.get('h1').should('contain', 'Admin Dashboard');
  });

  context('Admin Dashboard (authenticated)', () => {
    beforeEach(() => {
      // Mock authentication or login before each test
      cy.visit('/admin');
      cy.get('input[type="email"]').type('admin@aurabyshenoi.com');
      cy.get('input[type="password"]').type('testpassword');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/admin/dashboard');
    });

    it('should display admin dashboard with navigation', () => {
      // Verify dashboard elements
      cy.get('[data-testid="admin-nav"]').should('be.visible');
      cy.get('[data-testid="admin-nav"]').within(() => {
        cy.contains('Paintings').should('be.visible');
        cy.contains('Enquiries').should('be.visible');
        cy.contains('Logout').should('be.visible');
      });
    });

    it('should navigate to painting management', () => {
      // Navigate to painting management
      cy.get('[data-testid="admin-nav"]').contains('Paintings').click();
      
      // Verify painting management page
      cy.url().should('include', '/admin/paintings');
      cy.get('h2').should('contain', 'Painting Management');
      cy.get('button').contains('Add New Painting').should('be.visible');
    });

    it('should open add painting form', () => {
      // Navigate to paintings and open add form
      cy.get('[data-testid="admin-nav"]').contains('Paintings').click();
      cy.get('button').contains('Add New Painting').click();
      
      // Verify form fields
      cy.get('[data-testid="painting-form"]').should('be.visible');
      cy.get('input[name="title"]').should('be.visible');
      cy.get('textarea[name="description"]').should('be.visible');
      cy.get('input[name="price"]').should('be.visible');
      cy.get('select[name="category"]').should('be.visible');
      cy.get('[data-testid="image-uploader"]').should('be.visible');
    });

    it('should validate painting form fields', () => {
      // Navigate to add painting form
      cy.get('[data-testid="admin-nav"]').contains('Paintings').click();
      cy.get('button').contains('Add New Painting').click();
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Verify validation errors
      cy.contains('Title is required').should('be.visible');
      cy.contains('Description is required').should('be.visible');
      cy.contains('Price is required').should('be.visible');
    });

    it('should navigate to enquiry management', () => {
      // Navigate to enquiry management
      cy.get('[data-testid="admin-nav"]').contains('Enquiries').click();
      
      // Verify enquiry management page
      cy.url().should('include', '/admin/enquiries');
      cy.get('h2').should('contain', 'Customer Enquiries');
    });

    it('should display enquiry list', () => {
      // Navigate to enquiries
      cy.get('[data-testid="admin-nav"]').contains('Enquiries').click();
      
      // Verify enquiry list elements
      cy.get('[data-testid="enquiry-list"]').should('be.visible');
      
      // If there are enquiries, verify their structure
      cy.get('[data-testid="enquiry-item"]').then(($enquiries) => {
        if ($enquiries.length > 0) {
          cy.get('[data-testid="enquiry-item"]').first().within(() => {
            cy.get('[data-testid="customer-name"]').should('be.visible');
            cy.get('[data-testid="enquiry-date"]').should('be.visible');
            cy.get('[data-testid="enquiry-status"]').should('be.visible');
            cy.get('button').contains('View Details').should('be.visible');
          });
        }
      });
    });

    it('should open enquiry details modal', () => {
      // Navigate to enquiries
      cy.get('[data-testid="admin-nav"]').contains('Enquiries').click();
      
      // Click on first enquiry if it exists
      cy.get('[data-testid="enquiry-item"]').then(($enquiries) => {
        if ($enquiries.length > 0) {
          cy.get('[data-testid="enquiry-item"]').first().within(() => {
            cy.get('button').contains('View Details').click();
          });
          
          // Verify enquiry details modal
          cy.get('[data-testid="enquiry-modal"]').should('be.visible');
          cy.get('[data-testid="enquiry-modal"]').within(() => {
            cy.get('[data-testid="customer-details"]').should('be.visible');
            cy.get('[data-testid="painting-details"]').should('be.visible');
            cy.get('[data-testid="enquiry-message"]').should('be.visible');
            cy.get('button').contains('Mark as Contacted').should('be.visible');
          });
        }
      });
    });

    it('should update enquiry status', () => {
      // Navigate to enquiries and open details
      cy.get('[data-testid="admin-nav"]').contains('Enquiries').click();
      
      cy.get('[data-testid="enquiry-item"]').then(($enquiries) => {
        if ($enquiries.length > 0) {
          cy.get('[data-testid="enquiry-item"]').first().within(() => {
            cy.get('button').contains('View Details').click();
          });
          
          // Update status
          cy.get('[data-testid="enquiry-modal"]').within(() => {
            cy.get('button').contains('Mark as Contacted').click();
          });
          
          // Verify status update
          cy.get('[data-testid="enquiry-status"]').should('contain', 'Contacted');
        }
      });
    });

    it('should logout successfully', () => {
      // Click logout
      cy.get('[data-testid="admin-nav"]').contains('Logout').click();
      
      // Verify redirect to login page
      cy.url().should('include', '/admin');
      cy.get('h1').should('contain', 'Admin Login');
    });
  });

  it('should redirect to login when accessing protected routes without authentication', () => {
    // Try to access admin dashboard directly
    cy.visit('/admin/dashboard');
    
    // Should redirect to login
    cy.url().should('include', '/admin');
    cy.get('h1').should('contain', 'Admin Login');
  });
});