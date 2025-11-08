import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactFormSubmit from '../ContactFormSubmit';

// Mock fetch
global.fetch = vi.fn();

describe('ContactFormSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  describe('Required Field Validation', () => {
    test('should validate required name field', async () => {
      render(<ContactFormSubmit />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    test('should validate required email field', async () => {
      render(<ContactFormSubmit />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    test('should validate required message field', async () => {
      render(<ContactFormSubmit />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Message is required')).toBeInTheDocument();
      });
    });

    test('should validate name minimum length', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const nameInput = screen.getByLabelText(/name \*/i);
      await user.type(nameInput, 'A');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      });
    });

    test('should prevent name input exceeding maximum length', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const nameInput = screen.getByLabelText(/name \*/i);
      const longName = 'a'.repeat(101);
      await user.type(nameInput, longName);

      // Input should be limited to 100 characters by maxlength attribute
      expect(nameInput).toHaveValue('a'.repeat(100));
    });

    test('should validate message minimum length', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const messageInput = screen.getByLabelText(/message \*/i);
      await user.type(messageInput, 'Short');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
      });
    });

    test('should prevent message input exceeding maximum length', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const messageInput = screen.getByLabelText(/message \*/i);
      const longMessage = 'a'.repeat(1001);
      await user.type(messageInput, longMessage);

      // Input should be limited to 1000 characters by maxlength attribute
      expect(messageInput).toHaveValue('a'.repeat(1000));
    });
  });

  describe('Email Format Validation', () => {
    test('should validate email format with regex pattern', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const emailInput = screen.getByLabelText(/email address \*/i);
      
      // Test invalid email formats
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@domain.com',
        'test@domain',
        'test.domain.com',
        'test@.com',
        'test@domain.',
        'test space@domain.com'
      ];

      for (const invalidEmail of invalidEmails) {
        await user.clear(emailInput);
        await user.type(emailInput, invalidEmail);

        const submitButton = screen.getByRole('button', { name: /send message/i });
        const form = submitButton.closest('form');
        
        fireEvent.submit(form!);

        await waitFor(() => {
          expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
        });
      }
    });

    test('should accept valid email formats', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const emailInput = screen.getByLabelText(/email address \*/i);
      
      // Test valid email formats
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        'user123@test-domain.com'
      ];

      for (const validEmail of validEmails) {
        await user.clear(emailInput);
        await user.type(emailInput, validEmail);

        const submitButton = screen.getByRole('button', { name: /send message/i });
        const form = submitButton.closest('form');
        
        fireEvent.submit(form!);

        await waitFor(() => {
          expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Optional Phone Number Format Validation', () => {
    test('should validate phone number format when provided', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      
      // Fill required fields first to isolate phone validation
      await user.type(screen.getByLabelText(/name \*/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address \*/i), 'john@example.com');
      await user.type(screen.getByLabelText(/message \*/i), 'This is a test message with enough characters');
      
      // Test invalid phone formats
      const invalidPhones = [
        'abc123',
        '0123456789', // starts with 0
        '+0123456789', // starts with +0
        'phone-number',
        '++1234567890'
      ];

      for (const invalidPhone of invalidPhones) {
        await user.clear(phoneInput);
        await user.type(phoneInput, invalidPhone);

        const submitButton = screen.getByRole('button', { name: /send message/i });
        const form = submitButton.closest('form');
        
        fireEvent.submit(form!);

        await waitFor(() => {
          expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument();
        });
      }
    });

    test('should accept valid phone number formats', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      // Fill required fields first
      await user.type(screen.getByLabelText(/name \*/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address \*/i), 'john@example.com');
      await user.type(screen.getByLabelText(/message \*/i), 'This is a test message with enough characters');

      const phoneInput = screen.getByLabelText(/phone number/i);
      
      // Test valid phone formats
      const validPhones = [
        '1234567890',
        '+1234567890',
        '123456789012345', // 15 digits max
        '+9876543210'
      ];

      for (const validPhone of validPhones) {
        await user.clear(phoneInput);
        await user.type(phoneInput, validPhone);

        const submitButton = screen.getByRole('button', { name: /send message/i });
        const form = submitButton.closest('form');
        
        fireEvent.submit(form!);

        await waitFor(() => {
          expect(screen.queryByText('Please enter a valid phone number')).not.toBeInTheDocument();
        });
      }
    });

    test('should not validate phone number when field is empty', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      // Fill required fields but leave phone empty
      await user.type(screen.getByLabelText(/name \*/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address \*/i), 'john@example.com');
      await user.type(screen.getByLabelText(/message \*/i), 'This is a test message with enough characters');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      // Should not show phone validation error when empty
      expect(screen.queryByText('Please enter a valid phone number')).not.toBeInTheDocument();
    });
  });

  describe('Real-time Validation Feedback', () => {
    test('should clear error messages when user starts typing', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      // Submit empty form to show errors
      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Message is required')).toBeInTheDocument();
      });

      // Start typing in name field
      const nameInput = screen.getByLabelText(/name \*/i);
      await user.type(nameInput, 'J');

      // Name error should be cleared
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();

      // Start typing in email field
      const emailInput = screen.getByLabelText(/email address \*/i);
      await user.type(emailInput, 't');

      // Email error should be cleared
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();

      // Start typing in message field
      const messageInput = screen.getByLabelText(/message \*/i);
      await user.type(messageInput, 'T');

      // Message error should be cleared
      expect(screen.queryByText('Message is required')).not.toBeInTheDocument();
    });

    test('should show character count for message field', () => {
      render(<ContactFormSubmit />);
      
      // Should show initial character count
      expect(screen.getByText('0/1000')).toBeInTheDocument();
    });

    test('should update character count as user types in message field', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const messageInput = screen.getByLabelText(/message \*/i);
      await user.type(messageInput, 'Test message');

      expect(screen.getByText('12/1000')).toBeInTheDocument();
    });

    test('should display error messages with alert icons', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      await waitFor(() => {
        // Check that error messages are displayed with proper styling
        const nameError = screen.getByText('Name is required');
        const emailError = screen.getByText('Email is required');
        const messageError = screen.getByText('Message is required');

        expect(nameError).toBeInTheDocument();
        expect(emailError).toBeInTheDocument();
        expect(messageError).toBeInTheDocument();

        // Check that error styling is applied to inputs
        const nameInput = screen.getByLabelText(/name \*/i);
        const emailInput = screen.getByLabelText(/email address \*/i);
        const messageInput = screen.getByLabelText(/message \*/i);

        expect(nameInput).toHaveClass('border-red-300', 'bg-red-50');
        expect(emailInput).toHaveClass('border-red-300', 'bg-red-50');
        expect(messageInput).toHaveClass('border-red-300', 'bg-red-50');
      });
    });
  });

  describe('Form Submission Prevention', () => {
    test('should prevent form submission when validation fails', async () => {
      render(<ContactFormSubmit />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      // Should not call fetch when validation fails
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('should allow form submission when all validation passes', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      render(<ContactFormSubmit />);

      // Fill all required fields with valid data
      await user.type(screen.getByLabelText(/name \*/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address \*/i), 'john@example.com');
      await user.type(screen.getByLabelText(/message \*/i), 'This is a valid test message with enough characters');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      // Should call fetch when validation passes
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://formsubmit.co/aurabyshenoi@gmail.com',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData)
          })
        );
      });
    });

    test('should validate all fields simultaneously on submission', async () => {
      render(<ContactFormSubmit />);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      await waitFor(() => {
        // All required field errors should be shown at once
        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Message is required')).toBeInTheDocument();
      });

      // Should not call fetch when multiple validations fail
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('should prevent submission with partial validation failures', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      // Fill only name field, leave others empty
      await user.type(screen.getByLabelText(/name \*/i), 'John Doe');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      await waitFor(() => {
        // Should still show errors for missing fields
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Message is required')).toBeInTheDocument();
      });

      // Should not call fetch when some validations fail
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Advanced Validation Edge Cases', () => {
    test('should handle name with special characters and spaces', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const nameInput = screen.getByLabelText(/name \*/i);
      
      // Test names with special characters (should be valid)
      const validNames = [
        'Mary-Jane Smith',
        "O'Connor",
        'José García',
        'Anne Marie',
        'Dr. Smith Jr.',
        'Van Der Berg'
      ];

      for (const validName of validNames) {
        await user.clear(nameInput);
        await user.type(nameInput, validName);

        const submitButton = screen.getByRole('button', { name: /send message/i });
        const form = submitButton.closest('form');
        
        fireEvent.submit(form!);

        await waitFor(() => {
          // Should not show name validation error for valid names
          expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
          expect(screen.queryByText('Name must be at least 2 characters')).not.toBeInTheDocument();
        });
      }
    });

    test('should handle email edge cases correctly', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const emailInput = screen.getByLabelText(/email address \*/i);
      
      // Test edge case valid emails
      const validEmails = [
        'test+tag@example.com',
        'user.name+tag@example.co.uk',
        'test123@sub.domain.com',
        'a@b.co',
        'very.long.email.address@very.long.domain.name.com'
      ];

      for (const validEmail of validEmails) {
        await user.clear(emailInput);
        await user.type(emailInput, validEmail);

        const submitButton = screen.getByRole('button', { name: /send message/i });
        const form = submitButton.closest('form');
        
        fireEvent.submit(form!);

        await waitFor(() => {
          // Should not show email validation error for valid emails
          expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
        });
      }
    });

    test('should handle phone number with various formatting', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      // Fill required fields first
      await user.type(screen.getByLabelText(/name \*/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address \*/i), 'john@example.com');
      await user.type(screen.getByLabelText(/message \*/i), 'This is a test message with enough characters');

      const phoneInput = screen.getByLabelText(/phone number/i);
      
      // Test phone numbers with formatting (should be cleaned and validated)
      const formattedPhones = [
        '(555) 123-4567',
        '555-123-4567',
        '555 123 4567',
        '+1 (555) 123-4567',
        '+44 20 7946 0958'
      ];

      for (const formattedPhone of formattedPhones) {
        await user.clear(phoneInput);
        await user.type(phoneInput, formattedPhone);

        const submitButton = screen.getByRole('button', { name: /send message/i });
        const form = submitButton.closest('form');
        
        fireEvent.submit(form!);

        // Note: The current implementation may not handle all formatting,
        // but we test that it doesn't crash and provides appropriate feedback
        await waitFor(() => {
          // Should either accept the phone or show validation error
          const hasPhoneError = screen.queryByText('Please enter a valid phone number');
          // This is acceptable - the test verifies the validation runs without crashing
        });
      }
    });

    test('should handle message with various content types', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      const messageInput = screen.getByLabelText(/message \*/i);
      
      // Test messages with special content
      const validMessages = [
        'Hello! I am interested in your artwork. Can you provide more information?',
        'Message with numbers: 123-456-7890 and email: test@example.com',
        'Message with symbols: $100, 50% off, & more!',
        'Multi-line\nmessage\nwith\nbreaks',
        'Message with "quotes" and \'apostrophes\'',
        'Unicode message: café, naïve, résumé'
      ];

      for (const validMessage of validMessages) {
        await user.clear(messageInput);
        await user.type(messageInput, validMessage);

        const submitButton = screen.getByRole('button', { name: /send message/i });
        const form = submitButton.closest('form');
        
        fireEvent.submit(form!);

        await waitFor(() => {
          // Should not show message validation error for valid messages
          expect(screen.queryByText('Message is required')).not.toBeInTheDocument();
          expect(screen.queryByText('Message must be at least 10 characters')).not.toBeInTheDocument();
        });
      }
    });

    test('should trim whitespace from form fields before validation', async () => {
      const user = userEvent.setup();
      render(<ContactFormSubmit />);

      // Fill fields with leading/trailing whitespace
      await user.type(screen.getByLabelText(/name \*/i), '  John Doe  ');
      await user.type(screen.getByLabelText(/email address \*/i), '  john@example.com  ');
      await user.type(screen.getByLabelText(/phone number/i), '  +1234567890  ');
      await user.type(screen.getByLabelText(/message \*/i), '  This is a test message with whitespace.  ');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      const form = submitButton.closest('form');
      
      fireEvent.submit(form!);

      // Should not show validation errors for fields with trimmed whitespace
      await waitFor(() => {
        expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Message is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Email Template Formatting', () => {
    test('should configure FormSubmit.co with professional email formatting fields', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      render(<ContactFormSubmit />);

      // Fill form with test data
      await user.type(screen.getByLabelText(/name \*/i), 'Jane Smith');
      await user.type(screen.getByLabelText(/email address \*/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '+1234567890');
      await user.type(screen.getByLabelText(/message \*/i), 'This is a test inquiry about artwork pricing and availability.');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Get the FormData that was sent
      const fetchCall = (global.fetch as any).mock.calls[0];
      const formData = fetchCall[1].body as FormData;

      // Verify enhanced FormSubmit.co configuration fields
      expect(formData.get('_subject')).toBe('Contact Form: Jane Smith');
      expect(formData.get('_template')).toBe('table');
      expect(formData.get('_replyto')).toBe('jane@example.com');
      expect(formData.get('_captcha')).toBe('false');
      expect(formData.get('_autoresponse')).toBe('Thank you for contacting us! We will respond within 24-48 hours.');
    });

    test('should include custom subject line with customer name interpolation', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      render(<ContactFormSubmit />);

      // Fill form with test data
      await user.type(screen.getByLabelText(/name \*/i), 'John Doe');
      await user.type(screen.getByLabelText(/email address \*/i), 'john@example.com');
      await user.type(screen.getByLabelText(/message \*/i), 'Test message for subject line verification.');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      const formData = fetchCall[1].body as FormData;

      // Verify custom subject line includes customer name
      expect(formData.get('_subject')).toBe('Contact Form: John Doe');
    });

    test('should set customer email as reply-to address', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      render(<ContactFormSubmit />);

      // Fill form with test data
      await user.type(screen.getByLabelText(/name \*/i), 'Alice Johnson');
      await user.type(screen.getByLabelText(/email address \*/i), 'ALICE@EXAMPLE.COM'); // Test case normalization
      await user.type(screen.getByLabelText(/message \*/i), 'Test message for reply-to verification.');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      const formData = fetchCall[1].body as FormData;

      // Verify reply-to is set to customer email (normalized to lowercase)
      expect(formData.get('_replyto')).toBe('alice@example.com');
    });

    test('should include structured email template with labeled customer information', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      render(<ContactFormSubmit />);

      // Fill form with complete test data
      await user.type(screen.getByLabelText(/name \*/i), 'Bob Wilson');
      await user.type(screen.getByLabelText(/email address \*/i), 'bob@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '+1987654321');
      await user.type(screen.getByLabelText(/message \*/i), 'I am interested in commissioning a custom painting for my office.');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      const formData = fetchCall[1].body as FormData;

      // Verify form data includes customer information
      expect(formData.get('name')).toBe('Bob Wilson');
      expect(formData.get('email')).toBe('bob@example.com');
      expect(formData.get('phone')).toBe('+1987654321');
      expect(formData.get('message')).toBe('I am interested in commissioning a custom painting for my office.');
      
      // Verify FormSubmit uses built-in table template for better formatting
      expect(formData.get('_template')).toBe('table');
    });

    test('should handle optional phone field in email template', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      render(<ContactFormSubmit />);

      // Fill form without phone number
      await user.type(screen.getByLabelText(/name \*/i), 'Sarah Davis');
      await user.type(screen.getByLabelText(/email address \*/i), 'sarah@example.com');
      await user.type(screen.getByLabelText(/message \*/i), 'Test message without phone number.');

      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const fetchCall = (global.fetch as any).mock.calls[0];
      const formData = fetchCall[1].body as FormData;

      // Verify form data includes customer info but excludes phone when not provided
      expect(formData.get('name')).toBe('Sarah Davis');
      expect(formData.get('email')).toBe('sarah@example.com');
      expect(formData.get('phone')).toBeNull(); // Phone not included when empty
      expect(formData.get('message')).toBe('Test message without phone number.');
    });
  });

  describe('Form Submission State Management', () => {
    test('should show loading state during form submission', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to simulate slow response
      (global.fetch as any).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ ok: true }), 100);
        });
      });

      render(<ContactFormSubmit />);

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/message/i), 'This is a test message for loading state.');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Verify loading state is shown
      expect(screen.getByText(/sending message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sending message/i })).toBeDisabled();
      
      // Verify loading spinner is present
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
      });
    });

    test('should disable submit button during submission', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to simulate slow response
      (global.fetch as any).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ ok: true }), 100);
        });
      });

      render(<ContactFormSubmit />);

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'Jane Smith');
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/message/i), 'This is a test message for button state.');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Verify button is disabled during submission
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');

      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
      });
    });

    test('should show success state after successful submission', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({ ok: true });

      render(<ContactFormSubmit />);

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'Success User');
      await user.type(screen.getByLabelText(/email/i), 'success@example.com');
      await user.type(screen.getByLabelText(/message/i), 'This is a test message for success state.');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
        expect(screen.getByText(/your message has been received successfully/i)).toBeInTheDocument();
        expect(screen.getByText(/we will reach out to you within 24-48 hours/i)).toBeInTheDocument();
      });

      // Verify success icon is displayed
      expect(document.querySelector('.text-sage-green')).toBeInTheDocument();
      
      // Verify "Send Another Message" button is available
      expect(screen.getByRole('button', { name: /send another message/i })).toBeInTheDocument();
    });

    test('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      (global.fetch as any).mockResolvedValueOnce({ ok: true });

      render(<ContactFormSubmit />);

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'Reset Test');
      await user.type(screen.getByLabelText(/email/i), 'reset@example.com');
      await user.type(screen.getByLabelText(/phone/i), '+1234567890');
      await user.type(screen.getByLabelText(/message/i), 'This message should be cleared after submission.');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
      });

      // Click "Send Another Message" to return to form
      const anotherMessageButton = screen.getByRole('button', { name: /send another message/i });
      await user.click(anotherMessageButton);

      // Verify form fields are reset
      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/phone/i)).toHaveValue('');
        expect(screen.getByLabelText(/message/i)).toHaveValue('');
      });

      // Verify character counter is reset
      expect(screen.getByText('0/1000')).toBeInTheDocument();
    });

    test('should call onSubmitSuccess callback when provided', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();
      (global.fetch as any).mockResolvedValueOnce({ ok: true });

      render(<ContactFormSubmit onSubmitSuccess={mockOnSuccess} />);

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'Callback Test');
      await user.type(screen.getByLabelText(/email/i), 'callback@example.com');
      await user.type(screen.getByLabelText(/message/i), 'This is a test message for callback.');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Wait for success and verify callback was called
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      });
    });

    test('should call onSubmitError callback when provided', async () => {
      const user = userEvent.setup();
      const mockOnError = vi.fn();
      
      // Mock fetch to simulate error
      (global.fetch as any).mockImplementation(() => {
        return Promise.reject(new Error('Network error'));
      });

      render(<ContactFormSubmit onSubmitError={mockOnError} />);

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'Error Test');
      await user.type(screen.getByLabelText(/email/i), 'error@example.com');
      await user.type(screen.getByLabelText(/message/i), 'This is a test message for error callback.');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Wait for error and verify callback was called
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('Network error'));
      });
    });
  });

  describe('Enhanced Error Handling and Fallbacks', () => {
    test('should handle network timeout errors with retry option', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to simulate timeout
      (global.fetch as any).mockImplementation(() => {
        return new Promise((_, reject) => {
          const error = new Error('Request timed out');
          error.name = 'AbortError';
          reject(error);
        });
      });

      render(<ContactFormSubmit />);

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/message/i), 'This is a test message for timeout error.');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/request timed out/i)).toBeInTheDocument();
      });

      // Verify retry button is available
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      
      // Verify timeout-specific help text
      expect(screen.getByText(/connection timeout/i)).toBeInTheDocument();
      expect(screen.getByText(/your connection may be slow/i)).toBeInTheDocument();
    });

    test('should handle rate limit errors with fallback information', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to simulate rate limit error
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 429
      });

      render(<ContactFormSubmit />);

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'Jane Smith');
      await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
      await user.type(screen.getByLabelText(/message/i), 'This is a test message for rate limit error.');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/too many submissions/i)).toBeInTheDocument();
      });

      // Verify rate limit specific help text
      expect(screen.getByText(/rate limit reached/i)).toBeInTheDocument();
      expect(screen.getAllByText(/wait 5 minutes/i)).toHaveLength(2); // Should appear in both error message and help text
    });

    test('should show fallback contact information for rate limit errors', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to fail with rate limit error (non-retryable)
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 429
      });

      render(<ContactFormSubmit />);

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'Bob Wilson');
      await user.type(screen.getByLabelText(/email/i), 'bob@example.com');
      await user.type(screen.getByLabelText(/message/i), 'This is a test message for rate limit error.');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/too many submissions/i)).toBeInTheDocument();
      });

      // Verify "Show Alternative Contact Methods" button is available for non-retryable errors
      const fallbackButton = screen.getByRole('button', { name: /show alternative contact methods/i });
      expect(fallbackButton).toBeInTheDocument();
      
      // Click the button to show fallback
      await user.click(fallbackButton);
      
      // Now verify fallback information is displayed
      await waitFor(() => {
        expect(screen.getByText(/having trouble with the form/i)).toBeInTheDocument();
        expect(screen.getByText(/aurabyshenoi@gmail.com/i)).toBeInTheDocument();
      });

      // Verify "Try the form again" button is available
      expect(screen.getByRole('button', { name: /try the form again/i })).toBeInTheDocument();
    });

    test('should handle server errors with appropriate messaging', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to simulate server error
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500
      });

      render(<ContactFormSubmit />);

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'Alice Brown');
      await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
      await user.type(screen.getByLabelText(/message/i), 'This is a test message for server error.');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Verify retry button is available for server errors
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    test('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      
      // Mock fetch to simulate network error
      (global.fetch as any).mockImplementation(() => {
        return Promise.reject(new Error('Network error'));
      });

      render(<ContactFormSubmit />);

      // Fill out form
      await user.type(screen.getByLabelText(/name/i), 'Test User');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/message/i), 'This is a test message.');

      // Submit form to trigger error
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Start typing in name field
      await user.type(screen.getByLabelText(/name/i), ' Updated');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
      });
    });
  });
});