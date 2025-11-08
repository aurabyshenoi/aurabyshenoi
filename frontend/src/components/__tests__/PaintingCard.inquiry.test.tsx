/**
 * Tests for PaintingCard inquiry functionality
 * Verifies inquiry button behavior and artwork reference passing
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import PaintingCard from '../PaintingCard';
import { Painting } from '../../types/painting';

// Mock OptimizedImage component
vi.mock('../OptimizedImage', () => ({
  OptimizedImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="optimized-image" />
  ),
  useResponsiveImageUrls: (src: string) => ({
    thumbnail: `${src}?w=200`,
    medium: `${src}?w=600`,
    large: `${src}?w=1200`
  })
}));

const mockPainting: Painting = {
  _id: '1',
  title: 'Test Painting',
  description: 'A beautiful test painting',
  dimensions: { width: 24, height: 36, unit: 'inches' },
  medium: 'Oil on Canvas',
  price: 500,
  category: 'landscape',
  images: {
    thumbnail: '/img1.jpeg',
    fullSize: ['/img1.jpeg']
  },
  isAvailable: true,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z'
};

describe('PaintingCard Inquiry Functionality', () => {
  const mockOnClick = vi.fn();
  const mockOnInquire = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Inquiry Button Display', () => {
    it('displays "Inquire About This Piece" button for available paintings', () => {
      render(
        <PaintingCard 
          painting={mockPainting} 
          onClick={mockOnClick}
          onInquire={mockOnInquire}
        />
      );

      const inquireButton = screen.getByRole('button', { name: /inquire about test painting/i });
      expect(inquireButton).toBeInTheDocument();
      expect(inquireButton).toHaveTextContent('Inquire About This Piece');
      expect(inquireButton).not.toBeDisabled();
    });

    it('displays "Sold" button for unavailable paintings', () => {
      const soldPainting = { ...mockPainting, isAvailable: false };
      
      render(
        <PaintingCard 
          painting={soldPainting} 
          onClick={mockOnClick}
          onInquire={mockOnInquire}
        />
      );

      const inquireButton = screen.getByRole('button', { name: /inquire about test painting/i });
      expect(inquireButton).toHaveTextContent('Sold');
      expect(inquireButton).toBeDisabled();
    });

    it('shows sold badge for unavailable paintings', () => {
      const soldPainting = { ...mockPainting, isAvailable: false };
      
      render(
        <PaintingCard 
          painting={soldPainting} 
          onClick={mockOnClick}
          onInquire={mockOnInquire}
        />
      );

      const soldElements = screen.getAllByText('Sold');
      expect(soldElements.length).toBeGreaterThan(0);
    });
  });

  describe('Inquiry Button Interaction', () => {
    it('calls onInquire with painting data when inquiry button is clicked', () => {
      render(
        <PaintingCard 
          painting={mockPainting} 
          onClick={mockOnClick}
          onInquire={mockOnInquire}
        />
      );

      const inquireButton = screen.getByRole('button', { name: /inquire about test painting/i });
      fireEvent.click(inquireButton);

      expect(mockOnInquire).toHaveBeenCalledTimes(1);
      expect(mockOnInquire).toHaveBeenCalledWith(mockPainting);
    });

    it('does not trigger card onClick when inquiry button is clicked', () => {
      render(
        <PaintingCard 
          painting={mockPainting} 
          onClick={mockOnClick}
          onInquire={mockOnInquire}
        />
      );

      const inquireButton = screen.getByRole('button', { name: /inquire about test painting/i });
      fireEvent.click(inquireButton);

      expect(mockOnInquire).toHaveBeenCalledTimes(1);
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('does not call onInquire when sold button is clicked', () => {
      const soldPainting = { ...mockPainting, isAvailable: false };
      
      render(
        <PaintingCard 
          painting={soldPainting} 
          onClick={mockOnClick}
          onInquire={mockOnInquire}
        />
      );

      const soldButton = screen.getByRole('button', { name: /inquire about test painting/i });
      fireEvent.click(soldButton);

      expect(mockOnInquire).not.toHaveBeenCalled();
    });

    it('handles missing onInquire callback gracefully', () => {
      render(
        <PaintingCard 
          painting={mockPainting} 
          onClick={mockOnClick}
        />
      );

      const inquireButton = screen.getByRole('button', { name: /inquire about test painting/i });
      
      // Should not throw error when onInquire is undefined
      expect(() => fireEvent.click(inquireButton)).not.toThrow();
    });
  });

  describe('Card Click Behavior', () => {
    it('calls onClick when card is clicked', () => {
      render(
        <PaintingCard 
          painting={mockPainting} 
          onClick={mockOnClick}
          onInquire={mockOnInquire}
        />
      );

      const card = screen.getByText('Test Painting').closest('div')?.parentElement;
      if (card) {
        fireEvent.click(card);
        expect(mockOnClick).toHaveBeenCalledWith(mockPainting);
      }
    });

    it('calls onClick when image is clicked', () => {
      render(
        <PaintingCard 
          painting={mockPainting} 
          onClick={mockOnClick}
          onInquire={mockOnInquire}
        />
      );

      const image = screen.getByTestId('optimized-image');
      fireEvent.click(image);

      expect(mockOnClick).toHaveBeenCalledWith(mockPainting);
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label for inquiry button', () => {
      render(
        <PaintingCard 
          painting={mockPainting} 
          onClick={mockOnClick}
          onInquire={mockOnInquire}
        />
      );

      const inquireButton = screen.getByRole('button', { name: /inquire about test painting/i });
      expect(inquireButton).toHaveAttribute('aria-label', 'Inquire about Test Painting');
    });

    it('inquiry button is keyboard accessible', () => {
      render(
        <PaintingCard 
          painting={mockPainting} 
          onClick={mockOnClick}
          onInquire={mockOnInquire}
        />
      );

      const inquireButton = screen.getByRole('button', { name: /inquire about test painting/i });
      inquireButton.focus();
      
      expect(document.activeElement).toBe(inquireButton);
    });
  });
});
