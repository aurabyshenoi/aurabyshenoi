/**
 * Unit tests for BoundArtworkCard component
 * Tests React Bits integration, prop passing, and card interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import BoundArtworkCard from '../BoundArtworkCard';
import { Painting } from '../../types/painting';
import { CardVariant } from '../../types/react-bits';

// Mock React Bits components
vi.mock('../ReactBits', () => ({
  BoundCard: vi.fn(({ children, onClick, onKeyDown, ...props }) => (
    <div 
      data-testid="bound-card"
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </div>
  )),
}));

// Mock theme configuration
vi.mock('../../config/reactBitsTheme', () => ({
  boundCardPresets: {
    gallery: {
      strength: 0.4,
      damping: 0.7,
      stiffness: 300
    }
  },
  hoverEffectPresets: {
    small: { scale: 1.02, elevation: 2, shadowIntensity: 0.1, translateY: -2, transition: '0.2s ease' },
    medium: { scale: 1.05, elevation: 4, shadowIntensity: 0.15, translateY: -4, transition: '0.3s ease' },
    large: { scale: 1.03, elevation: 6, shadowIntensity: 0.2, translateY: -3, transition: '0.25s ease' },
    gallery: { scale: 1.05, elevation: 4, shadowIntensity: 0.15, translateY: -4, transition: '0.3s ease' }
  },
  animationStates: {
    hidden: 'masonry-card-hidden',
    visible: 'masonry-card-visible'
  },
  reactBitsComponentTheme: {
    animations: {
      entrance: {
        duration: '0.6s',
        easing: 'ease-out'
      }
    },
    artwork: {
      card: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      },
      title: {
        color: '#333333'
      },
      metadata: {
        color: '#666666'
      }
    }
  }
}));

const mockArtwork: Painting = {
  _id: '1',
  title: 'Sunset Landscape',
  medium: 'Oil on Canvas',
  price: 500,
  isAvailable: true,
  images: { 
    thumbnail: '/img1.jpg', 
    full: '/img1-full.jpg' 
  },
  dimensions: { 
    width: 16, 
    height: 20, 
    unit: 'inches' 
  },
  category: 'Landscape',
  description: 'A beautiful sunset over rolling hills',
};

const mockUnavailableArtwork: Painting = {
  ...mockArtwork,
  _id: '2',
  title: 'Sold Artwork',
  isAvailable: false,
  price: 750,
};

describe('BoundArtworkCard Component', () => {
  const mockOnClick = vi.fn();
  const mockOnRegisterElement = vi.fn();
  let mockBoundCard: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const ReactBits = await import('../ReactBits');
    mockBoundCard = vi.mocked(ReactBits.BoundCard);
  });

  describe('Basic Rendering', () => {
    it('renders artwork card with image only (no text overlays)', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      // Check artwork image is rendered
      const image = screen.getByAltText('Sunset Landscape');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/img1.jpg');

      // Verify no text overlays are visible (title, medium, dimensions, price should not be in visible DOM)
      // These should only be in screen reader description
      const visibleTitle = screen.queryByText('Sunset Landscape', { selector: ':not(.sr-only) *' });
      expect(visibleTitle).not.toBeInTheDocument();
    });

    it('does not render price badge (removed as per requirements)', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      // Price should not be visible (only in screen reader text)
      const visiblePrice = screen.queryByText('$500', { selector: ':not(.sr-only) *' });
      expect(visiblePrice).not.toBeInTheDocument();
    });

    it('does not render sold indicator (removed as per requirements)', () => {
      render(
        <BoundArtworkCard
          artwork={mockUnavailableArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      // Sold indicator should not be visible
      const visibleSold = screen.queryByText('Sold', { selector: ':not(.sr-only) *' });
      expect(visibleSold).not.toBeInTheDocument();
    });

    it('does not render category tag (removed as per requirements)', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      // Category should not be visible
      const visibleCategory = screen.queryByText('Landscape', { selector: ':not(.sr-only) *' });
      expect(visibleCategory).not.toBeInTheDocument();
    });
  });

  describe('React Bits Integration', () => {
    it('renders BoundCard with correct props', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="large"
          onClick={mockOnClick}
          index={2}
          animationDelay={200}
          isVisible={true}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'elevated',
          interactive: true,
          bound: {
            strength: 0.4,
            damping: 0.7,
            stiffness: 300
          },
          hover: expect.objectContaining({
            scale: expect.any(Number),
            elevation: expect.any(Number),
            transition: expect.any(String)
          }),
          role: 'button',
          tabIndex: 0,
          'data-card-index': 2,
          'aria-label': expect.stringContaining('Sunset Landscape'),
          'aria-posinset': 3,
          'aria-setsize': 1
        }),
        expect.any(Object)
      );
    });

    it('applies correct CSS classes based on variant', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="small"
          onClick={mockOnClick}
          index={0}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          className: expect.stringContaining('variant-small')
        }),
        expect.any(Object)
      );
    });

    it('applies visibility classes correctly', () => {
      const { rerender } = render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
          isVisible={false}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          className: expect.stringContaining('masonry-card-hidden')
        }),
        expect.any(Object)
      );

      rerender(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
          isVisible={true}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          className: expect.stringContaining('masonry-card-visible')
        }),
        expect.any(Object)
      );
    });

    it('applies animation delay correctly', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
          animationDelay={150}
          isVisible={true}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          style: expect.objectContaining({
            animationDelay: '150ms'
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Variant-Specific Behavior', () => {
    it('applies correct hover effects for small variant', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="small"
          onClick={mockOnClick}
          index={0}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          hover: expect.objectContaining({
            scale: 1.02,
            elevation: 2,
            transition: '0.2s ease'
          })
        }),
        expect.any(Object)
      );
    });

    it('applies correct hover effects for medium variant', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          hover: expect.objectContaining({
            scale: 1.05,
            elevation: 4,
            transition: '0.3s ease'
          })
        }),
        expect.any(Object)
      );
    });

    it('applies correct hover effects for large variant', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="large"
          onClick={mockOnClick}
          index={0}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          hover: expect.objectContaining({
            scale: 1.03,
            elevation: 6,
            transition: '0.25s ease'
          })
        }),
        expect.any(Object)
      );
    });

    it('applies correct height classes for variants', () => {
      const variants: CardVariant[] = ['small', 'medium', 'large'];
      
      variants.forEach(variant => {
        render(
          <BoundArtworkCard
            artwork={mockArtwork}
            variant={variant}
            onClick={mockOnClick}
            index={0}
          />
        );

        expect(mockBoundCard).toHaveBeenCalledWith(
          expect.objectContaining({
            className: expect.stringContaining(`artwork-bound-card-${variant}`)
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe('Interaction Handling', () => {
    it('handles click events correctly', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={1}
        />
      );

      const boundCard = screen.getByTestId('bound-card');
      fireEvent.click(boundCard);

      expect(mockOnClick).toHaveBeenCalledWith(mockArtwork, 1);
    });

    it('handles keyboard events correctly', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={1}
        />
      );

      const boundCard = screen.getByTestId('bound-card');
      
      // Test Enter key
      fireEvent.keyDown(boundCard, { key: 'Enter' });
      expect(mockOnClick).toHaveBeenCalledWith(mockArtwork, 1);

      // Test Space key
      fireEvent.keyDown(boundCard, { key: ' ' });
      expect(mockOnClick).toHaveBeenCalledTimes(2);

      // Test other keys (should not trigger)
      fireEvent.keyDown(boundCard, { key: 'Escape' });
      expect(mockOnClick).toHaveBeenCalledTimes(2);
    });

    it('registers element with animation system when callback provided', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={2}
          onRegisterElement={mockOnRegisterElement}
        />
      );

      // The registration happens in useEffect, so we need to wait
      expect(mockOnRegisterElement).toHaveBeenCalledWith(
        expect.any(HTMLElement),
        2
      );
    });
  });

  describe('Accessibility', () => {
    it('provides comprehensive aria-label', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
          totalArtworks={6}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          'aria-label': 'View artwork: Sunset Landscape - Oil on Canvas - 500',
          'aria-posinset': 1,
          'aria-setsize': 6
        }),
        expect.any(Object)
      );
    });

    it('provides screen reader description', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      const description = screen.getByText(/A beautiful sunset over rolling hills, created using Oil on Canvas/);
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('sr-only');
    });

    it('includes proper semantic markup', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'button',
          tabIndex: 0,
          'data-card-index': 0,
          'aria-describedby': 'artwork-description-0'
        }),
        expect.any(Object)
      );
    });

    it('handles artwork without description gracefully', () => {
      const artworkWithoutDescription = { ...mockArtwork, description: undefined };
      
      render(
        <BoundArtworkCard
          artwork={artworkWithoutDescription}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      const description = screen.getByText(/Artwork titled Sunset Landscape, created using Oil on Canvas/);
      expect(description).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('handles image load errors with fallback', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      const image = screen.getByAltText('Sunset Landscape');
      
      // Simulate image error
      fireEvent.error(image);
      
      expect(image).toHaveAttribute('src', '/placeholder-painting.svg');
    });

    it('applies correct image classes and attributes', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      const image = screen.getByAltText('Sunset Landscape');
      expect(image).toHaveClass('artwork-image');
      expect(image).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className when provided', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
          className="custom-card-class"
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          className: expect.stringContaining('custom-card-class')
        }),
        expect.any(Object)
      );
    });

    it('applies theme CSS custom properties', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          style: expect.objectContaining({
            '--card-bg': '#ffffff',
            '--card-border-radius': '12px',
            '--text-primary': '#333333',
            '--text-secondary': '#666666'
          })
        }),
        expect.any(Object)
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles artwork without price', () => {
      const artworkWithoutPrice = { ...mockArtwork, price: undefined };
      
      render(
        <BoundArtworkCard
          artwork={artworkWithoutPrice}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      // Price should not be visible anywhere (no overlays)
      const visiblePrice = screen.queryByText(/\$/, { selector: ':not(.sr-only) *' });
      expect(visiblePrice).not.toBeInTheDocument();
    });

    it('handles artwork without dimensions', () => {
      const artworkWithoutDimensions = { ...mockArtwork, dimensions: undefined };
      
      render(
        <BoundArtworkCard
          artwork={artworkWithoutDimensions}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      // Dimensions should not be visible anywhere (no overlays)
      const visibleDimensions = screen.queryByText(/×/, { selector: ':not(.sr-only) *' });
      expect(visibleDimensions).not.toBeInTheDocument();
    });

    it('handles artwork without category', () => {
      const artworkWithoutCategory = { ...mockArtwork, category: undefined };
      
      render(
        <BoundArtworkCard
          artwork={artworkWithoutCategory}
          variant="medium"
          onClick={mockOnClick}
          index={0}
        />
      );

      // Should still render image
      const image = screen.getByAltText('Sunset Landscape');
      expect(image).toBeInTheDocument();
    });

    it('handles zero animation delay', () => {
      render(
        <BoundArtworkCard
          artwork={mockArtwork}
          variant="medium"
          onClick={mockOnClick}
          index={0}
          animationDelay={0}
          isVisible={true}
        />
      );

      expect(mockBoundCard).toHaveBeenCalledWith(
        expect.objectContaining({
          style: expect.objectContaining({
            animationDelay: '0ms'
          })
        }),
        expect.any(Object)
      );
    });
  });
});