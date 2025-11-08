describe('Navigation E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate between all main pages', () => {
    // Test navigation to each page
    const pages = ['gallery', 'about', 'contact'] as const;
    
    pages.forEach((page) => {
      cy.navigateToPage(page);
      cy.url().should('include', page);
      
      // Navigate back to home
      cy.navigateToPage('home');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
    });
  });

  it('should display correct page titles and headers', () => {
    // Home page
    cy.visit('/');
    cy.get('h1').should('contain', 'AuraByShenoi');
    
    // Gallery page
    cy.navigateToPage('gallery');
    cy.get('h1').should('contain', 'Gallery');
    
    // About page
    cy.navigateToPage('about');
    cy.get('h1').should('contain', 'About');
    
    // Contact page
    cy.navigateToPage('contact');
    cy.get('h1').should('contain', 'Contact Us');
  });

  it('should have responsive navigation menu', () => {
    // Test desktop navigation
    cy.viewport(1280, 720);
    cy.visit('/');
    cy.get('nav').should('be.visible');
    cy.get('[data-testid="mobile-menu-button"]').should('not.be.visible');
    
    // Test mobile navigation
    cy.viewport(375, 667);
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    cy.get('nav').should('not.be.visible');
    
    // Open mobile menu
    cy.get('[data-testid="mobile-menu-button"]').click();
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
    
    // Test mobile navigation links
    cy.get('[data-testid="mobile-menu"]').within(() => {
      cy.contains('Gallery').click();
    });
    cy.url().should('include', 'gallery');
  });

  it('should show active navigation state', () => {
    // Navigate to gallery
    cy.navigateToPage('gallery');
    
    // Verify gallery nav item is active
    cy.get('nav').within(() => {
      cy.contains('Gallery').should('have.class', 'active');
    });
    
    // Navigate to about
    cy.navigateToPage('about');
    
    // Verify about nav item is active and gallery is not
    cy.get('nav').within(() => {
      cy.contains('About').should('have.class', 'active');
      cy.contains('Gallery').should('not.have.class', 'active');
    });
  });

  it('should maintain navigation state during page transitions', () => {
    // Start on home page
    cy.visit('/');
    
    // Navigate through pages and verify URL changes
    cy.navigateToPage('gallery');
    cy.url().should('include', 'gallery');
    
    cy.navigateToPage('about');
    cy.url().should('include', 'about');
    
    cy.navigateToPage('contact');
    cy.url().should('include', 'contact');
    
    // Use browser back button
    cy.go('back');
    cy.url().should('include', 'about');
    
    cy.go('back');
    cy.url().should('include', 'gallery');
  });

  it('should handle direct URL navigation', () => {
    // Test direct navigation to each page
    const pages = [
      { path: '/gallery', title: 'Gallery' },
      { path: '/about', title: 'About' },
      { path: '/contact', title: 'Contact' }
    ];
    
    pages.forEach((page) => {
      cy.visit(page.path);
      cy.url().should('include', page.path);
      cy.get('h1').should('contain', page.title);
    });
  });

  it('should show 404 page for invalid routes', () => {
    cy.visit('/invalid-route', { failOnStatusCode: false });
    
    // Verify 404 page or redirect to home
    cy.url().then((url) => {
      if (url.includes('404')) {
        cy.get('h1').should('contain', '404');
      } else {
        // If redirected to home, verify home page
        cy.url().should('eq', Cypress.config().baseUrl + '/');
      }
    });
  });
});