/**
 * Tests for Homepage Featured Artwork Section with 12-image collection
 * Validates that featured artwork can select from expanded collection and displays correctly
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Homepage from '../Homepage';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the apiFetch utility
vi.mock('../../utils/api', () => ({
  apiFetch: vi.fn()
}));

// Mock MasonryGallery component
vi.mock('../MasonryGallery', () => ({
  default: ({ artworks, onCardClick }: any) => (
    <div data-testid="masonry-gallery">
      {artworks.map((artwork: any, index: number) => (
        <div 
          key={artwork._id}
          data-testid={`featured-artwork-${artwork._id}`}
          onClick={() => onCardClick(artwork, index)}
          className="featured-artwork-card"
        >
          <img src={artwork.images.thumbnail} alt={artwork.title} />
          <h3>{artwork.title}</h3>
          <p>{artwork.medium}</p>
          <span>${artwork.price}</span>
        </div>
      ))}
    </div>
  )
}));

// Mock Layout component
vi.mock('../Layout', () => ({
  default: ({ children }: any) => <div data-testid="layout">{children}</div>
}));

// Mock other utilities
vi.mock('../../utils/galleryManager', () => ({
  GalleryManager: vi.fn().mockImplementation(() => ({})),
  defaultGalleryConfig: {}
}));

vi.mock('../../utils/galleryTesting', () => ({
  initializeGalleryTesting: vi.fn()
}));

describe('Homepage Featured Artwork Section with 12-Image Collection', () => {
  const mockFeaturedPaintings = [
    {
      _id: '1',
      title: 'Sunset Over Mountains',
      description: 'A breathtaking view of golden hour light cascading over mountain peaks.',
      dimensions: { width: 24, height: 18, unit: 'inches' },
      medium: 'Oil on Canvas',
      price: 850,
      category: 'landscape',
      images: { thumbnail: '/img1.jpeg', fullSize: ['/img1.jpeg'] },
      isAvailable: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      _id: '7',
      title: 'Mountain Lake Reflection',
      description: 'Serene alpine lake perfectly mirroring snow-capped peaks in crystal clear waters.',
      dimensions: { width: 28, height: 22, unit: 'inches' },
      medium: 'Oil on Canvas',
      price: 950,
      category: 'landscape',
      images: { thumbnail: '/img7.jpeg', fullSize: ['/img7.jpeg'] },
      isAvailable: true,
      createdAt: '2023-12-15T08:30:00Z',
      updatedAt: '2023-12-15T08:30:00Z'
    },
    {
      _id: '8',
      title: 'Coastal Storm',
      description: 'Dramatic seascape capturing the raw power of nature as storm clouds gather.',
      dimensions: { width: 32, height: 24, unit: 'inches' },
      medium: 'Acrylic on Canvas',
      price: 1350,
      category: 'seascape',
      images: { thumbnail: '/img8.jpeg', fullSize: ['/img8.jpeg'] },
      isAvailable: true,
      createdAt: '2023-12-10T15:45:00Z',
      updatedAt: '2023-12-10T15:45:00Z'
    },
    {
      _id: '9',
      title: 'Autumn Birch Grove',
      description: 'Golden birch trees in their autumn splendor, with delicate leaves creating a warm canopy.',
      dimensions: { width: 18, height: 24, unit: 'inches' },
      medium: 'Watercolor',
      price: 520,
      category: 'nature',
      images: { thumbnail: '/img9.jpeg', fullSize: ['/img9.jpeg'] },
      isAvailable: true,
      createdAt: '2023-12-05T12:20:00Z',
      updatedAt: '2023-12-05T12:20:00Z'
    },
    {
      _id: '10',
      title: 'Metropolitan Skyline',
      description: 'Modern city architecture reaching toward the sky, showcasing geometric beauty.',
      dimensions: { width: 40, height: 30, unit: 'inches' },
      medium: 'Mixed Media',
      price: 1650,
      category: 'urban',
      images: { thumbnail: '/img10.jpeg', fullSize: ['/img10.jpeg'] },
      isAvailable: true,
      createdAt: '2023-11-30T14:15:00Z',
      updatedAt: '2023-11-30T14:15:00Z'
    },
    {
      _id: '12',
      title: 'Desert Bloom',
      description: 'Unexpected beauty in the arid landscape as desert wildflowers burst into bloom.',
      dimensions: { width: 26, height: 20, unit: 'inches' },
      medium: 'Oil on Canvas',
      price: 780,
      category: 'nature',
      images: { thumbnail: '/img12.jpeg', fullSize: ['/img12.jpeg'] },
      isAvailable: true,
      createdAt: '2023-11-20T16:30:00Z',
      updatedAt: '2023-11-20T16:30:00Z'
    }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock successful API response with featured paintings from expanded collection
    const { apiFetch } = await import('../../utils/api');
    vi.mocked(apiFetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: {
          paintings: mockFeaturedPaintings
        }
      })
    });
  });

  describe('Featured Artwork Selection from Expanded Collection', () => {
    it('displays featured artwork including images from 7-12 range', async () => {
      render(<Homepage />);

      await waitFor(() => {
        expect(screen.getByTestId('masonry-gallery')).toBeInTheDocument();
      });

      // Verify that featured artwork includes paintings from the new range (7-12)
      expect(screen.getByTestId('featured-artwork-7')).toBeInTheDocument();
      expect(screen.getByTestId('featured-artwork-8')).toBeInTheDocument();
      expect(screen.getByTestId('featured-artwork-9')).toBeInTheDocument();
      expect(screen.getByTestId('featured-artwork-10')).toBeInTheDocument();
      expect(screen.getByTestId('featured-artwork-12')).toBeInTheDocument();

      // Verify correct image paths for new paintings
      const img7 = screen.getByTestId('featured-artwork-7').querySelector('img');
      const img8 = screen.getByTestId('featured-artwork-8').querySelector('img');
      const img12 = screen.getByTestId('featured-artwork-12').querySelector('img');
      
      expect(img7).toHaveAttribute('src', '/img7.jpeg');
      expect(img8).toHaveAttribute('src', '/img8.jpeg');
      expect(img12).toHaveAttribute('src', '/img12.jpeg');
    });

    it('shows diverse artwork from different categories in featured section', async () => {
      render(<Homepage />);

      await waitFor(() => {
        expect(screen.getByTestId('masonry-gallery')).toBeInTheDocument();
      });

      // Verify diverse categories are represented
      expect(screen.getByText('Mountain Lake Reflection')).toBeInTheDocument(); // landscape
      expect(screen.getByText('Coastal Storm')).toBeInTheDocument(); // seascape
      expect(screen.getByText('Autumn Birch Grove')).toBeInTheDocument(); // nature
      expect(screen.getByText('Metropolitan Skyline')).toBeInTheDocument(); // urban
      expect(screen.getByText('Desert Bloom')).toBeInTheDocument(); // nature

      // Verify different mediums are represented
      expect(screen.getAllByText('Oil on Canvas')).toHaveLength(3);
      expect(screen.getByText('Acrylic on Canvas')).toBeInTheDocument();
      expect(screen.getByText('Watercolor')).toBeInTheDocument();
      expect(screen.getByText('Mixed Media')).toBeInTheDocument();
    });

    it('displays correct pricing for new featured artwork', async () => {
      render(<Homepage />);

      await waitFor(() => {
        expect(screen.getByTestId('masonry-gallery')).toBeInTheDocument();
      });

      // Verify prices for new paintings (7-12) are displayed correctly
      expect(screen.getByText('$950')).toBeInTheDocument(); // Mountain Lake Reflection
      expect(screen.getByText('$1350')).toBeInTheDocument(); // Coastal Storm
      expect(screen.getByText('$520')).toBeInTheDocument(); // Autumn Birch Grove
      expect(screen.getByText('$1650')).toBeInTheDocument(); // Metropolitan Skyline
      expect(screen.getByText('$780')).toBeInTheDocument(); // Desert Bloom
    });
  });

  describe('Modal Functionality with Expanded Featured Collection', () => {
    it('opens modal for featured artwork from expanded collection', async () => {
      render(<Homepage />);

      await waitFor(() => {
        expect(screen.getByTestId('masonry-gallery')).toBeInTheDocument();
      });

      // Click on a featured artwork from the new range (img7)
      const featuredArtwork7 = screen.getByTestId('featured-artwork-7');
      fireEvent.click(featuredArtwork7);

      // Verify modal opens with correct content
      await waitFor(() => {
        expect(screen.getByTestId('modal-title')).toBeInTheDocument();
      });

      // Check modal displays correct artwork
      const modalImage = document.querySelector('.modal-image') as HTMLImageElement;
      expect(modalImage).toHaveAttribute('src', '/img7.jpeg');
    });

    it('navigates between featured artworks in modal correctly', async () => {
      render(<Homepage />);

      await waitFor(() => {
        expect(screen.getByTestId('masonry-gallery')).toBeInTheDocument();
      });

      // Click on first featured artwork
      const firstArtwork = screen.getByTestId('featured-artwork-1');
      fireEvent.click(firstArtwork);

      await waitFor(() => {
        expect(document.querySelector('.modal-viewer.active')).toBeInTheDocument();
      });

      // Navigate to next artwork using arrow button
      const nextButton = document.querySelector('.nav-next') as HTMLButtonElement;
      fireEvent.click(nextButton);

      // Verify navigation works with expanded collection
      const modalImage = document.querySelector('.modal-image') as HTMLImageElement;
      expect(modalImage).toHaveAttribute('src', '/img7.jpeg'); // Should show next artwork

      // Navigate to previous
      const prevButton = document.querySelector('.nav-prev') as HTMLButtonElement;
      fireEvent.click(prevButton);

      // Should go back to first artwork
      expect(modalImage).toHaveAttribute('src', '/img1.jpeg');
    });

    it('handles keyboard navigation in modal with expanded collection', async () => {
      render(<Homepage />);

      await waitFor(() => {
        expect(screen.getByTestId('masonry-gallery')).toBeInTheDocument();
      });

      // Open modal
      const featuredArtwork = screen.getByTestId('featured-artwork-1');
      fireEvent.click(featuredArtwork);

      await waitFor(() => {
        expect(document.querySelector('.modal-viewer.active')).toBeInTheDocument();
      });

      // Test right arrow key navigation
      fireEvent.keyDown(document, { key: 'ArrowRight' });
      
      const modalImage = document.querySelector('.modal-image') as HTMLImageElement;
      expect(modalImage).toHaveAttribute('src', '/img7.jpeg');

      // Test left arrow key navigation
      fireEvent.keyDown(document, { key: 'ArrowLeft' });
      expect(modalImage).toHaveAttribute('src', '/img1.jpeg');

      // Test escape key closes modal
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(document.querySelector('.modal-viewer.active')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Layout with Expanded Collection', () => {
    it('maintains responsive layout with featured artwork from expanded collection', async () => {
      // Mock window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<Homepage />);

      await waitFor(() => {
        expect(screen.getByTestId('masonry-gallery')).toBeInTheDocument();
      });

      // Verify masonry gallery is rendered (responsive behavior is handled by MasonryGallery)
      const masonryGallery = screen.getByTestId('masonry-gallery');
      expect(masonryGallery).toBeInTheDocument();

      // Verify all featured artworks are still displayed
      expect(screen.getByTestId('featured-artwork-1')).toBeInTheDocument();
      expect(screen.getByTestId('featured-artwork-7')).toBeInTheDocument();
      expect(screen.getByTestId('featured-artwork-12')).toBeInTheDocument();
    });

    it('handles mobile layout with expanded featured collection', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Homepage />);

      await waitFor(() => {
        expect(screen.getByTestId('masonry-gallery')).toBeInTheDocument();
      });

      // Verify featured artwork section is still functional on mobile
      const featuredSection = document.querySelector('.featured-artwork-gallery');
      expect(featuredSection).toBeInTheDocument();

      // Verify artworks from expanded collection are displayed
      expect(screen.getByText('Mountain Lake Reflection')).toBeInTheDocument();
      expect(screen.getByText('Desert Bloom')).toBeInTheDocument();
    });
  });

  describe('API Integration with Expanded Collection', () => {
    it('requests featured paintings with correct parameters', async () => {
      const { apiFetch } = await import('../../utils/api');
      
      render(<Homepage />);

      await waitFor(() => {
        expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/api/paintings?featured=true&limit=6');
      });
    });

    it('handles API response with paintings from expanded collection', async () => {
      render(<Homepage />);

      await waitFor(() => {
        expect(screen.getByTestId('masonry-gallery')).toBeInTheDocument();
      });

      // Verify that paintings from the expanded collection (7-12) are handled correctly
      expect(screen.getByTestId('featured-artwork-7')).toBeInTheDocument();
      expect(screen.getByTestId('featured-artwork-8')).toBeInTheDocument();
      expect(screen.getByTestId('featured-artwork-9')).toBeInTheDocument();
      expect(screen.getByTestId('featured-artwork-10')).toBeInTheDocument();
      expect(screen.getByTestId('featured-artwork-12')).toBeInTheDocument();
    });

    it('handles loading state correctly', async () => {
      const { apiFetch } = await import('../../utils/api');
      
      // Mock delayed API response
      vi.mocked(apiFetch).mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { paintings: mockFeaturedPaintings }
            })
          }), 100)
        )
      );

      render(<Homepage />);

      // Initially should show loading state
      expect(screen.getByText('Loading featured artwork...')).toBeInTheDocument();

      // After API resolves, should show artwork
      await waitFor(() => {
        expect(screen.getByTestId('masonry-gallery')).toBeInTheDocument();
      });

      expect(screen.queryByText('Loading featured artwork...')).not.toBeInTheDocument();
    });

    it('handles API error gracefully', async () => {
      const { apiFetch } = await import('../../utils/api');
      
      // Mock API error
      vi.mocked(apiFetch).mockRejectedValue(new Error('API Error'));

      render(<Homepage />);

      await waitFor(() => {
        expect(screen.getByText('No featured artwork available at the moment.')).toBeInTheDocument();
      });
    });
  });

  describe('Featured Artwork Section Content', () => {
    it('displays section header and description correctly', async () => {
      render(<Homepage />);

      expect(screen.getByText('Featured Artwork')).toBeInTheDocument();
      expect(screen.getByText(/Discover a curated selection of our most beloved pieces/)).toBeInTheDocument();
    });

    it('displays call-to-action button', async () => {
      render(<Homepage />);

      const viewAllButton = screen.getByText('View All Artwork');
      expect(viewAllButton).toBeInTheDocument();
      expect(viewAllButton.tagName).toBe('BUTTON');
    });

    it('limits featured artwork display to 6 pieces', async () => {
      render(<Homepage />);

      await waitFor(() => {
        expect(screen.getByTestId('masonry-gallery')).toBeInTheDocument();
      });

      // Should display exactly 6 featured artworks (limited by slice(0, 6))
      const featuredArtworks = screen.getAllByTestId(/featured-artwork-/);
      expect(featuredArtworks).toHaveLength(6);
    });
  });
});