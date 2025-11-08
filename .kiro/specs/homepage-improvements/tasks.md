# Implementation Plan

- [x] 1. Remove gallery error popup from homepage
  - Modify `galleryErrorHandling.ts` to log errors to console instead of creating popup DOM elements
  - Remove popup creation logic from error handler functions
  - Update `initializeGalleryTesting` in `galleryTesting.ts` to only show test button in development mode
  - Verify no popup appears on homepage load
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement browser navigation support
- [x] 2.1 Create URL helper functions
  - Write `getPageFromPath` function to convert URL paths to page state
  - Write `getPathFromPage` function to convert page state to URL paths
  - Add type definitions for page types
  - _Requirements: 2.5_

- [x] 2.2 Integrate History API in App.tsx
  - Add useEffect to initialize page state from URL on mount
  - Modify navigation handler functions to use `window.history.pushState`
  - Add popstate event listener to handle browser back/forward buttons
  - Update all page navigation calls to use new navigation function
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2.3 Add browser history fallback handling
  - Detect if History API is supported
  - Implement fallback for unsupported browsers
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Implement newsletter subscription functionality
- [x] 3.1 Create Newsletter database model
  - Create `Newsletter.ts` model file in `backend/src/models/`
  - Define INewsletter interface with email, subscribedAt, status, and source fields
  - Create Mongoose schema with validation rules
  - Add unique index on email field
  - Add compound index on status and subscribedAt
  - Export Newsletter model
  - _Requirements: 3.3_

- [x] 3.2 Create newsletter API route
  - Create `newsletter.ts` route file in `backend/src/routes/`
  - Implement POST `/api/newsletter/subscribe` endpoint
  - Add email format validation
  - Add duplicate email check with appropriate error response
  - Implement error handling for validation and server errors
  - Return appropriate status codes (201, 400, 409, 500)
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.7_

- [x] 3.3 Register newsletter route in server
  - Import newsletter routes in `server.ts`
  - Add newsletter route to Express app with `/api/newsletter` prefix
  - _Requirements: 3.2_

- [x] 3.4 Create newsletter API utility function
  - Add `subscribeToNewsletter` function in `frontend/src/utils/api.ts`
  - Implement POST request to `/api/newsletter/subscribe` endpoint
  - Handle response and error cases
  - _Requirements: 3.2_

- [x] 3.5 Implement newsletter form in Homepage
  - Add newsletter form state management (email, loading, error, success)
  - Implement email validation on client side
  - Add onChange handler for email input
  - Implement onSubmit handler that calls newsletter API
  - Add loading state during API call
  - Display success message after successful subscription
  - Display error messages for validation and API errors
  - Reset form after successful submission
  - Update subscribe button to be disabled during loading and for invalid emails
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6_

- [x] 3.6 Add accessibility attributes to newsletter form
  - Add proper label with htmlFor attribute
  - Add ARIA attributes (aria-describedby, aria-invalid, aria-required)
  - Add role="alert" and aria-live="polite" to error message container
  - Add role="status" and aria-live="polite" to success message container
  - Ensure keyboard navigation works properly
  - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6_
