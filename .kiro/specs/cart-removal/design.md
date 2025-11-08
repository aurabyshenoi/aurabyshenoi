# Cart Removal Design Document

## Overview

This design outlines the systematic removal of all shopping cart functionality from the artist portfolio website. The removal involves eliminating cart-related components, context providers, payment integrations, and associated backend services while maintaining the core gallery and contact functionality.

## Architecture

### Current Cart Architecture (To Be Removed)

```
Frontend Cart System:
├── CartContext (State Management)
├── ShoppingCart Component (Cart UI)
├── AddToCartButton Component
├── CartItem Component
├── CheckoutForm Component
├── CheckoutPage Component
├── PaymentForm Component
└── Order Management

Backend Payment System:
├── Stripe Integration
├── Payment Routes
├── Order Models
└── Payment Processing
```

### Target Architecture (After Removal)

```
Simplified Portfolio System:
├── Gallery Display
├── Artwork Details
├── Contact Integration
└── Admin Management (Paintings Only)
```

## Components and Interfaces

### Frontend Components to Remove

1. **Cart-Related Components**
   - `ShoppingCart.tsx` - Main cart interface
   - `AddToCartButton.tsx` - Add to cart functionality
   - `CartItem.tsx` - Individual cart item display
   - `CheckoutForm.tsx` - Checkout form interface
   - `CheckoutPage.tsx` - Checkout page wrapper
   - `PaymentForm.tsx` - Payment processing form
   - `OrderConfirmation.tsx` - Order confirmation display

2. **Context and State Management**
   - `CartContext.tsx` - Cart state management
   - Cart-related types in `types/cart.ts`
   - Checkout-related types in `types/checkout.ts`

3. **Integration Points to Update**
   - Remove cart props from `Layout.tsx`
   - Remove cart props from `Header.tsx`
   - Update `Gallery.tsx` to remove cart integration
   - Update `Homepage.tsx` to remove cart integration
   - Update `About.tsx` to remove cart integration
   - Update `ContactPage.tsx` to remove cart integration

### Backend Components to Remove

1. **Payment Integration**
   - Stripe configuration in `config/stripe.ts`
   - Payment routes in `routes/payment.ts`
   - Order model in `models/Order.ts`
   - Payment-related utilities

2. **API Endpoints**
   - `/api/payment/*` routes
   - Order management endpoints
   - Payment processing endpoints

### Components to Modify

1. **Painting Display Components**
   - `PaintingCard.tsx` - Remove AddToCartButton, add contact inquiry
   - `PaintingModal.tsx` - Replace purchase options with contact options
   - `PaintingGrid.tsx` - Update to focus on display only

2. **Navigation Components**
   - `Header.tsx` - Remove cart icon and counter
   - `Layout.tsx` - Remove cart-related props and handlers
   - Update navigation to remove checkout/cart links

3. **Contact Integration**
   - Enhance contact form to include artwork inquiry functionality
   - Add "Inquire About This Piece" buttons to artwork displays
   - Pre-populate contact forms with artwork references

## Data Models

### Models to Remove

1. **Order Model** (`backend/src/models/Order.ts`)
   - Complete removal of order tracking
   - Remove order-related database collections

2. **Cart Types** (`frontend/src/types/cart.ts`)
   - Remove CartItem interface
   - Remove CartState interface
   - Remove CartContextType interface

3. **Checkout Types** (`frontend/src/types/checkout.ts`)
   - Remove CheckoutFormData interface
   - Remove ShippingOption interface
   - Remove payment-related type definitions

### Models to Modify

1. **Painting Model**
   - Keep existing structure
   - Remove any cart-specific fields if present
   - Maintain availability status for display purposes

2. **Contact Model**
   - Enhance to support artwork inquiries
   - Add optional artwork reference field
   - Maintain existing contact functionality

## Error Handling

### Removed Error Scenarios
- Payment processing failures
- Cart state corruption
- Checkout validation errors
- Stripe integration errors

### Maintained Error Scenarios
- Gallery loading failures
- Contact form submission errors
- Image loading failures
- Admin authentication errors

### New Error Scenarios
- Contact inquiry submission failures
- Artwork reference validation errors

## Testing Strategy

### Tests to Remove
- Cart functionality tests
- Checkout process tests
- Payment integration tests
- Order management tests

### Tests to Update
- Gallery component tests (remove cart interactions)
- Navigation tests (remove cart-related navigation)
- Contact form tests (add artwork inquiry scenarios)

### New Tests to Add
- Artwork inquiry functionality tests
- Updated navigation flow tests
- Contact form with artwork reference tests

## Implementation Phases

### Phase 1: Frontend Cart Removal
1. Remove cart context provider from app root
2. Remove cart-related components
3. Update existing components to remove cart dependencies
4. Remove cart-related imports and exports

### Phase 2: Navigation and UI Updates
1. Update header to remove cart icon
2. Update layout components to remove cart props
3. Add artwork inquiry buttons to painting displays
4. Update contact form for artwork inquiries

### Phase 3: Backend Cleanup
1. Remove payment routes and controllers
2. Remove Stripe configuration and integration
3. Remove order model and related database operations
4. Clean up payment-related environment variables

### Phase 4: Testing and Validation
1. Update existing tests to remove cart scenarios
2. Add tests for new contact inquiry functionality
3. Validate all navigation flows work correctly
4. Ensure responsive design is maintained

## Contact Integration Enhancement

### Artwork Inquiry Flow
1. **Gallery View**: Replace "Add to Cart" with "Inquire About This Piece"
2. **Painting Modal**: Add prominent inquiry button
3. **Contact Form**: Pre-populate with artwork details when accessed via inquiry
4. **Contact Success**: Acknowledge artwork-specific inquiries

### Contact Form Enhancements
- Add optional "Artwork of Interest" field
- Pre-populate when accessed via artwork inquiry
- Maintain existing general contact functionality
- Clear indication of inquiry type in admin notifications

## Dependencies to Remove

### Frontend Dependencies
- Stripe React components (`@stripe/react-stripe-js`)
- Stripe JavaScript SDK (`@stripe/stripe-js`)
- Cart-related utility libraries

### Backend Dependencies
- Stripe Node.js SDK (`stripe`)
- Payment processing utilities
- Order management dependencies

## Environment Variables to Remove

### Frontend
- `VITE_STRIPE_PUBLISHABLE_KEY`
- Any cart-related configuration variables

### Backend
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Payment-related configuration variables

## Migration Considerations

### Data Preservation
- Maintain existing painting data
- Preserve contact form submissions
- Keep admin authentication system
- Maintain testimonial functionality

### User Experience
- Ensure smooth transition from e-commerce to portfolio
- Maintain visual design consistency
- Preserve accessibility features
- Keep responsive design intact

### SEO and Analytics
- Update meta descriptions to reflect portfolio focus
- Remove e-commerce structured data
- Maintain gallery and artwork SEO optimization
- Update analytics tracking to remove commerce events