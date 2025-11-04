# Requirements Document

## Introduction

AuraByShenoi website for "aurabyshenoi" that showcases paintings and enables customer enquiries. The system will serve as a digital gallery with an enquiry-based interest system, featuring a light, bright color scheme with brown and light sage green accents. Paintings are priced at 5000 rupees per square foot.

## Glossary

- **AuraByShenoi_System**: The complete web application including gallery and enquiry functionality for aurabyshenoi
- **Customer**: A user browsing paintings and submitting enquiries
- **Artist**: The administrator (aurabyshenoi) who manages artwork and enquiries
- **Painting**: A digital representation of artwork including images, details, and pricing at 5000 rupees per square foot
- **Enquiry**: A customer interest submission including contact details and painting preferences
- **Enquiry_Form**: A form collecting customer information for painting interest

## Requirements

### Requirement 1

**User Story:** As a customer, I want to browse paintings in an attractive gallery, so that I can discover artwork that interests me.

#### Acceptance Criteria

1. THE AuraByShenoi_System SHALL display paintings in a responsive grid layout with thumbnail images using light, bright colors with brown and sage green accents
2. WHEN a customer clicks on a painting thumbnail, THE AuraByShenoi_System SHALL display a detailed view with high-resolution images
3. THE AuraByShenoi_System SHALL display painting title, dimensions, medium, and price for each artwork
4. THE AuraByShenoi_System SHALL provide filtering options by category and price range
5. THE AuraByShenoi_System SHALL load the gallery page within 3 seconds on standard broadband connections

### Requirement 2

**User Story:** As a customer, I want to express interest in paintings through an enquiry form, so that I can connect with the artist about potential purchases.

#### Acceptance Criteria

1. WHEN a customer selects a painting, THE AuraByShenoi_System SHALL display an enquiry form for that painting
2. THE AuraByShenoi_System SHALL collect customer name, phone number, email, and address in the Enquiry_Form
3. THE AuraByShenoi_System SHALL allow customers to specify painting details and additional requirements in the enquiry
4. THE AuraByShenoi_System SHALL calculate and display painting price based on dimensions at 5000 rupees per square foot
5. WHEN enquiry is submitted, THE AuraByShenoi_System SHALL send confirmation to customer and notification to artist

### Requirement 3

**User Story:** As a customer, I want to provide my contact information in the enquiry form, so that the artist can reach me about the painting.

#### Acceptance Criteria

1. THE AuraByShenoi_System SHALL collect customer name, phone number, email, and address in the Enquiry_Form
2. THE AuraByShenoi_System SHALL validate email format and phone number format
3. THE AuraByShenoi_System SHALL require all contact fields to be completed before submission
4. THE AuraByShenoi_System SHALL allow customers to add specific requests or questions about the painting
5. THE AuraByShenoi_System SHALL send enquiry confirmation email to customer within 5 minutes

### Requirement 4

**User Story:** As an artist, I want to manage my artwork inventory, so that I can keep the website current with available paintings.

#### Acceptance Criteria

1. THE AuraByShenoi_System SHALL provide an administrative interface for adding new paintings
2. THE AuraByShenoi_System SHALL allow the artist to upload multiple high-quality images per painting
3. THE AuraByShenoi_System SHALL enable the artist to edit painting details including price and availability status
4. THE AuraByShenoi_System SHALL allow the artist to mark paintings as sold or unavailable
5. WHEN a painting is marked as sold, THE AuraByShenoi_System SHALL remove it from public gallery view within 1 minute

### Requirement 5

**User Story:** As an artist (aurabyshenoi), I want to manage customer enquiries, so that I can respond to potential buyers efficiently.

#### Acceptance Criteria

1. THE AuraByShenoi_System SHALL display all customer enquiries in an administrative dashboard
2. THE AuraByShenoi_System SHALL show customer contact details and painting interest for each enquiry
3. THE AuraByShenoi_System SHALL allow the artist to mark enquiries as contacted or completed
4. THE AuraByShenoi_System SHALL maintain enquiry records for business tracking purposes
5. THE AuraByShenoi_System SHALL provide customer contact information for direct follow-up communication

### Requirement 6

**User Story:** As a customer, I want to learn about aurabyshenoi and see testimonials from other customers, so that I can understand their background and build trust in their work.

#### Acceptance Criteria

1. THE AuraByShenoi_System SHALL include an about page with aurabyshenoi's biography and photo
2. THE AuraByShenoi_System SHALL display customer testimonials in white cards with customer photos and testimonial quotes
3. THE AuraByShenoi_System SHALL provide contact information for direct inquiries
4. THE AuraByShenoi_System SHALL showcase featured paintings prominently on the homepage
5. THE AuraByShenoi_System SHALL maintain consistent light, bright styling with brown and sage green color scheme throughout

### Requirement 8

**User Story:** As a customer, I want to see testimonials from other customers, so that I can build confidence in aurabyshenoi's work and service quality.

#### Acceptance Criteria

1. THE AuraByShenoi_System SHALL display testimonials in white card format with customer photos centered in each card
2. THE AuraByShenoi_System SHALL show testimonial text with large quote styling on one side of each card
3. THE AuraByShenoi_System SHALL implement horizontal scrolling animation moving testimonial cards slowly from right to left
4. THE AuraByShenoi_System SHALL display multiple testimonial cards in a continuous scrolling carousel
5. THE AuraByShenoi_System SHALL provide navigation arrows for manual testimonial browsing control
6. THE AuraByShenoi_System SHALL ensure testimonial cards maintain consistent white background and readable typography

### Requirement 7

**User Story:** As a customer, I want to contact aurabyshenoi directly through a contact form, so that I can make general inquiries beyond specific painting interests.

#### Acceptance Criteria

1. THE AuraByShenoi_System SHALL provide a dedicated contact page with a contact form
2. THE AuraByShenoi_System SHALL collect customer full name, phone number, email, address, and query message in the contact form
3. THE AuraByShenoi_System SHALL display "Contact Us: Drop in your query and we will reach out to you" as the page heading
4. THE AuraByShenoi_System SHALL validate all required contact form fields before submission
5. WHEN contact form is submitted, THE AuraByShenoi_System SHALL send confirmation to customer and notification to aurabyshenoi@gmail.com
6. THE AuraByShenoi_System SHALL store all contact form submissions in the database with timestamp and status tracking
7. THE AuraByShenoi_System SHALL format email notifications with proper contact details including customer name, email, phone, address, and query message
8. THE AuraByShenoi_System SHALL send email notifications to aurabyshenoi@gmail.com within 2 minutes of form submission