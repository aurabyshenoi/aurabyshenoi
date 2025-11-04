# Design Document

## Overview

AuraByShenoi for aurabyshenoi is a modern, responsive web application that combines an elegant art gallery with an enquiry-based interest system. The design emphasizes visual appeal with a light, bright aesthetic using brown and sage green accents to create a warm, natural feeling that complements artwork presentation. Paintings are priced at 5000 rupees per square foot based on dimensions.

## Architecture

### Technology Stack
- **Frontend**: React with TypeScript for type safety and component reusability
- **Styling**: Tailwind CSS for rapid development with custom color palette
- **Backend**: Node.js with Express for API endpoints
- **Database**: MongoDB for flexible document storage of artwork and enquiries
- **Image Storage**: Cloudinary for optimized image delivery and transformations
- **Email Service**: SendGrid for enquiry confirmations and notifications

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express API    │────│   MongoDB       │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │                       │                       
┌─────────────────┐    ┌─────────────────┐              
│   Cloudinary    │    │     Stripe      │              
│  (Images)       │    │   (Payments)    │              
└─────────────────┘    └─────────────────┘              
```

## Components and Interfaces

### Frontend Components

#### Core Layout Components
- **Header**: Navigation with logo, gallery link, about link, and cart icon
- **Footer**: Contact information and social media links
- **Layout**: Wrapper component with consistent spacing and color scheme

#### Gallery Components
- **PaintingGrid**: Responsive masonry-style grid displaying painting thumbnails
- **PaintingCard**: Individual painting preview with image, title, and price
- **PaintingModal**: Detailed view with high-resolution images and full details
- **FilterBar**: Category and price range filtering controls

#### Enquiry Components
- **EnquiryButton**: Styled button for expressing interest in paintings
- **EnquiryForm**: Modal form collecting customer contact details and painting interest
- **PriceCalculator**: Component displaying calculated price based on dimensions at 5000 rupees per square foot
- **EnquiryConfirmation**: Success page showing enquiry submission confirmation

#### Contact Components
- **ContactPage**: Dedicated page with contact form for general inquiries
- **ContactForm**: Form collecting full name, phone, email, address, and query message with database storage
- **ContactConfirmation**: Success message after contact form submission
- **ContactEmailService**: Service for sending formatted email notifications to aurabyshenoi@gmail.com

#### Testimonial Components
- **TestimonialCarousel**: Horizontal scrolling container for testimonial cards with navigation arrows
- **TestimonialCard**: White card component with customer photo and testimonial quote
- **TestimonialSection**: Section wrapper for testimonials display on about page

#### Admin Components
- **AdminDashboard**: Overview of paintings and enquiries for aurabyshenoi
- **PaintingManager**: CRUD interface for artwork management
- **EnquiryManager**: Interface for viewing and managing customer enquiries
- **ImageUploader**: Drag-and-drop interface for painting images

### Backend API Endpoints

#### Public Endpoints
```
GET /api/paintings - Retrieve all available paintings
GET /api/paintings/:id - Get specific painting details
POST /api/enquiries - Submit customer enquiry
POST /api/enquiries/calculate-price - Calculate price based on dimensions
POST /api/contact - Submit general contact form with database storage and email notification
```

#### Admin Endpoints (Protected)
```
POST /api/admin/paintings - Add new painting
PUT /api/admin/paintings/:id - Update painting details
DELETE /api/admin/paintings/:id - Remove painting
GET /api/admin/enquiries - Get all customer enquiries
PUT /api/admin/enquiries/:id - Update enquiry status
GET /api/admin/contacts - Get all contact form submissions
PUT /api/admin/contacts/:id - Update contact status
GET /api/admin/testimonials - Get all testimonials
POST /api/admin/testimonials - Add new testimonial
PUT /api/admin/testimonials/:id - Update testimonial
DELETE /api/admin/testimonials/:id - Remove testimonial
```

#### Public Testimonial Endpoints
```
GET /api/testimonials - Retrieve active testimonials for display
```

## Data Models

### Painting Model
```typescript
interface Painting {
  _id: string;
  title: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'inches' | 'cm';
  };
  medium: string;
  price: number;
  category: string;
  images: {
    thumbnail: string;
    fullSize: string[];
  };
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Enquiry Model
```typescript
interface Enquiry {
  _id: string;
  enquiryNumber: string;
  painting: {
    paintingId: string;
    title: string;
    dimensions: {
      width: number;
      height: number;
      unit: 'inches' | 'cm';
    };
    calculatedPrice: number;
    image: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  message: string;
  status: 'new' | 'contacted' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}
```

### Contact Model
```typescript
interface Contact {
  _id: string;
  contactNumber: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  query: string;
  status: 'new' | 'contacted' | 'completed';
  emailNotificationSent: boolean;
  emailNotificationSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Testimonial Model
```typescript
interface Testimonial {
  _id: string;
  customerName: string;
  customerPhoto: string;
  testimonialText: string;
  rating?: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Design System

### Color Palette
```css
:root {
  /* Primary Colors */
  --color-sage-green: #9CAF88;
  --color-sage-green-light: #B8C5A6;
  --color-sage-green-dark: #7A8F6B;
  
  /* Secondary Colors */
  --color-brown: #8B6F47;
  --color-brown-light: #A68B6A;
  --color-brown-dark: #6B5537;
  
  /* Neutral Colors */
  --color-cream: #FAF8F5;
  --color-off-white: #F7F5F2;
  --color-warm-gray: #E8E6E1;
  --color-text-dark: #3A3A3A;
  --color-text-light: #6B6B6B;
}
```

### Typography
- **Primary Font**: Inter (clean, modern sans-serif)
- **Accent Font**: Playfair Display (elegant serif for headings)
- **Font Sizes**: Responsive scale from 14px to 48px

### Layout Principles
- **Grid System**: CSS Grid for painting gallery with responsive columns
- **Spacing**: 8px base unit with consistent padding and margins
- **Breakpoints**: Mobile-first responsive design (320px, 768px, 1024px, 1440px)

## User Experience Flow

### Customer Journey
1. **Landing Page**: Hero section with featured paintings and aurabyshenoi introduction
2. **Gallery Browse**: Filter and browse paintings in responsive grid
3. **Painting Details**: View high-resolution images and artwork information with calculated price
4. **Express Interest**: Click enquiry button to open interest form
5. **Enquiry Form**: Fill contact details, address, and specific painting requirements
6. **Confirmation**: Enquiry submission confirmation with contact expectations

### Admin Workflow (aurabyshenoi)
1. **Login**: Secure authentication to admin dashboard
2. **Inventory Management**: Add, edit, or remove paintings with image uploads
3. **Enquiry Management**: View customer enquiries and contact information
4. **Customer Communication**: Direct contact using provided customer details

## Error Handling

### Frontend Error Handling
- **Network Errors**: Retry mechanisms with user-friendly error messages
- **Form Validation**: Real-time validation with clear error indicators
- **Enquiry Submission**: Clear messaging for successful submissions
- **Image Loading**: Graceful fallbacks for failed image loads

### Backend Error Handling
- **API Errors**: Consistent error response format with appropriate HTTP status codes
- **Database Errors**: Connection retry logic and graceful degradation
- **Enquiry Processing**: Comprehensive error handling for form submissions
- **File Upload**: Size and format validation with clear error messages

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: User flow testing with Cypress
- **Visual Testing**: Screenshot comparison for design consistency
- **Accessibility Testing**: WCAG compliance validation

### Backend Testing
- **API Tests**: Endpoint testing with Jest and Supertest
- **Database Tests**: Model validation and query testing
- **Enquiry Tests**: Form submission and email notification testing
- **Security Tests**: Authentication and authorization validation

### Performance Testing
- **Load Testing**: Concurrent user simulation
- **Image Optimization**: Cloudinary delivery performance
- **Core Web Vitals**: Lighthouse performance auditing
- **Mobile Performance**: Device-specific testing

## Security Considerations

### Data Protection
- **HTTPS**: SSL/TLS encryption for all communications
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Prevention**: Parameterized queries and ORM usage
- **XSS Protection**: Content Security Policy and input sanitization

### Enquiry Security
- **Data Protection**: Secure handling of customer contact information
- **Form Validation**: Server-side validation of all enquiry data
- **Email Security**: Secure email delivery for confirmations
- **Privacy Compliance**: Proper handling of personal information

### Admin Security
- **Authentication**: JWT-based session management
- **Authorization**: Role-based access control
- **Rate Limiting**: API endpoint protection
- **Audit Logging**: Track admin actions and changes