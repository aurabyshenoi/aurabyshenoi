/**
 * Unit tests for MasonryGallery component
 * Tests masonry layout calculations, responsive behavior, and React Bits integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MasonryGallery from '../MasonryGallery';
import { Painting } from '../../types/painting';
import { CardVariant } from '../../types/react-bits';

// Mock the hooks and utilities
vi.mock('../../hooks/useMasonryAnimations', () => ({
  default: () => ({
    registerCard: vi.fn(),
    getAnimationDelay: vi.fn(() => 100),
    isCardVisible: vi.fn(() => true),
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
    windowHeight: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isBreakpoint: vi.fn(),
    getColumnCount: () => 3,
    getGapSize: () => 20,
    getCardVariants: () => ['small', 'medium', 'large'],
    getAnimationDelay: () => 100,
  }),
}));

vi.mock('../../utils/masonryLayout', () => ({
  calculateResponsiveMasonryLayout: vi.fn(),
  getMasonryLayoutStats: vi.fn(() => ({
    columnCount: 3,
    heights: [640, 500, 800],
    maxHeight: 800,
    minHeight: 500,
    avgHeight: 646.67,
    heightDifference: 300,
    balance: 0.45,
    itemCounts: [2, 2, 2]
  })),
}));

// Mock React Bits components
vi.mock('../ReactBits', () => ({
  BoundCard: ({ children, onClick, onKeyDown, ...props }: any) => (
    <div 
      data-testid="bound-card" 
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </div>
  ),
}));

// Mock BoundArtworkCard
vi.mock('../BoundArtworkCard', () => ({
  default: ({ artwork, variant, onClick, index, onRegisterElement }: any) => (
    <div
      data-testid={`artwork-card-${index}`}
      data-variant={variant}
      onClick={() => onClick(artwork, index)}
      ref={(el) => onRegisterElement?.(el, index)}
    >
      <img src={artwork.images.thumbnail} alt={artwork.title} />
      <h3>{artwork.title}</h3>
      <span>{artwork.medium}</span>
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
  {
    _id: '4',
    title: 'Still Life',
    medium: 'Watercolor',
    price: 400,
    isAvailable: true,
    images: { thumbnail: '/img4.jpg', full: '/img4-full.jpg' },
    dimensions: { width: 14, height: 18, unit: 'inches' },
    category: 'Still Life',
  },
  {
    _id: '5',
    title: 'Urban Scene',
    medium: 'Mixed Media',
    price: 600,
    isAvailable: true,
    images: { thumbnail: '/img5.jpg', full: '/img5-full.jpg' },
    dimensions: { width: 20, height: 24, unit: 'inches' },
    category: 'Urban',
  },
  {
    _id: '6',
    title: 'Nature Study',
    medium: 'Pencil',
    price: 200,
    isAvailable: true,
    images: { thumbnail: '/img6.jpg', full: '/img6-full.jpg' },
    dimensions: { width: 8, height: 10, unit: 'inches' },
    category: 'Nature',
  },
];

describe('MasonryGallery Component', () => {
  const mockOnCardClick = vi.fn();
  let mockCalculateLayout: any;
  let mockGetLayoutStats: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Get the mocked functions
    mockCalculateLayout = vi.mocked(
      require('../../utils/masonryLayout').calculateResponsiveMasonryLayout
    );
    mockGetLayoutStats = vi.mocked(
      require('../../utils/masonryLayout').getMasonryLayoutStats
    );
    
    // Setup default mock return for layout calculation
    mockCalculateLayout.mockReturnValue([
      { 
        items: [
          { ...mockArtworks[0], variant: 'medium' },
          { ...mockArtworks[3], variant: 'small' }
        ], 
        height: 640 
      },
      { 
        items: [
          { ...mockArtworks[1], variant: 'large' },
          { ...mockArtworks[4], variant: 'medium' }
        ], 
        height: 720 
      },
      { 
        items: [
          { ...mockArtworks[2], variant: 'small' },
          { ...mockArtworks[5], variant: 'large' }
        ], 
        height: 650 
      },
    ]);
  });

  describe('Basic Rendering', () => {
    it('renders masonry gallery with correct structure', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Check main gallery container
      const gallery = screen.getByRole('region', { name: /featured artwork gallery/i });
      expect(gallery).toBeInTheDocument();
      expect(gallery).toHaveClass('masonry-gallery-container');

      // Check columns are rendered
      const columns = screen.getAllByRole('group');
      expect(columns).toHaveLength(3);
    });

    it('renders all artwork cards', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Check that all artworks are rendered
      mockArtworks.forEach((artwork, index) => {
        expect(screen.getByTestId(`artwork-card-${index}`)).toBeInTheDocument();
      });
    });

    it('applies custom className when provided', () => {
      const customClass = 'custom-gallery-class';
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
          className={customClass}
        />
      );

      const gallery = screen.getByRole('region');
      expect(gallery).toHaveClass(customClass);
    });
  });

  describe('Masonry Layout Calculations', () => {
    it('calls masonry layout calculation with correct parameters', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      expect(mockCalculateLayout).toHaveBeenCalledWith(
        mockArtworks,
        1200, // windowWidth
        {
          cardVariants: ['small', 'medium', 'large'],
          gap: 20,
          balanceThreshold: 100,
          variantDistribution: { small: 40, medium: 40, large: 20 }
        }
      );
    });

    it('calls layout stats calculation for debugging', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      expect(mockGetLayoutStats).toHaveBeenCalled();
    });

    it('recalculates layout when artworks change', () => {
      const { rerender } = render(
        <MasonryGallery
          artworks={mockArtworks.slice(0, 3)}
          onCardClick={mockOnCardClick}
        />
      );

      expect(mockCalculateLayout).toHaveBeenCalledTimes(1);

      // Change artworks
      rerender(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      expect(mockCalculateLayout).toHaveBeenCalledTimes(2);
    });
  });

  describe('Responsive Behavior', () => {
    it('uses responsive configuration from hook', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Verify the hook is called and configuration is used
      expect(mockCalculateLayout).toHaveBeenCalledWith(
        expect.any(Array),
        1200, // windowWidth from mock
        expect.objectContaining({
          cardVariants: mockConfig.cardVariants,
          gap: mockConfig.gap
        })
      );
    });

    it('handles mobile configuration override', () => {
      const mobileConfig = {
        columns: 1,
        gap: 15,
        cardVariants: ['small', 'medium'] as CardVariant[]
      };

      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
          mobileConfig={mobileConfig}
        />
      );

      // The component should pass the override to the hook
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('handles tablet configuration override', () => {
      const tabletConfig = {
        columns: 2,
        gap: 18,
        cardVariants: ['small', 'large'] as CardVariant[]
      };

      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
          tabletConfig={tabletConfig}
        />
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('handles desktop configuration override', () => {
      const desktopConfig = {
        columns: 4,
        gap: 25,
        cardVariants: ['medium', 'large'] as CardVariant[]
      };

      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
          desktopConfig={desktopConfig}
        />
      );

      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Column Distribution', () => {
    it('distributes cards across columns correctly', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      const columns = screen.getAllByRole('group');
      
      // Check that each column has the expected cards based on mock layout
      // Column 1: cards 0 and 3
      const column1Cards = columns[0].querySelectorAll('[data-testid^="artwork-card-"]');
      expect(column1Cards).toHaveLength(2);
      
      // Column 2: cards 1 and 4  
      const column2Cards = columns[1].querySelectorAll('[data-testid^="artwork-card-"]');
      expect(column2Cards).toHaveLength(2);
      
      // Column 3: cards 2 and 5
      const column3Cards = columns[2].querySelectorAll('[data-testid^="artwork-card-"]');
      expect(column3Cards).toHaveLength(2);
    });

    it('assigns correct variants to cards', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Check that cards have the variants assigned by the layout calculation
      expect(screen.getByTestId('artwork-card-0')).toHaveAttribute('data-variant', 'medium');
      expect(screen.getByTestId('artwork-card-1')).toHaveAttribute('data-variant', 'large');
      expect(screen.getByTestId('artwork-card-2')).toHaveAttribute('data-variant', 'small');
    });
  });

  describe('Animation Integration', () => {
    it('registers cards with animation system', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Should register each card with the animation system
      expect(mockRegisterCard).toHaveBeenCalledTimes(6);
    });

    it('gets animation delays for cards', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Should get animation delay for each card
      expect(mockGetAnimationDelay).toHaveBeenCalledTimes(6);
      
      // Check that it's called with correct indices
      expect(mockGetAnimationDelay).toHaveBeenCalledWith(0);
      expect(mockGetAnimationDelay).toHaveBeenCalledWith(1);
      expect(mockGetAnimationDelay).toHaveBeenCalledWith(5);
    });

    it('checks card visibility for animations', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Should check visibility for each card
      expect(mockIsCardVisible).toHaveBeenCalledTimes(6);
    });
  });

  describe('Card Click Handling', () => {
    it('handles card clicks correctly', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      const firstCard = screen.getByTestId('artwork-card-0');
      fireEvent.click(firstCard);

      expect(mockOnCardClick).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: '1',
          title: 'Sunset Landscape',
          variant: 'medium'
        }),
        0
      );
    });

    it('passes correct global index for cards in different columns', () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Click cards in different columns
      fireEvent.click(screen.getByTestId('artwork-card-1'));
      fireEvent.click(screen.getByTestId('artwork-card-2'));

      expect(mockOnCardClick).toHaveBeenCalledWith(
        expect.objectContaining({ _id: '2' }),
        1
      );
      expect(mockOnCardClick).toHaveBeenCalledWith(
        expect.objectContaining({ _id: '3' }),
        2
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles empty artworks array', () => {
      mockCalculateLayout.mockReturnValue([]);
      
      render(
        <MasonryGallery
          artworks={[]}
          onCardClick={mockOnCardClick}
        />
      );

      const gallery = screen.getByRole('region');
      expect(gallery).toBeInTheDocument();
      
      // Should still call layout calculation
      expect(mockCalculateLayout).toHaveBeenCalledWith([], 1200, expect.any(Object));
    });

    it('handles single artwork', () => {
      const singleArtwork = [mockArtworks[0]];
      mockCalculateLayout.mockReturnValue([
        { items: [{ ...singleArtwork[0], variant: 'medium' }], height: 320 }
      ]);

      render(
        <MasonryGallery
          artworks={singleArtwork}
          onCardClick={mockOnCardClick}
        />
      );

      expect(screen.getByTestId('artwork-card-0')).toBeInTheDocument();
      expect(mockCalculateLayout).toHaveBeenCalledWith(singleArtwork, 1200, expect.any(Object));
    });

    it('handles layout calculation errors gracefully', () => {
      mockCalculateLayout.mockImplementation(() => {
        throw new Error('Layout calculation failed');
      });

      // Should not crash the component
      expect(() => {
        render(
          <MasonryGallery
            artworks={mockArtworks}
            onCardClick={mockOnCardClick}
          />
        );
      }).not.toThrow();
    });
  });
});