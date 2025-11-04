import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactPage from '../ContactPage';

// Mock fetch for FormSubmit.co
global.fetch = vi.fn();

// Mock the ContactFormSubmit component to make testing easier
vi.mock('../ContactFormSubmit', () => ({
  default: ({ onSubmitSuccess, onSubmitError }: { onSubmitSuccess?: () => void; onSubmitError?: (error: string) => void }) => (
    <div data-testid="contact-form-submit">
      <button 
        onClick={() => onSubmitSuccess && onSubmitSuccess()}
        data-testid="mock-submit-success"
      >
        Mock Submit Success
      </button>
      <button 
        onClick={() => onSubmitError && onSubmitError('Mock error')}
        data-testid="mock-submit-error"
      >
        Mock Submit Error
      </button>
    </div>
  )
}));

// Mock the ContactSuccess component
vi.mock('../ContactSuccess', () => ({
  default: ({ onContactClick }: { onContactClick: () => void }) => (
    <div data-testid="contact-success">
      <h1>Thank You!</h1>
      <button onClick={onContactClick} data-testid="back-to-contact">
        Back to Contact
      </button>
    </div>
  )
}));

const mockProps = {
  onHomeClick: vi.fn(),
  onGalleryClick: vi.fn(),
  onAboutClick: vi.fn(),
  onCartClick: vi.fn(),
  cartItemCount: 0
};

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  test('renders contact page with FormSubmit component', () => {
    render(<ContactPage {...mockProps} />);

    expect(screen.getByText('Contact Us: Drop in your query and we will reach out to you')).toBeInTheDocument();
    expect(screen.getByTestId('contact-form-submit')).toBeInTheDocument();
    expect(screen.getAllByText('Contact Information')).toHaveLength(2); // One in main content, one in footer
    expect(screen.getAllByText('aurabyshenoi@gmail.com')).toHaveLength(2); // One in main content, one in footer
  });

  test('shows success page when form submission succeeds', async () => {
    const user = userEvent.setup();
    render(<ContactPage {...mockProps} />);

    // Simulate successful form submission
    const successButton = screen.getByTestId('mock-submit-success');
    await user.click(successButton);

    await waitFor(() => {
      expect(screen.getByTestId('contact-success')).toBeInTheDocument();
      expect(screen.getByText('Thank You!')).toBeInTheDocument();
    });
  });

  test('can return from success page to contact form', async () => {
    const user = userEvent.setup();
    render(<ContactPage {...mockProps} />);

    // Go to success page
    const successButton = screen.getByTestId('mock-submit-success');
    await user.click(successButton);

    await waitFor(() => {
      expect(screen.getByTestId('contact-success')).toBeInTheDocument();
    });

    // Return to contact form
    const backButton = screen.getByTestId('back-to-contact');
    await user.click(backButton);

    await waitFor(() => {
      expect(screen.getByTestId('contact-form-submit')).toBeInTheDocument();
      expect(screen.queryByTestId('contact-success')).not.toBeInTheDocument();
    });
  });

  test('handles form submission error', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ContactPage {...mockProps} />);

    // Simulate form submission error
    const errorButton = screen.getByTestId('mock-submit-error');
    await user.click(errorButton);

    // Should log error but stay on contact page
    expect(consoleSpy).toHaveBeenCalledWith('Contact form submission error:', 'Mock error');
    expect(screen.getByTestId('contact-form-submit')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  test('calls navigation functions when buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<ContactPage {...mockProps} />);

    const backButton = screen.getByRole('button', { name: /back to home/i });
    await user.click(backButton);
    expect(mockProps.onHomeClick).toHaveBeenCalledTimes(1);

    const galleryButton = screen.getByRole('button', { name: /browse gallery/i });
    await user.click(galleryButton);
    expect(mockProps.onGalleryClick).toHaveBeenCalledTimes(1);
  });

  test('renders contact information with direct email link', () => {
    render(<ContactPage {...mockProps} />);

    const emailLinks = screen.getAllByRole('link', { name: /aurabyshenoi@gmail.com/i });
    expect(emailLinks).toHaveLength(2); // One in main content, one in footer
    emailLinks.forEach(link => {
      expect(link).toHaveAttribute('href', 'mailto:aurabyshenoi@gmail.com');
    });
  });

  test('displays response time information', () => {
    render(<ContactPage {...mockProps} />);

    expect(screen.getByText('Response Time')).toBeInTheDocument();
    expect(screen.getByText('We typically respond within 24-48 hours')).toBeInTheDocument();
  });
});