# Implementation Plan

- [x] 1. Remove cart context and state management
  - Remove CartProvider from main app component
  - Delete CartContext.tsx file completely
  - Remove cart-related type definitions from types/cart.ts
  - Update main.tsx to remove CartProvider wrapper
  - _Requirements: 3.2, 3.1_

- [x] 2. Remove cart-related components
  - [x] 2.1 Delete cart UI components
    - Remove ShoppingCart.tsx component file
    - Remove CartItem.tsx component file
    - Remove AddToCartButton.tsx component file
    - Update components/index.ts to remove cart component exports
    - _Requirements: 3.1, 1.1_

  - [x] 2.2 Delete checkout and payment components
    - Remove CheckoutForm.tsx component file
    - Remove CheckoutPage.tsx component file
    - Remove PaymentForm.tsx component file
    - Remove OrderConfirmation.tsx component file
    - Remove checkout-related type definitions from types/checkout.ts
    - _Requirements: 4.2, 4.1_

- [x] 3. Update existing components to remove cart dependencies
  - [x] 3.1 Update Header component
    - Remove cart icon and counter from Header.tsx
    - Remove cartItemCount prop and onCartClick handler
    - Remove ShoppingBag icon import if no longer used
    - _Requirements: 1.3, 1.4_

  - [x] 3.2 Update Layout component
    - Remove cart-related props from Layout.tsx interface
    - Remove cart prop passing to Header component
    - Clean up cart-related prop drilling
    - _Requirements: 1.3, 1.4_

  - [x] 3.3 Update Gallery component
    - Remove useCart hook import and usage
    - Remove cart-related handlers and state
    - Remove cart prop passing to Layout
    - _Requirements: 1.1, 1.2_

  - [x] 3.4 Update Homepage component
    - Remove useCart hook import and usage
    - Remove cart-related props and handlers
    - Remove cart prop passing to Layout
    - _Requirements: 1.1, 1.2_

  - [x] 3.5 Update other page components
    - Remove cart dependencies from About.tsx
    - Remove cart dependencies from ContactPage.tsx
    - Remove cart-related prop passing throughout component tree
    - _Requirements: 1.3, 1.4_

- [x] 4. Replace cart functionality with contact inquiry features
  - [x] 4.1 Update PaintingCard component
    - Replace AddToCartButton with "Inquire About This Piece" button
    - Add click handler to navigate to contact form with artwork reference
    - Maintain existing styling and accessibility features
    - _Requirements: 2.1, 2.2_

  - [x] 4.2 Update PaintingModal component
    - Replace purchase options with contact inquiry button
    - Add artwork reference passing to contact form
    - Remove price display if focusing on portfolio aspect
    - _Requirements: 2.1, 2.2_

  - [x] 4.3 Enhance ContactPage component
    - Add optional artwork reference field to contact form
    - Pre-populate form when accessed via artwork inquiry
    - Add clear indication of inquiry type in form
    - _Requirements: 2.2, 2.3_

- [x] 5. Remove backend payment integration
  - [x] 5.1 Remove Stripe configuration and routes
    - Delete config/stripe.ts configuration file
    - Remove payment routes from routes/payment.ts
    - Remove payment route registration from server.ts
    - _Requirements: 4.1, 4.3_

  - [x] 5.2 Remove order management system
    - Delete Order model from models/Order.ts
    - Remove order-related database operations
    - Remove order management from admin functionality
    - _Requirements: 4.3, 3.4_

  - [x] 5.3 Clean up payment-related utilities
    - Remove payment processing utilities
    - Remove Stripe webhook handlers
    - Remove payment-related middleware
    - _Requirements: 4.1, 4.4_

- [x] 6. Update package dependencies
  - [x] 6.1 Remove frontend payment dependencies
    - Remove @stripe/react-stripe-js from package.json
    - Remove @stripe/stripe-js from package.json
    - Run npm install to clean up node_modules
    - _Requirements: 3.5, 4.1_

  - [x] 6.2 Remove backend payment dependencies
    - Remove stripe package from backend/package.json
    - Remove payment-related utility packages
    - Run npm install in backend directory
    - _Requirements: 3.5, 4.1_

- [x] 7. Clean up environment variables and configuration
  - [x] 7.1 Remove payment-related environment variables
    - Remove VITE_STRIPE_PUBLISHABLE_KEY from frontend env files
    - Remove STRIPE_SECRET_KEY from backend env files
    - Remove STRIPE_WEBHOOK_SECRET from backend env files
    - Update .env.example files to remove payment variables
    - _Requirements: 4.4_

  - [x] 7.2 Update configuration files
    - Remove payment-related configurations
    - Update any build scripts that reference payment features
    - Clean up any payment-related constants or config objects
    - _Requirements: 4.4_

- [x] 8. Update navigation and user interface
  - [x] 8.1 Update main navigation
    - Remove cart and checkout links from navigation menus
    - Update routing to remove checkout-related routes
    - Ensure all navigation flows work without cart functionality
    - _Requirements: 5.1, 5.3_

  - [x] 8.2 Update homepage content
    - Remove purchase-focused calls-to-action
    - Update content to focus on portfolio and contact
    - Maintain visual design consistency
    - _Requirements: 5.2, 5.4_

- [x] 9. Update tests and remove cart-related testing
  - [x] 9.1 Remove cart-related test files
    - Delete cart context tests
    - Delete cart component tests
    - Delete checkout and payment tests
    - _Requirements: 3.1, 4.2_

  - [x] 9.2 Update existing tests
    - Update Gallery tests to remove cart interactions
    - Update navigation tests to remove cart-related flows
    - Update component tests to remove cart prop testing
    - _Requirements: 5.3_

  - [x] 9.3 Add tests for new contact inquiry functionality
    - Write tests for artwork inquiry buttons
    - Write tests for contact form with artwork reference
    - Write tests for updated navigation flows
    - _Requirements: 2.1, 2.2_

- [x] 10. Final validation and cleanup
  - [x] 10.1 Validate all functionality works
    - Test gallery browsing without cart functionality
    - Test contact form with and without artwork references
    - Test admin functionality still works correctly
    - Verify responsive design is maintained
    - _Requirements: 5.3, 5.4_

  - [x] 10.2 Update documentation
    - Update README.md to remove cart and payment references
    - Update component documentation
    - Update any API documentation to remove payment endpoints
    - _Requirements: 3.1, 4.1_