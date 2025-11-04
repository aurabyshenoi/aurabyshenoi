# Email Functionality Fix Requirements

## Introduction

The contact form email functionality is currently not working due to multiple issues including placeholder email configuration, TypeScript compilation errors, and server startup failures. This spec addresses fixing the email system to ensure emails are sent from aurabyshenoi@gmail.com to aurabyshenoi@gmail.com when users submit contact queries.

## Glossary

- **Email_Service**: The backend service responsible for sending emails via SendGrid or SMTP
- **Contact_Form**: The frontend form where users submit queries
- **SendGrid_API**: Third-party email service provider API
- **SMTP_Fallback**: Alternative email sending method when SendGrid is unavailable
- **Contact_Notification**: Email sent to artist when a contact form is submitted
- **Contact_Confirmation**: Email sent to customer confirming their form submission

## Requirements

### Requirement 1

**User Story:** As an artist, I want to receive email notifications when customers submit contact queries, so that I can respond promptly to potential clients.

#### Acceptance Criteria

1. WHEN a customer submits a contact form, THE Email_Service SHALL send a notification email to aurabyshenoi@gmail.com
2. THE Email_Service SHALL include the customer's full name, email, phone, address, and query message in the notification email
3. THE Email_Service SHALL generate a unique contact reference number for tracking purposes
4. THE Email_Service SHALL send the notification email within 2 minutes of form submission
5. IF the primary email service fails, THEN THE Email_Service SHALL retry sending up to 3 times with exponential backoff

### Requirement 2

**User Story:** As a customer, I want to receive a confirmation email after submitting a contact query, so that I know my message was received successfully.

#### Acceptance Criteria

1. WHEN a customer submits a contact form, THE Email_Service SHALL send a confirmation email to the customer's provided email address
2. THE Email_Service SHALL include the contact reference number and submission details in the confirmation email
3. THE Email_Service SHALL use aurabyshenoi@gmail.com as the sender address for confirmation emails
4. IF the confirmation email fails, THE Contact_Form SHALL still complete successfully but log the email failure

### Requirement 3

**User Story:** As a system administrator, I want the email service to be properly configured and handle errors gracefully, so that the application remains stable even when email services are unavailable.

#### Acceptance Criteria

1. THE Email_Service SHALL support both SendGrid API and SMTP fallback methods
2. THE Email_Service SHALL validate email configuration on server startup
3. IF SendGrid API key is not configured, THEN THE Email_Service SHALL use SMTP fallback automatically
4. THE Email_Service SHALL log all email sending attempts and their outcomes
5. THE Email_Service SHALL not cause server startup failures when email configuration is invalid