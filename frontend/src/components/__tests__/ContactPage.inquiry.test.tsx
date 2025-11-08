/**
 * Tests for ContactPage with artwork inquiry functionality
 * Verifies artwork reference display and form pre-population
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ContactPage from '../ContactPage';
import { Painting } from '../../types/painting';

// Mock child components
vi.mock('../Header', () => ({
  default: ({ onHomeClick, onGalleryClick, onAboutClick, onContactClick }: any) => (
    <header data-testid="header">
      <button onClick={onHomeClick}>Home</button>
      <button onClick={onGalleryClick}>Gallery</button>
      <button onClick={onAboutClick}>About</button>
      <button onClick={onContactClick}>Contact</button>
    </header>
  )
}));

vi.mock('../Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>
}));

vi.mock('../ContactFormSubmit', () => ({
  default: ({ onSubmitSuccess, onSubmitError, artworkReference }: any) => (
    <div data-testid="contact-form">
      <form>
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <textarea placeholder="Message" />
        {artworkReference && (
          <input 
            type="hidden" 
            data-testid="artwork-reference-input"
            value={artworkReference._id}
          />
        )}
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}));

vi.mock('../ContactSuccess', () => ({
  default: ({ onHomeClick, onGalleryClick, onAboutClick, onContactClick }: any) => (
    <div data-testid="contact-success">
      <h1>Success!</h1>
      <button onClick={onHomeClick}>Home</button>
      <button onClick={onGalleryClick}>Gallery</button>
      <button onClick={onAboutClick}>About</button>
      <button onClick={onContactClick}>Back to Contact</button>
    </div>
  )
}));

const mockPainting: Painting = {
  _id: '1',
  title: 'Sunset Over Mountains',
  description: 'A breathtaking view',
  dimensions: { width: 24, height: 18, unit: 'inches' },
  medium: 'Oil on Canvas',
  price: 850,
  category: 'landscape',
  images: {
    thumbnail: '/img1.jpeg',
    fullSize: ['/img1.jpeg']
  },
  isAvailable: true,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};

describe('ContactPage Artwork Inquiry Functionality', () => {
  const mockOnHomeClick = vi.fn();
  const mockOnGalleryClick = vi.fn();
  const mockOnAboutClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('General Contact Page', () => {
    it('renders contact page without artwork reference', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
        />
      );

      expect(screen.getByText(/Contact Us: Drop in your query/i)).toBeInTheDocument();
      expect(screen.getByText(/Have a question about our artwork/i)).toBeInTheDocument();
    });

    it('displays contact form', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
        />
      );

      expect(screen.getByTestId('contact-form')).toBeInTheDocument();
    });

    it('displays contact information section', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
        />
      );

      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByText('Response Time')).toBeInTheDocument();
      expect(screen.getByText('Direct Contact')).toBeInTheDocument();
    });
  });

  describe('Artwork Inquiry Page', () => {
    it('renders with artwork reference when provided', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
          artworkReference={mockPainting}
        />
      );

      expect(screen.getByText(/Inquire About "Sunset Over Mountains"/i)).toBeInTheDocument();
      expect(screen.getByText(/Interested in this artwork/i)).toBeInTheDocument();
    });

    it('displays artwork reference card with details', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
          artworkReference={mockPainting}
        />
      );

      // Check artwork details are displayed
      expect(screen.getByText('Sunset Over Mountains')).toBeInTheDocument();
      expect(screen.getByText('Oil on Canvas')).toBeInTheDocument();
      expect(screen.getByText(/24" × 18" inches/i)).toBeInTheDocument();
    });

    it('displays artwork thumbnail in reference card', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
          artworkReference={mockPainting}
        />
      );

      const thumbnail = screen.getByAltText('Sunset Over Mountains');
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute('src', '/img1.jpeg');
    });

    it('passes artwork reference to contact form', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
          artworkReference={mockPainting}
        />
      );

      const artworkReferenceInput = screen.getByTestId('artwork-reference-input');
      expect(artworkReferenceInput).toHaveValue('1');
    });

    it('does not display artwork reference card when no artwork provided', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
        />
      );

      expect(screen.queryByText('Sunset Over Mountains')).not.toBeInTheDocument();
      expect(screen.queryByTestId('artwork-reference-input')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to gallery when Browse Gallery button is clicked', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
        />
      );

      const browseGalleryButton = screen.getByText('Browse Gallery');
      browseGalleryButton.click();

      expect(mockOnGalleryClick).toHaveBeenCalledTimes(1);
    });

    it('navigates back to home when Back to Home is clicked', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
        />
      );

      const backButton = screen.getByText('Back to Home');
      backButton.click();

      expect(mockOnHomeClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Contact Information Display', () => {
    it('displays email address with mailto link', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
        />
      );

      const emailLink = screen.getByText('aurabyshenoi@gmail.com');
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:aurabyshenoi@gmail.com');
    });

    it('displays response time information', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
        />
      );

      expect(screen.getByText(/We typically respond within 24-48 hours/i)).toBeInTheDocument();
    });

    it('displays what to include section', () => {
      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
        />
      );

      expect(screen.getByText('What to Include')).toBeInTheDocument();
      expect(screen.getByText(/Specific questions about artwork/i)).toBeInTheDocument();
      expect(screen.getByText(/Commission inquiries/i)).toBeInTheDocument();
    });
  });

  describe('Artwork Reference Formatting', () => {
    it('formats dimensions correctly in artwork reference', () => {
      const paintingWithDifferentDimensions = {
        ...mockPainting,
        dimensions: { width: 30, height: 40, unit: 'cm' as const }
      };

      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
          artworkReference={paintingWithDifferentDimensions}
        />
      );

      expect(screen.getByText(/30" × 40" cm/i)).toBeInTheDocument();
    });

    it('displays different artwork titles correctly', () => {
      const differentPainting = {
        ...mockPainting,
        title: 'Ocean Waves',
        medium: 'Acrylic on Canvas'
      };

      render(
        <ContactPage
          onHomeClick={mockOnHomeClick}
          onGalleryClick={mockOnGalleryClick}
          onAboutClick={mockOnAboutClick}
          artworkReference={differentPainting}
        />
      );

      expect(screen.getByText(/Inquire About "Ocean Waves"/i)).toBeInTheDocument();
      expect(screen.getByText('Acrylic on Canvas')).toBeInTheDocument();
    });
  });
});
