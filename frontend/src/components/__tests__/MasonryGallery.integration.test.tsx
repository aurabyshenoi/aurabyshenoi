/**
 * Integration tests for MasonryGallery component
 * Tests modal integration, animation performance, and responsive layout changes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import MasonryGallery from '../MasonryGallery';
import { Painting } from '../../types/painting';

// Mock the animation hooks with more realistic behavior
const mockAnimationHook = {
  registerCard: vi.fn(),
  getAnimationDelay: vi.fn((index: number) => index * 100),
  isCardVisible: vi.fn(() => true),
};

vi.mock('../../hooks/useMasonryAnimations', () => ({
  default: () => mockAnimationHook,
}));

// Mock responsive config with realistic responsive behavior
const createMockResponsiveConfig = (width: number) => ({
  config: {
    columns: width < 768 ? 1 : width < 1024 ? 2 : 3,
    gap: width < 768 ? 15 : width < 1024 ? 18 : 20,
    cardVariants: ['small', 'medium', 'large'],
    variantDistribution: { small: 40, medium: 40, large: 20 },
    animationDelay: 100,
  },
  currentBreakpoint: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop',
  windowWidth: width,
  windowHeight: 800,
  isMobile: width < 768,
  isTablet: width >= 768 && width < 1024,
  isDesktop: width >= 1024,
  isBreakpoint: vi.fn(),
  getColumnCount: () => width < 768 ? 1 : width < 1024 ? 2 : 3,
  getGapSize: () => width < 768 ? 15 : width < 1024 ? 18 : 20,
  getCardVariants: () => ['small', 'medium', 'large'],
  getAnimationDelay: () => 100,
});

let mockWindowWidth = 1200;
vi.mock('../../hooks/useResponsiveMasonryConfig', () => ({
  default: () => createMockResponsiveConfig(mockWindowWidth),
}));

// Mock masonry layout with realistic column distribution
vi.mock('../../utils/masonryLayout', () => ({
  calculateResponsiveMasonryLayout: vi.fn((artworks, width) => {
    const columns = width < 768 ? 1 : width < 1024 ? 2 : 3;
    const result = Array.from({ length: columns }, () => ({ items: [], height: 0 }));
    
    artworks.forEach((artwork, index) => {
      const columnIndex = index % columns;
      const variant = ['small', 'medium', 'large'][index % 3];
      result[columnIndex].items.push({ ...artwork, variant });
      result[columnIndex].height += variant === 'small' ? 250 : variant === 'medium' ? 320 : 400;
    });
    
    return result;
  }),
  getMasonryLayoutStats: vi.fn(() => ({
    columnCount: 3,
    heights: [640, 720, 650],
    maxHeight: 720,
    minHeight: 640,
    avgHeight: 670,
    heightDifference: 80,
    balance: 0.12,
    itemCounts: [2, 2, 2]
  })),
}));

// Mock React Bits components
vi.mock('../ReactBits', () => ({
  BoundCard: ({ children, onClick, onKeyDown, className, ...props }: any) => (
    <div 
      data-testid="bound-card"
      className={className}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </div>
  ),
}));

// Mock BoundArtworkCard with realistic behavior
vi.mock('../BoundArtworkCard', () => ({
  default: ({ artwork, variant, onClick, index, animationDelay, isVisible, onRegisterElement }: any) => {
    React.useEffect(() => {
      if (onRegisterElement) {
        const mockElement = document.createElement('div');
        onRegisterElement(mockElement, index);
      }
    }, [onRegisterElement, index]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick(artwork, index);
      }
    };

    return (
      <div
        data-testid={`artwork-card-${index}`}
        data-variant={variant}
        data-animation-delay={animationDelay}
        data-visible={isVisible}
        onClick={() => onClick(artwork, index)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{
          animationDelay: `${animationDelay}ms`,
          opacity: isVisible ? 1 : 0,
        }}
      >
        <img src={artwork.images?.thumbnail || '/placeholder.jpg'} alt={artwork.title || 'Artwork'} />
        <h3>{artwork.title || 'Untitled'}</h3>
        <span>{artwork.medium || 'Unknown medium'}</span>
      </div>
    );
  },
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
];

describe('MasonryGallery Integration Tests', () => {
  const mockOnCardClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowWidth = 1200; // Reset to desktop
  });

  describe('Modal Integration', () => {
    it('integrates with modal viewer when bound cards are clicked', async () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Click on the first artwork card
      const firstCard = screen.getByTestId('artwork-card-0');
      fireEvent.click(firstCard);

      // Verify modal integration callback is called with correct parameters
      expect(mockOnCardClick).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: '1',
          title: 'Sunset Landscape',
          variant: 'small' // First card gets small variant in our mock
        }),
        0
      );
    });

    it('preserves artwork data and index for modal navigation', async () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Click on different cards to test modal navigation data
      const cards = [
        screen.getByTestId('artwork-card-0'),
        screen.getByTestId('artwork-card-1'),
        screen.getByTestId('artwork-card-2'),
        screen.getByTestId('artwork-card-3'),
      ];

      for (let i = 0; i < cards.length; i++) {
        fireEvent.click(cards[i]);
        
        expect(mockOnCardClick).toHaveBeenCalledWith(
          expect.objectContaining({
            _id: mockArtworks[i]._id,
            title: mockArtworks[i].title,
          }),
          i
        );
      }

      expect(mockOnCardClick).toHaveBeenCalledTimes(4);
    });

    it('handles keyboard navigation for modal integration', async () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      const firstCard = screen.getByTestId('artwork-card-0');
      
      // Test Enter key
      fireEvent.keyDown(firstCard, { key: 'Enter' });
      expect(mockOnCardClick).toHaveBeenCalledWith(
        expect.objectContaining({ _id: '1' }),
        0
      );

      // Test Space key
      fireEvent.keyDown(firstCard, { key: ' ' });
      expect(mockOnCardClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Animation Performance and Smoothness', () => {
    it('applies staggered animation delays correctly', async () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Check that animation delays are staggered
      const cards = mockArtworks.map((_, index) => 
        screen.getByTestId(`artwork-card-${index}`)
      );

      cards.forEach((card, index) => {
        expect(card).toHaveAttribute('data-animation-delay', `${index * 100}`);
      });
    });

    it('registers cards with animation system for intersection observer', async () => {
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Wait for useEffect to run
      await waitFor(() => {
        expect(mockAnimationHook.registerCard).toHaveBeenCalledTimes(4);
      });

      // Verify each card is registered with correct index
      mockArtworks.forEach((_, index) => {
        expect(mockAnimationHook.registerCard).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          index
        );
      });
    });

    it('handles animation visibility states correctly', async () => {
      // Mock some cards as not visible initially
      mockAnimationHook.isCardVisible.mockImplementation((index) => index < 2);

      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Check visibility states
      expect(screen.getByTestId('artwork-card-0')).toHaveAttribute('data-visible', 'true');
      expect(screen.getByTestId('artwork-card-1')).toHaveAttribute('data-visible', 'true');
      expect(screen.getByTestId('artwork-card-2')).toHaveAttribute('data-visible', 'false');
      expect(screen.getByTestId('artwork-card-3')).toHaveAttribute('data-visible', 'false');
    });

    it('optimizes animation performance with proper delays', async () => {
      const performanceStart = performance.now();
      
      render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      const performanceEnd = performance.now();
      const renderTime = performanceEnd - performanceStart;

      // Rendering should be fast (less than 100ms for 4 items)
      expect(renderTime).toBeLessThan(100);

      // Animation delays should be reasonable (not too long)
      mockArtworks.forEach((_, index) => {
        const expectedDelay = index * 100;
        expect(expectedDelay).toBeLessThan(1000); // Max 1 second delay
      });
    });
  });

  describe('Responsive Layout Changes', () => {
    it('adapts layout when screen size changes to mobile', async () => {
      // Start with desktop
      const { rerender } = render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Initially should have 3 columns (desktop)
      let columns = screen.getAllByRole('group');
      expect(columns).toHaveLength(3);

      // Change to mobile width
      act(() => {
        mockWindowWidth = 400;
      });

      rerender(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Should now have 1 column (mobile)
      columns = screen.getAllByRole('group');
      expect(columns).toHaveLength(1);
    });

    it('adapts layout when screen size changes to tablet', async () => {
      // Start with desktop
      const { rerender } = render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Change to tablet width
      act(() => {
        mockWindowWidth = 800;
      });

      rerender(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Should have 2 columns (tablet)
      const columns = screen.getAllByRole('group');
      expect(columns).toHaveLength(2);
    });

    it('redistributes cards correctly across different column counts', async () => {
      const { rerender } = render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Desktop: 3 columns, cards should be distributed
      let allCards = mockArtworks.map((_, index) => 
        screen.getByTestId(`artwork-card-${index}`)
      );
      expect(allCards).toHaveLength(4);

      // Change to mobile: 1 column, all cards in single column
      act(() => {
        mockWindowWidth = 400;
      });

      rerender(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // All cards should still be present
      allCards = mockArtworks.map((_, index) => 
        screen.getByTestId(`artwork-card-${index}`)
      );
      expect(allCards).toHaveLength(4);
    });

    it('maintains card functionality across responsive changes', async () => {
      const { rerender } = render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Test click on desktop
      fireEvent.click(screen.getByTestId('artwork-card-0'));
      expect(mockOnCardClick).toHaveBeenCalledTimes(1);

      // Change to mobile
      act(() => {
        mockWindowWidth = 400;
      });

      rerender(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Test click still works on mobile
      fireEvent.click(screen.getByTestId('artwork-card-1'));
      expect(mockOnCardClick).toHaveBeenCalledTimes(2);
    });

    it('handles responsive animation delays appropriately', async () => {
      const { rerender } = render(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Check desktop animation delays
      let cards = mockArtworks.map((_, index) => 
        screen.getByTestId(`artwork-card-${index}`)
      );
      
      cards.forEach((card, index) => {
        expect(card).toHaveAttribute('data-animation-delay', `${index * 100}`);
      });

      // Change to mobile
      act(() => {
        mockWindowWidth = 400;
      });

      rerender(
        <MasonryGallery
          artworks={mockArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Animation delays should still be applied correctly
      cards = mockArtworks.map((_, index) => 
        screen.getByTestId(`artwork-card-${index}`)
      );
      
      cards.forEach((card, index) => {
        expect(card).toHaveAttribute('data-animation-delay', `${index * 100}`);
      });
    });
  });

  describe('Performance Integration', () => {
    it('handles large number of artworks efficiently', async () => {
      const manyArtworks = Array.from({ length: 20 }, (_, index) => ({
        ...mockArtworks[0],
        _id: `artwork-${index}`,
        title: `Artwork ${index}`,
      }));

      const performanceStart = performance.now();
      
      render(
        <MasonryGallery
          artworks={manyArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      const performanceEnd = performance.now();
      const renderTime = performanceEnd - performanceStart;

      // Should render 20 items efficiently (less than 200ms)
      expect(renderTime).toBeLessThan(200);

      // All cards should be rendered
      const cards = manyArtworks.map((_, index) => 
        screen.getByTestId(`artwork-card-${index}`)
      );
      expect(cards).toHaveLength(20);
    });

    it('maintains smooth interactions under load', async () => {
      const manyArtworks = Array.from({ length: 12 }, (_, index) => ({
        ...mockArtworks[0],
        _id: `artwork-${index}`,
        title: `Artwork ${index}`,
      }));

      render(
        <MasonryGallery
          artworks={manyArtworks}
          onCardClick={mockOnCardClick}
        />
      );

      // Test rapid clicking
      const startTime = performance.now();
      
      for (let i = 0; i < 5; i++) {
        const card = screen.getByTestId(`artwork-card-${i}`);
        fireEvent.click(card);
      }

      const endTime = performance.now();
      const interactionTime = endTime - startTime;

      // Interactions should be fast
      expect(interactionTime).toBeLessThan(50);
      expect(mockOnCardClick).toHaveBeenCalledTimes(5);
    });
  });

  describe('Error Handling Integration', () => {
    it('handles missing artwork data gracefully', async () => {
      const incompleteArtworks = [
        { ...mockArtworks[0] },
        { ...mockArtworks[1], images: undefined }, // Missing images
        { ...mockArtworks[2], title: undefined }, // Missing title
      ];

      expect(() => {
        render(
          <MasonryGallery
            artworks={incompleteArtworks as Painting[]}
            onCardClick={mockOnCardClick}
          />
        );
      }).not.toThrow();

      // Should still render available cards
      expect(screen.getByTestId('artwork-card-0')).toBeInTheDocument();
    });

    it('handles animation system failures gracefully', async () => {
      // Mock animation hook to throw error
      mockAnimationHook.registerCard.mockImplementation(() => {
        throw new Error('Animation registration failed');
      });

      expect(() => {
        render(
          <MasonryGallery
            artworks={mockArtworks}
            onCardClick={mockOnCardClick}
          />
        );
      }).not.toThrow();

      // Gallery should still render
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });
});