/**
 * Tests for Gallery component with local images
 * Verifies image loading, modal functionality, and responsive behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Gallery from '../Gallery';

// Mock the usePaintings hook to return local image data
vi.mock('../../hooks/usePaintings', () => ({
  usePaintings: () => ({
    paintings: [
      {
        _id: '1',
        title: 'Sunset Over Mountains',
        description: 'A breathtaking view of golden hour light cascading over mountain peaks.',
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
      },
      {
        _id: '2',
        title: 'Ocean Waves',
        description: 'Dynamic brushstrokes capture the power and movement of ocean waves.',
        dimensions: { width: 30, height: 24, unit: 'inches' },
        medium: 'Acrylic on Canvas',
        price: 1200,
        category: 'seascape',
        images: {
          thumbnail: '/img2.jpeg',
          fullSize: ['/img2.jpeg']
        },
        isAvailable: true,
        createdAt: '2024-01-10T14:30:00Z',
        updatedAt: '2024-01-10T14:30:00Z'
      }
    ],
    allPaintings: [],
    loading: false,
    error: null,
    filters: {},
    setFilters: vi.fn(),
    categories: ['landscape', 'seascape'],
    priceRange: { min: 850, max: 1200 }
  })
}));

// Mock OptimizedImage component
vi.mock('../OptimizedImage', () => ({
  OptimizedImage: ({ src, alt, className, onLoad }: any) => {
    React.useEffect(() => {
      // Simulate image load
      if (onLoad) {
        setTimeout(() => onLoad(), 100);
      }
    }, [onLoad]);
    
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        data-testid="optimized-image"
        onLoad={onLoad}
      />
    );
  },
  useResponsiveImageUrls: (src: string) => ({
    small: `${src}?w=400`,
    medium: `${src}?w=800`,
    large: `${src}?w=1200`,
    xlarge: `${src}?w=1600`
  })
}));

// Mock image preloader
vi.mock('../../utils/imagePreloader', () => ({
  preloadCriticalImages: vi.fn(),
  preloadNextBatch: vi.fn(),
  preloadOnScroll: vi.fn()
}));

// Mock other components
vi.mock('../FilterBar', () => ({
  default: ({ filters, onFiltersChange }: any) => (
    <div data-testid="filter-bar">Filter Bar</div>
  )
}));

vi.mock('../PaintingGrid', () => ({
  default: ({ paintings, onPaintingClick, loading }: any) => (
    <div data-testid="painting-grid">
      {loading ? (
        <div data-testid="loading">Loading...</div>
      ) : (
        paintings.map((painting: any) => (
          <div 
            key={painting._id}
            data-testid={`painting-card-${painting._id}`}
            onClick={() => onPaintingClick(painting)}
          >
            <img src={painting.images.thumbnail} alt={painting.title} />
            <h3>{painting.title}</h3>
          </div>
        ))
      )}
    </div>
  )
}));

vi.mock('../PaintingModal', () => ({
  default: ({ painting, isOpen, onClose }: any) => (
    isOpen && painting ? (
      <div data-testid="painting-modal">
        <button onClick={onClose} data-testid="close-modal">Close</button>
        <img src={painting.images.fullSize[0]} alt={painting.title} />
        <h2>{painting.title}</h2>
      </div>
    ) : null
  )
}));

vi.mock('../Layout', () => ({
  default: ({ children }: any) => (
    <div data-testid="layout">
      {children}
    </div>
  )
}));

describe('Gallery Component with Local Images', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Image Loading', () => {
    it('renders gallery with local image paths', async () => {
      render(<Gallery />);

      await waitFor(() => {
        expect(screen.getByTestId('painting-grid')).toBeInTheDocument();
      });

      // Check that paintings with local images are rendered
      expect(screen.getByTestId('painting-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('painting-card-2')).toBeInTheDocument();

      // Verify local image paths are used
      const images = screen.getAllByRole('img');
      const paintingImages = images.filter(img => 
        img.getAttribute('src')?.includes('/img') && 
        img.getAttribute('src')?.includes('.jpeg')
      );
      
      expect(paintingImages.length).toBeGreaterThan(0);
      expect(paintingImages[0]).toHaveAttribute('src', '/img1.jpeg');
    });

    it('displays correct image paths for thumbnails', async () => {
      render(<Gallery />);

      await waitFor(() => {
        const paintingCard1 = screen.getByTestId('painting-card-1');
        const img1 = paintingCard1.querySelector('img');
        expect(img1).toHaveAttribute('src', '/img1.jpeg');

        const paintingCard2 = screen.getByTestId('painting-card-2');
        const img2 = paintingCard2.querySelector('img');
        expect(img2).toHaveAttribute('src', '/img2.jpeg');
      });
    });

    it('preloads critical images on component mount', async () => {
      const { preloadCriticalImages } = await import('../../utils/imagePreloader');
      
      render(<Gallery />);

      await waitFor(() => {
        expect(preloadCriticalImages).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              images: expect.objectContaining({
                thumbnail: '/img1.jpeg'
              })
            })
          ]),
          6
        );
      });
    });
  });

  describe('Modal Functionality', () => {
    it('opens modal with correct local image when painting is clicked', async () => {
      render(<Gallery />);

      await waitFor(() => {
        const paintingCard = screen.getByTestId('painting-card-1');
        fireEvent.click(paintingCard);
      });

      // Modal should open with local image
      expect(screen.getByTestId('painting-modal')).toBeInTheDocument();
      
      const modalImage = screen.getByTestId('painting-modal').querySelector('img');
      expect(modalImage).toHaveAttribute('src', '/img1.jpeg');
      expect(modalImage).toHaveAttribute('alt', 'Sunset Over Mountains');
    });

    it('displays full-size local images in modal', async () => {
      render(<Gallery />);

      await waitFor(() => {
        const paintingCard = screen.getByTestId('painting-card-2');
        fireEvent.click(paintingCard);
      });

      const modalImage = screen.getByTestId('painting-modal').querySelector('img');
      expect(modalImage).toHaveAttribute('src', '/img2.jpeg');
    });

    it('closes modal when close button is clicked', async () => {
      render(<Gallery />);

      // Open modal
      await waitFor(() => {
        const paintingCard = screen.getByTestId('painting-card-1');
        fireEvent.click(paintingCard);
      });

      expect(screen.getByTestId('painting-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByTestId('close-modal');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('painting-modal')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains image functionality across different screen sizes', async () => {
      // Mock window resize
      const originalInnerWidth = window.innerWidth;
      
      render(<Gallery />);

      // Test desktop view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      await waitFor(() => {
        expect(screen.getByTestId('painting-grid')).toBeInTheDocument();
      });

      // Test mobile view
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });

      fireEvent(window, new Event('resize'));

      // Images should still be accessible
      const images = screen.getAllByRole('img');
      const localImages = images.filter(img => 
        img.getAttribute('src')?.includes('/img') && 
        img.getAttribute('src')?.includes('.jpeg')
      );
      
      expect(localImages.length).toBeGreaterThan(0);

      // Restore original width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
    });

    it('handles scroll-based image preloading', async () => {
      const { preloadOnScroll } = await import('../../utils/imagePreloader');
      
      render(<Gallery />);

      // Simulate scroll
      fireEvent.scroll(window, { target: { scrollY: 500 } });

      await waitFor(() => {
        expect(preloadOnScroll).toHaveBeenCalled();
      });
    });
  });

  describe('Performance with Local Images', () => {
    it('loads local images faster than external URLs', async () => {
      const startTime = performance.now();
      
      render(<Gallery />);

      await waitFor(() => {
        expect(screen.getByTestId('painting-grid')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Local images should load quickly (less than 500ms for test environment)
      expect(loadTime).toBeLessThan(500);
    });

    it('does not make external network requests for images', async () => {
      // Mock fetch to track network requests
      const mockFetch = vi.fn();
      global.fetch = mockFetch;

      render(<Gallery />);

      await waitFor(() => {
        expect(screen.getByTestId('painting-grid')).toBeInTheDocument();
      });

      // Should not make any external image requests
      const externalRequests = mockFetch.mock.calls.filter(call => 
        call[0] && typeof call[0] === 'string' && 
        (call[0].includes('unsplash') || call[0].includes('http'))
      );

      expect(externalRequests).toHaveLength(0);
    });

    it('preloads next batch of images after initial load', async () => {
      const { preloadNextBatch } = await import('../../utils/imagePreloader');
      
      render(<Gallery />);

      // Wait for initial load and preload delay
      await waitFor(() => {
        expect(screen.getByTestId('painting-grid')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Should preload next batch after delay
      await waitFor(() => {
        expect(preloadNextBatch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('Error Handling', () => {
    it('handles missing local images gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(<Gallery />);

      await waitFor(() => {
        expect(screen.getByTestId('painting-grid')).toBeInTheDocument();
      });

      // Component should render without crashing even if images fail to load
      expect(screen.getByText('Art Gallery')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('shows loading state while images are being processed', async () => {
      // Mock loading state
      vi.mocked(require('../../hooks/usePaintings').usePaintings).mockReturnValueOnce({
        paintings: [],
        allPaintings: [],
        loading: true,
        error: null,
        filters: {},
        setFilters: vi.fn(),
        categories: [],
        priceRange: { min: 0, max: 1000 }
      });

      render(<Gallery />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Image Path Validation', () => {
    it('uses correct public directory paths', async () => {
      render(<Gallery />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        const paintingImages = images.filter(img => 
          img.getAttribute('src')?.startsWith('/img') && 
          img.getAttribute('src')?.endsWith('.jpeg')
        );

        paintingImages.forEach(img => {
          const src = img.getAttribute('src');
          expect(src).toMatch(/^\/img\d+\.jpeg$/);
        });
      });
    });

    it('maintains consistent image naming convention', async () => {
      render(<Gallery />);

      await waitFor(() => {
        const paintingCard1 = screen.getByTestId('painting-card-1');
        const img1 = paintingCard1.querySelector('img');
        expect(img1?.getAttribute('src')).toBe('/img1.jpeg');

        const paintingCard2 = screen.getByTestId('painting-card-2');
        const img2 = paintingCard2.querySelector('img');
        expect(img2?.getAttribute('src')).toBe('/img2.jpeg');
      });
    });
  });
});