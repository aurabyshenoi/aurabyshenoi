/**
 * Cross-Browser Compatibility Test Suite
 * Comprehensive tests for React Bits Masonry Gallery cross-browser support
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import MasonryGallery from '../MasonryGallery';
import BoundArtworkCard from '../BoundArtworkCard';
import CrossBrowserTester from '../CrossBrowserTester';
import { 
  detectBrowser, 
  detectBrowserFeatures, 
  checkBrowserSupport,
  testMasonryLayoutRendering,
  testBoundCardAnimations 
} from '../../utils/browserCompatibility';
import { testMasonryGalleryPerformance } from '../../utils/performanceMonitor';
import type { Painting } from '../../types/painting';

// Mock data
const mockArtworks: Painting[] = [
  {
    _id: '1',
    title: 'Test Artwork 1',
    medium: 'Oil on Canvas',
    images: {
      thumbnail: '/test-image-1.jpg',
      full: '/test-image-1-full.jpg'
    },
    price: 500,
    isAvailable: true,
    dimensions: { width: 16, height: 20, unit: 'inches' },
    category: 'Abstract',
    variant: 'medium' as const
  },
  {
    _id: '2',
    title: 'Test Artwork 2',
    medium: 'Acrylic',
    images: {
      thumbnail: '/test-image-2.jpg',
      full: '/test-image-2-full.jpg'
    },
    price: 750,
    isAvailable: true,
    dimensions: { width: 12, height: 16, unit: 'inches' },
    category: 'Landscape',
    variant: 'small' as const
  },
  {
    _id: '3',
    title: 'Test Artwork 3',
    medium: 'Watercolor',
    images: {
      thumbnail: '/test-image-3.jpg',
      full: '/test-image-3-full.jpg'
    },
    price: 1200,
    isAvailable: false,
    dimensions: { width: 24, height: 30, unit: 'inches' },
    category: 'Portrait',
    variant: 'large' as const
  }
];

// Mock browser APIs
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  vendor: 'Google Inc.',
  hardwareConcurrency: 8,
  deviceMemory: 8,
  connection: {
    effectiveType: '4g'
  }
};

const mockPerformance = {
  now: vi.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024 // 100MB
  }
};

const mockCSS = {
  supports: vi.fn((property: string, value: string) => {
    // Mock CSS.supports for different features
    const supportedFeatures = {
      'display': ['grid', 'flex'],
      'transform': ['translate3d(0, 0, 0)'],
      'will-change': ['transform'],
      'backdrop-filter': ['blur(10px)'],
      'color': ['var(--test)'],
      'object-fit': ['cover'],
      'aspect-ratio': ['1 / 1']
    };
    
    return supportedFeatures[property as keyof typeof supportedFeatures]?.includes(value) || false;
  })
};

const mockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

const mockRequestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  setTimeout(() => callback(Date.now()), 16);
  return 1;
});

const mockCancelAnimationFrame = vi.fn();

// Setup mocks
beforeEach(() => {
  // Mock global objects
  Object.defineProperty(window, 'navigator', {
    value: mockNavigator,
    writable: true
  });
  
  Object.defineProperty(window, 'performance', {
    value: mockPerformance,
    writable: true
  });
  
  Object.defineProperty(window, 'CSS', {
    value: mockCSS,
    writable: true
  });
  
  Object.defineProperty(window, 'IntersectionObserver', {
    value: mockIntersectionObserver,
    writable: true
  });
  
  Object.defineProperty(window, 'requestAnimationFrame', {
    value: mockRequestAnimationFrame,
    writable: true
  });
  
  Object.defineProperty(window, 'cancelAnimationFrame', {
    value: mockCancelAnimationFrame,
    writable: true
  });

  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Browser Detection', () => {
  it('should detect Chrome browser correctly', () => {
    const browser = detectBrowser();
    
    expect(browser.name).toBe('Chrome');
    expect(browser.engine).toBe('Blink');
    expect(browser.version).toBe('91');
  });

  it('should detect Firefox browser correctly', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        ...mockNavigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        vendor: ''
      },
      writable: true
    });

    const browser = detectBrowser();
    
    expect(browser.name).toBe('Firefox');
    expect(browser.engine).toBe('Gecko');
    expect(browser.version).toBe('89');
  });

  it('should detect Safari browser correctly', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        ...mockNavigator,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        vendor: 'Apple Computer, Inc.'
      },
      writable: true
    });

    const browser = detectBrowser();
    
    expect(browser.name).toBe('Safari');
    expect(browser.engine).toBe('WebKit');
    expect(browser.version).toBe('14');
  });

  it('should detect Edge browser correctly', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        ...mockNavigator,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        vendor: 'Google Inc.'
      },
      writable: true
    });

    const browser = detectBrowser();
    
    expect(browser.name).toBe('Edge');
    expect(browser.engine).toBe('Blink');
    expect(browser.version).toBe('91');
  });
});

describe('Feature Detection', () => {
  it('should detect browser features correctly', () => {
    const features = detectBrowserFeatures();
    
    expect(features.cssGrid).toBe(true);
    expect(features.flexbox).toBe(true);
    expect(features.transforms3d).toBe(true);
    expect(features.willChange).toBe(true);
    expect(features.intersectionObserver).toBe(true);
    expect(features.backdropFilter).toBe(true);
    expect(features.customProperties).toBe(true);
    expect(features.objectFit).toBe(true);
    expect(features.aspectRatio).toBe(true);
  });

  it('should handle missing CSS.supports gracefully', () => {
    Object.defineProperty(window, 'CSS', {
      value: undefined,
      writable: true
    });

    const features = detectBrowserFeatures();
    
    // Should default to false when CSS.supports is not available
    expect(features.cssGrid).toBe(false);
    expect(features.flexbox).toBe(false);
  });

  it('should detect missing IntersectionObserver', () => {
    Object.defineProperty(window, 'IntersectionObserver', {
      value: undefined,
      writable: true
    });

    const features = detectBrowserFeatures();
    
    expect(features.intersectionObserver).toBe(false);
  });
});

describe('Browser Support Check', () => {
  it('should mark supported browsers as supported', () => {
    const isSupported = checkBrowserSupport('Chrome', '91', {
      cssGrid: true,
      flexbox: true,
      transforms3d: true,
      willChange: true,
      intersectionObserver: true,
      framerMotion: true,
      backdropFilter: true,
      customProperties: true,
      objectFit: true,
      aspectRatio: true
    });
    
    expect(isSupported).toBe(true);
  });

  it('should mark unsupported browsers as unsupported', () => {
    const isSupported = checkBrowserSupport('Chrome', '50', {
      cssGrid: false,
      flexbox: true,
      transforms3d: false,
      willChange: false,
      intersectionObserver: false,
      framerMotion: false,
      backdropFilter: false,
      customProperties: false,
      objectFit: false,
      aspectRatio: false
    });
    
    expect(isSupported).toBe(false);
  });

  it('should handle unknown browsers', () => {
    const isSupported = checkBrowserSupport('Unknown', '1', {
      cssGrid: true,
      flexbox: true,
      transforms3d: true,
      willChange: true,
      intersectionObserver: true,
      framerMotion: true,
      backdropFilter: true,
      customProperties: true,
      objectFit: true,
      aspectRatio: true
    });
    
    expect(isSupported).toBe(true); // Should pass if features are supported
  });
});

describe('Masonry Layout Rendering Tests', () => {
  it('should test masonry layout rendering successfully', async () => {
    const result = await testMasonryLayoutRendering();
    
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle layout rendering errors gracefully', async () => {
    // Mock DOM methods to simulate errors
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn(() => {
      throw new Error('DOM manipulation failed');
    });

    const result = await testMasonryLayoutRendering();
    
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Layout test failed');

    // Restore original method
    document.createElement = originalCreateElement;
  });
});

describe('Animation Performance Tests', () => {
  it('should test bound card animations successfully', async () => {
    const result = await testBoundCardAnimations();
    
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect animation issues', async () => {
    // Mock getComputedStyle to return no transform support
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = vi.fn(() => ({
      transform: 'none',
      transition: 'none'
    } as CSSStyleDeclaration));

    const result = await testBoundCardAnimations();
    
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings).toContain('3D transforms may not be supported');

    // Restore original method
    window.getComputedStyle = originalGetComputedStyle;
  });
});

describe('MasonryGallery Cross-Browser Compatibility', () => {
  const mockOnCardClick = vi.fn();

  it('should render masonry gallery with proper structure', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={mockOnCardClick}
      />
    );

    expect(screen.getByRole('region', { name: /featured artwork gallery/i })).toBeInTheDocument();
    expect(screen.getAllByRole('group')).toHaveLength(3); // 3 columns by default
  });

  it('should handle keyboard navigation', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={mockOnCardClick}
      />
    );

    const gallery = screen.getByRole('region');
    
    // Test arrow key navigation
    fireEvent.keyDown(gallery, { key: 'ArrowRight' });
    fireEvent.keyDown(gallery, { key: 'ArrowLeft' });
    fireEvent.keyDown(gallery, { key: 'Home' });
    fireEvent.keyDown(gallery, { key: 'End' });

    // Should not throw errors
    expect(gallery).toBeInTheDocument();
  });

  it('should apply responsive classes correctly', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={mockOnCardClick}
      />
    );

    const container = screen.getByRole('region');
    expect(container).toHaveClass('masonry-gallery-container');
  });
});

describe('BoundArtworkCard Cross-Browser Compatibility', () => {
  const mockOnClick = vi.fn();
  const mockOnRegisterElement = vi.fn();

  it('should render bound artwork card with accessibility attributes', () => {
    render(
      <BoundArtworkCard
        artwork={mockArtworks[0]}
        variant="medium"
        onClick={mockOnClick}
        index={0}
        isVisible={true}
        onRegisterElement={mockOnRegisterElement}
        totalArtworks={3}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label');
    expect(card).toHaveAttribute('aria-describedby');
    expect(card).toHaveAttribute('aria-posinset', '1');
    expect(card).toHaveAttribute('aria-setsize', '3');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('should handle keyboard interactions', () => {
    render(
      <BoundArtworkCard
        artwork={mockArtworks[0]}
        variant="medium"
        onClick={mockOnClick}
        index={0}
        isVisible={true}
        onRegisterElement={mockOnRegisterElement}
        totalArtworks={3}
      />
    );

    const card = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnClick).toHaveBeenCalledWith(mockArtworks[0], 0);

    // Test Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnClick).toHaveBeenCalledTimes(2);
  });

  it('should handle image loading errors', () => {
    render(
      <BoundArtworkCard
        artwork={mockArtworks[0]}
        variant="medium"
        onClick={mockOnClick}
        index={0}
        isVisible={true}
        onRegisterElement={mockOnRegisterElement}
        totalArtworks={3}
      />
    );

    const image = screen.getByAltText(mockArtworks[0].title);
    
    // Simulate image load error
    fireEvent.error(image);
    
    // Should fallback to placeholder
    expect(image).toHaveAttribute('src', '/placeholder-painting.svg');
  });

  it('should apply variant-specific classes', () => {
    const { rerender } = render(
      <BoundArtworkCard
        artwork={mockArtworks[0]}
        variant="small"
        onClick={mockOnClick}
        index={0}
        isVisible={true}
        onRegisterElement={mockOnRegisterElement}
        totalArtworks={3}
      />
    );

    let card = screen.getByRole('button');
    expect(card).toHaveClass('variant-small');

    rerender(
      <BoundArtworkCard
        artwork={mockArtworks[0]}
        variant="large"
        onClick={mockOnClick}
        index={0}
        isVisible={true}
        onRegisterElement={mockOnRegisterElement}
        totalArtworks={3}
      />
    );

    card = screen.getByRole('button');
    expect(card).toHaveClass('variant-large');
  });
});

describe('CrossBrowserTester Component', () => {
  it('should render testing interface', () => {
    render(<CrossBrowserTester showUI={true} />);

    expect(screen.getByText('Cross-Browser & Performance Tester')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /run tests/i })).toBeInTheDocument();
  });

  it('should run tests when button is clicked', async () => {
    render(<CrossBrowserTester showUI={true} />);

    const runButton = screen.getByRole('button', { name: /run tests/i });
    fireEvent.click(runButton);

    expect(screen.getByText('Running Tests...')).toBeInTheDocument();
    
    // Wait for tests to complete
    await waitFor(() => {
      expect(screen.getByText(/tests completed/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('should not render UI when showUI is false', () => {
    render(<CrossBrowserTester showUI={false} />);

    expect(screen.queryByText('Cross-Browser & Performance Tester')).not.toBeInTheDocument();
  });

  it('should call onTestComplete callback', async () => {
    const mockOnTestComplete = vi.fn();
    
    render(
      <CrossBrowserTester 
        showUI={true} 
        onTestComplete={mockOnTestComplete}
        autoRun={true}
      />
    );

    await waitFor(() => {
      expect(mockOnTestComplete).toHaveBeenCalled();
    }, { timeout: 10000 });
  });
});

describe('Performance Testing', () => {
  it('should measure gallery performance', async () => {
    const testElement = document.createElement('div');
    testElement.className = 'masonry-gallery-container';
    document.body.appendChild(testElement);

    const result = await testMasonryGalleryPerformance(testElement, []);
    
    expect(result.metrics).toBeDefined();
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(Array.isArray(result.optimizations)).toBe(true);
    expect(Array.isArray(result.warnings)).toBe(true);

    document.body.removeChild(testElement);
  });

  it('should handle performance testing errors', async () => {
    // Test with null element
    await expect(testMasonryGalleryPerformance(null as any, [])).rejects.toThrow();
  });
});

describe('Responsive Behavior', () => {
  it('should adapt to different screen sizes', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={vi.fn()}
      />
    );

    const container = screen.getByRole('region');
    expect(container).toHaveClass('masonry-gallery-container');
  });

  it('should handle window resize events', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={vi.fn()}
      />
    );

    // Simulate window resize
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    });

    fireEvent(window, new Event('resize'));

    // Component should still be rendered
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
});

describe('Accessibility Compliance', () => {
  it('should provide proper ARIA labels', () => {
    render(
      <MasonryGallery
        artworks={mockArtworks}
        onCardClick={vi.fn()}
      />
    );

    const gallery = screen.getByRole('region', { name: /featured artwork gallery/i });
    expect(gallery).toHaveAttribute('aria-describedby', 'gallery-description');

    const columns = screen.getAllByRole('group');
    columns.forEach((column, index) => {
      expect(column).toHaveAttribute('aria-label', `Gallery column ${index + 1} of ${columns.length}`);
    });
  });

  it('should support screen readers', () => {
    render(
      <BoundArtworkCard
        artwork={mockArtworks[0]}
        variant="medium"
        onClick={vi.fn()}
        index={0}
        isVisible={true}
        onRegisterElement={vi.fn()}
        totalArtworks={3}
      />
    );

    const description = screen.getByText(/artwork titled test artwork 1/i);
    expect(description).toHaveClass('sr-only');
  });

  it('should handle focus management', () => {
    render(
      <BoundArtworkCard
        artwork={mockArtworks[0]}
        variant="medium"
        onClick={vi.fn()}
        index={0}
        isVisible={true}
        onRegisterElement={vi.fn()}
        totalArtworks={3}
      />
    );

    const card = screen.getByRole('button');
    card.focus();
    
    expect(document.activeElement).toBe(card);
  });
});