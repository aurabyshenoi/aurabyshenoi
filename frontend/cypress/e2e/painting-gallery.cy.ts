describe('Painting Gallery E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to gallery and display paintings', () => {
    // Navigate to gallery
    cy.navigateToPage('gallery');
    
    // Verify gallery page loaded
    cy.url().should('include', 'gallery');
    
    // Check if paintings are displayed (assuming there are paintings)
    // This test would need actual data or mocked API responses
    cy.get('[data-testid="painting-grid"]').should('be.visible');
  });

  it('should open painting modal when clicking on a painting', () => {
    cy.navigateToPage('gallery');
    
    // Click on first painting (if any exist)
    cy.get('[data-testid="painting-card"]').first().click();
    
    // Verify modal opens
    cy.get('[data-testid="painting-modal"]').should('be.visible');
    
    // Verify modal content
    cy.get('[data-testid="painting-modal"]').within(() => {
      cy.get('h2').should('be.visible'); // Painting title
      cy.get('img').should('be.visible'); // Painting image
      cy.get('button').contains('Add to Cart').should('be.visible');
    });
  });

  it('should close painting modal when clicking close button', () => {
    cy.navigateToPage('gallery');
    
    // Open modal
    cy.get('[data-testid="painting-card"]').first().click();
    cy.get('[data-testid="painting-modal"]').should('be.visible');
    
    // Close modal
    cy.get('[data-testid="painting-modal"]').within(() => {
      cy.get('button[aria-label="Close"]').click();
    });
    
    // Verify modal is closed
    cy.get('[data-testid="painting-modal"]').should('not.exist');
  });

  it('should close painting modal when pressing Escape key', () => {
    cy.navigateToPage('gallery');
    
    // Open modal
    cy.get('[data-testid="painting-card"]').first().click();
    cy.get('[data-testid="painting-modal"]').should('be.visible');
    
    // Press Escape key
    cy.get('body').type('{esc}');
    
    // Verify modal is closed
    cy.get('[data-testid="painting-modal"]').should('not.exist');
  });

  it('should navigate between images in painting modal', () => {
    cy.navigateToPage('gallery');
    
    // Open modal for painting with multiple images
    cy.get('[data-testid="painting-card"]').first().click();
    cy.get('[data-testid="painting-modal"]').should('be.visible');
    
    // Check if navigation buttons exist (for paintings with multiple images)
    cy.get('[data-testid="painting-modal"]').within(() => {
      cy.get('button[aria-label="Next image"]').should('be.visible');
      cy.get('button[aria-label="Previous image"]').should('be.visible');
      
      // Click next image
      cy.get('button[aria-label="Next image"]').click();
      
      // Verify image changed (this would need specific implementation details)
      cy.get('img').should('be.visible');
    });
  });

  it('should filter paintings by category', () => {
    cy.navigateToPage('gallery');
    
    // Use filter controls
    cy.get('[data-testid="filter-bar"]').within(() => {
      cy.get('select[name="category"]').select('landscape');
    });
    
    // Verify filtered results
    cy.get('[data-testid="painting-card"]').each(($card) => {
      cy.wrap($card).should('contain', 'landscape');
    });
  });

  it('should filter paintings by price range', () => {
    cy.navigateToPage('gallery');
    
    // Set price range filter
    cy.get('[data-testid="filter-bar"]').within(() => {
      cy.get('input[name="minPrice"]').type('100');
      cy.get('input[name="maxPrice"]').type('500');
      cy.get('button').contains('Apply Filters').click();
    });
    
    // Verify filtered results show prices within range
    cy.get('[data-testid="painting-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        cy.get('[data-testid="painting-price"]').invoke('text').then((priceText) => {
          const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
          expect(price).to.be.at.least(100);
          expect(price).to.be.at.most(500);
        });
      });
    });
  });

  it('should search paintings by title or description', () => {
    cy.navigateToPage('gallery');
    
    // Use search functionality
    cy.get('[data-testid="search-input"]').type('landscape');
    cy.get('button[type="submit"]').click();
    
    // Verify search results
    cy.get('[data-testid="painting-card"]').should('exist');
    cy.get('[data-testid="painting-card"]').each(($card) => {
      cy.wrap($card).should('contain.text', 'landscape');
    });
  });

  it('should add painting to cart from modal', () => {
    cy.navigateToPage('gallery');
    
    // Open painting modal
    cy.get('[data-testid="painting-card"]').first().click();
    
    // Add to cart
    cy.get('[data-testid="painting-modal"]').within(() => {
      cy.get('button').contains('Add to Cart').click();
    });
    
    // Verify cart icon shows item count
    cy.get('[data-testid="cart-icon"]').should('contain', '1');
    
    // Verify success message or cart update
    cy.get('[data-testid="cart-notification"]').should('be.visible');
  });

  it('should handle pagination in gallery', () => {
    cy.navigateToPage('gallery');
    
    // Check if pagination exists (when there are many paintings)
    cy.get('[data-testid="pagination"]').then(($pagination) => {
      if ($pagination.length > 0) {
        // Click next page
        cy.get('[data-testid="pagination"]').within(() => {
          cy.get('button').contains('Next').click();
        });
        
        // Verify page changed
        cy.url().should('include', 'page=2');
        
        // Verify different paintings are shown
        cy.get('[data-testid="painting-card"]').should('exist');
      }
    });
  });

  it('should display painting details correctly in modal', () => {
    cy.navigateToPage('gallery');
    
    // Open painting modal
    cy.get('[data-testid="painting-card"]').first().click();
    
    // Verify all painting details are displayed
    cy.get('[data-testid="painting-modal"]').within(() => {
      cy.get('h2').should('be.visible'); // Title
      cy.get('[data-testid="painting-medium"]').should('be.visible'); // Medium
      cy.get('[data-testid="painting-dimensions"]').should('be.visible'); // Dimensions
      cy.get('[data-testid="painting-category"]').should('be.visible'); // Category
      cy.get('[data-testid="painting-description"]').should('be.visible'); // Description
      cy.get('[data-testid="painting-price"]').should('be.visible'); // Price
    });
  });
});