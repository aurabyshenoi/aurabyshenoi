# FormSubmit Email Fix Requirements

## Introduction

The contact form shows "query submitted successfully" but emails are not being received. The system needs to be cleaned up to use only FormSubmit.co service and remove all backend email service dependencies that may be causing conflicts.

## Glossary

- **FormSubmit Service**: Third-party email service (formsubmit.co) that handles form submissions and email delivery
- **Backend Email Service**: Legacy email service using SendGrid/SMTP that needs to be removed
- **Contact Route**: Backend API endpoint that processes contact form submissions
- **Email Configuration**: Environment variables and service configurations for email delivery

## Requirements

### Requirement 1

**User Story:** As a website visitor, I want to submit contact forms and have emails delivered reliably, so that my inquiries reach the artist.

#### Acceptance Criteria

1. WHEN a user submits the contact form, THE FormSubmit Service SHALL deliver the email to aurabyshenoi@gmail.com
2. WHEN the form submission is successful, THE System SHALL display a success message to the user
3. WHEN FormSubmit.co is unavailable, THE System SHALL display fallback contact information
4. THE System SHALL validate all form fields before submission
5. THE System SHALL provide clear error messages for failed submissions

### Requirement 2

**User Story:** As a system administrator, I want all backend email service dependencies removed, so that there are no conflicts with FormSubmit.co.

#### Acceptance Criteria

1. THE System SHALL remove all SendGrid API dependencies from the backend
2. THE System SHALL remove all SMTP configuration and dependencies from the backend
3. THE System SHALL remove all backend contact form processing routes
4. THE System SHALL remove all email service utility functions from the backend
5. THE System SHALL clean up all environment variables related to legacy email services

### Requirement 3

**User Story:** As a developer, I want the FormSubmit.co configuration to be properly set up, so that emails are delivered correctly.

#### Acceptance Criteria

1. THE FormSubmit Service SHALL use the correct endpoint URL for aurabyshenoi@gmail.com
2. THE FormSubmit Service SHALL include proper email formatting and templates
3. THE FormSubmit Service SHALL set appropriate reply-to headers for customer responses
4. THE FormSubmit Service SHALL include all necessary form fields in the email
5. THE FormSubmit Service SHALL handle form validation and error states properly