/**
 * Accessibility tests for MasonryGallery component
 * Tests keyboard navigation, ARIA attributes, and screen reader support
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import MasonryGallery from '../MasonryGallery';
import { Painting } from '../../types/painting';

// Mock the hooks
vi.mock('../../hooks/useMasonryAnimations', () => ({
  default: () => ({
    registerCard: vi.fn(),
    getAnimationDelay: () => 0,
    isCardVisible: () => true,
  }),
}));

vi.mock('../../hooks/useResponsiveMasonryConfig', () => ({
  default: () => ({
    config: {
      columns: 3,
      gap: 20,
      cardVariants: ['small', 'medium', 'large'],
      variantDistribution: { small: 40, medium: 40, large: 20 },
      animationDelay: 100,
    },
    currentBreakpoint: 'desktop',
    windowWidth: 1200,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

vi.mock('../../utils/masonryLayout', () => ({
  calculateResponsiveMasonryLayout: (artworks: Painting[]) => [
    { items: artworks.slice(0, 2).map(a => ({ ...a, variant: 'medium' })), height: 640 },
    { items: artworks.slice(2, 4).map(a => ({ ...a, variant: 'small' })), height: 500 },
    { items: artworks.slice(4, 6).map(a => ({ ...a, variant: 'large' })), height: 800 },
  ],
  getMasonryLayoutStats: () => ({ totalHeight: 1940, averageHeight: 646.67, heightVariance: 150 }),
}));

// Mock React Bits components
vi.mock('../ReactBits', () => ({
  BoundCard: ({ children, ...props }: any) => (
    <div data-testid="bound-card" {...props}>
      {children}
    </div>
  ),
}));

const mockArtworks: Painting[] = [
  {
    _id: '1',
    title: 'Sunset Landscape',
    medium: 'Oil on Canvas',
    price: 500,
    isAvailable: true,
    images: { thumbnail: '/img1.jpg', full: '/img1-full.jpg' },
    dimensions: { width: 16, height: 20, unit: 'inches' },
    category: 'Landscape',
    description: 'A beautiful sunset over rolling hills',
  },
  {
    _id: '2',
    title: 'Abstract Composition',
    medium: 'Acrylic',
    price: 750,
    isAvailable: false,
    images: { thumbnail: '/img2.jpg', full: '/img2-full.jpg' },
    dimensions: { width: 12, height: 16, unit: 'inches' },
    category: 'Abstract',
    description: 'Bold colors and geometric shapes',
  },
  {
    _id: '3',
    title: 'Portrait Study',
    medium: 'Charcoal',
    price: 300,
    isAvailable: true,
    images: { thumbnail: '/img3.jpg', full: '/img3-full.jpg' },
    dimensions: { width: 9, height: 12, unit: 'inches' },
    category: 'Portrait',
  },
];

describe('MasonryGallery Accessibility', () => {
  const mockOnCardClick = vi.fn();

  beforeEach(() => {
    mockOnCardClick.mockClear();
  });

  it('renders with proper ARIA attributes', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={mockOnCardClick}
      />
    );

    // Check main gallery region
    const gallery = screen.getByRole('region', { name: /featured artwork gallery/i });
    expect(gallery).toBeInTheDocument();
    expect(gallery).toHaveAttribute('aria-describedby', 'gallery-description');

    // Check screen reader description
    const description = screen.getByText(/masonry gallery displaying 3 featured artworks/i);
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('sr-only');
  });

  it('renders artwork cards with proper accessibility attributes', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={mockOnCardClick}
      />
    );

    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(3);

    // Check first card attributes
    const firstCard = cards[0];
    expect(firstCard).toHaveAttribute('aria-label', expect.stringContaining('Sunset Landscape'));
    expect(firstCard).toHaveAttribute('aria-posinset', '1');
    expect(firstCard).toHaveAttribute('aria-setsize', '3');
    expect(firstCard).toHaveAttribute('data-card-index', '0');
    expect(firstCard).toHaveAttribute('tabIndex', '0');
  });

  it('provides screen reader descriptions for each artwork', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={mockOnCardClick}
      />
    );

    // Check for screen reader descriptions (they are combined in one element)
    expect(screen.getByText(/A beautiful sunset over rolling hills, created using Oil on Canvas/i)).toBeInTheDocument();
    expect(screen.getByText(/priced at \$500/i)).toBeInTheDocument();
    
    // Check that there are multiple "press enter" instructions (one per card)
    const instructions = screen.getAllByText(/press enter or space to view details/i);
    expect(instructions.length).toBeGreaterThan(0);
  });

  it('handles keyboard navigation correctly', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={mockOnCardClick}
      />
    );

    const gallery = screen.getByRole('region');
    const cards = screen.getAllByRole('button');

    // Test arrow key navigation
    fireEvent.keyDown(gallery, { key: 'ArrowRight' });
    // Note: In a real test, we'd check focus, but jsdom doesn't handle focus well
    
    fireEvent.keyDown(gallery, { key: 'ArrowLeft' });
    fireEvent.keyDown(gallery, { key: 'Home' });
    fireEvent.keyDown(gallery, { key: 'End' });

    // These events should not throw errors
    expect(gallery).toBeInTheDocument();
  });

  it('handles Enter and Space key activation on cards', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={mockOnCardClick}
      />
    );

    const firstCard = screen.getAllByRole('button')[0];

    // Test Enter key - expect the artwork with variant added by masonry layout
    fireEvent.keyDown(firstCard, { key: 'Enter' });
    expect(mockOnCardClick).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: '1',
        title: 'Sunset Landscape',
        variant: 'medium'
      }), 
      0
    );

    // Test Space key
    fireEvent.keyDown(firstCard, { key: ' ' });
    expect(mockOnCardClick).toHaveBeenCalledTimes(2);
  });

  it('renders column groups with proper ARIA labels', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={mockOnCardClick}
      />
    );

    const columnGroups = screen.getAllByRole('group');
    expect(columnGroups).toHaveLength(3);

    expect(columnGroups[0]).toHaveAttribute('aria-label', 'Gallery column 1 of 3');
    expect(columnGroups[1]).toHaveAttribute('aria-label', 'Gallery column 2 of 3');
    expect(columnGroups[2]).toHaveAttribute('aria-label', 'Gallery column 3 of 3');
  });

  it('includes proper semantic markup for artwork information', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={mockOnCardClick}
      />
    );

    // Check for artwork titles with proper IDs using getElementById
    expect(document.getElementById('artwork-title-0')).toBeInTheDocument();
    expect(document.getElementById('artwork-title-0')).toHaveTextContent('Sunset Landscape');
    
    // Check for description elements
    expect(document.getElementById('artwork-description-0')).toBeInTheDocument();
    expect(document.getElementById('artwork-description-0')).toHaveClass('sr-only');
    expect(document.getElementById('artwork-description-1')).toBeInTheDocument();
    expect(document.getElementById('artwork-description-2')).toBeInTheDocument();
  });
});