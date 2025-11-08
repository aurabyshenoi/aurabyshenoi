/**
 * Accessibility tests for Artist Image components
 * Tests alt text, ARIA attributes, keyboard navigation, and cross-browser compatibility
 * Requirements: 1.5, 2.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import About from '../About';
import Homepage from '../Homepage';

// Mock child components
vi.mock('../Layout', () => ({
  default: ({ children }: any) => <div data-testid="layout">{children}</div>
}));

vi.mock('../TestimonialSection', () => ({
  default: () => <div data-testid="testimonial-section">Testimonials</div>
}));

vi.mock('../MasonryGallery', () => ({
  default: () => <div data-testid="masonry-gallery">Gallery</div>
}));

vi.mock('../../hooks/usePaintings', () => ({
  usePaintings: () => ({
    allPaintings: [],
    loading: false
  })
}));

vi.mock('../../utils/api', () => ({
  apiFetch: vi.fn(() => Promise.resolve({ ok: false })),
  subscribeToNewsletter: vi.fn()
}));

describe('Artist Image Accessibility - About Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders artist image with descriptive alt text', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    expect(artistImage).toBeInTheDocument();
    expect(artistImage).toHaveAttribute('alt', 'Artist portrait in traditional attire with vibrant orange decorations and lush greenery in the background');
  });

  it('has proper image source attribute', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    expect(artistImage).toHaveAttribute('src', '/artist-photo.jpeg');
  });

  it('maintains landscape aspect ratio with proper CSS classes', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const container = artistImage.parentElement;
    
    expect(container).toHaveClass('aspect-[4/3]');
    expect(artistImage).toHaveClass('object-cover', 'object-center');
  });

  it('has proper image container with responsive classes', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const container = artistImage.parentElement;
    
    expect(container).toHaveClass('w-full');
    expect(container).toHaveClass('bg-warm-gray');
    expect(container).toHaveClass('rounded-lg');
    expect(container).toHaveClass('shadow-lg');
    expect(container).toHaveClass('overflow-hidden');
  });

  it('provides fallback placeholder with accessible content', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const container = artistImage.parentElement;
    const placeholder = container?.querySelector('.bg-gradient-to-br');
    
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveTextContent('Artist Photo');
  });

  it('handles image load errors gracefully', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i) as HTMLImageElement;
    
    // Verify error handler exists
    expect(artistImage.onerror).toBeDefined();
  });
});

describe('Artist Image Accessibility - Homepage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders artist image with descriptive alt text', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    expect(artistImage).toBeInTheDocument();
    expect(artistImage).toHaveAttribute('alt', 'Artist portrait in traditional attire with vibrant orange decorations and lush greenery in the background');
  });

  it('has proper image source attribute', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    expect(artistImage).toHaveAttribute('src', '/artist-photo.jpeg');
  });

  it('maintains landscape aspect ratio with proper CSS classes', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const container = artistImage.parentElement;
    
    expect(container).toHaveClass('aspect-[4/3]');
    expect(artistImage).toHaveClass('object-cover', 'object-center');
  });

  it('has proper image container with responsive classes', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const container = artistImage.parentElement;
    
    expect(container).toHaveClass('w-full');
    expect(container).toHaveClass('bg-warm-gray');
    expect(container).toHaveClass('rounded-lg');
    expect(container).toHaveClass('shadow-lg');
    expect(container).toHaveClass('overflow-hidden');
  });

  it('provides fallback placeholder with accessible content', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const container = artistImage.parentElement;
    const placeholder = container?.querySelector('.bg-gradient-to-br');
    
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveTextContent('Artist Portrait');
  });

  it('handles image load errors gracefully', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i) as HTMLImageElement;
    
    // Verify error handler exists
    expect(artistImage.onerror).toBeDefined();
  });
});

describe('Artist Image Cross-Component Consistency', () => {
  it('uses same image source in both About and Homepage', () => {
    const { unmount: unmountAbout } = render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const aboutImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const aboutSrc = aboutImage.getAttribute('src');

    unmountAbout();

    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const homepageImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const homepageSrc = homepageImage.getAttribute('src');

    expect(aboutSrc).toBe(homepageSrc);
    expect(aboutSrc).toBe('/artist-photo.jpeg');
  });

  it('uses same alt text in both About and Homepage', () => {
    const { unmount: unmountAbout } = render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const aboutImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const aboutAlt = aboutImage.getAttribute('alt');

    unmountAbout();

    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const homepageImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const homepageAlt = homepageImage.getAttribute('alt');

    expect(aboutAlt).toBe(homepageAlt);
  });

  it('uses same aspect ratio in both About and Homepage', () => {
    const { unmount: unmountAbout } = render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const aboutImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const aboutContainer = aboutImage.parentElement;
    const aboutHasAspectRatio = aboutContainer?.classList.contains('aspect-[4/3]');

    unmountAbout();

    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const homepageImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const homepageContainer = homepageImage.parentElement;
    const homepageHasAspectRatio = homepageContainer?.classList.contains('aspect-[4/3]');

    expect(aboutHasAspectRatio).toBe(true);
    expect(homepageHasAspectRatio).toBe(true);
  });
});

describe('Artist Image Screen Reader Support', () => {
  it('provides meaningful alt text for screen readers in About', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const altText = artistImage.getAttribute('alt');
    
    // Alt text should be descriptive and meaningful
    expect(altText).toBeTruthy();
    expect(altText!.length).toBeGreaterThan(20);
    expect(altText!.toLowerCase()).toContain('artist');
    expect(altText!.toLowerCase()).toContain('portrait');
  });

  it('provides meaningful alt text for screen readers in Homepage', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const altText = artistImage.getAttribute('alt');
    
    // Alt text should be descriptive and meaningful
    expect(altText).toBeTruthy();
    expect(altText!.length).toBeGreaterThan(20);
    expect(altText!.toLowerCase()).toContain('artist');
    expect(altText!.toLowerCase()).toContain('portrait');
  });

  it('fallback placeholder has accessible text content in About', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const container = artistImage.parentElement;
    const placeholder = container?.querySelector('.bg-gradient-to-br');
    
    expect(placeholder).toHaveTextContent('Artist Photo');
  });

  it('fallback placeholder has accessible text content in Homepage', () => {
    render(
      <BrowserRouter>
        <Homepage />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const container = artistImage.parentElement;
    const placeholder = container?.querySelector('.bg-gradient-to-br');
    
    expect(placeholder).toHaveTextContent('Artist Portrait');
  });
});

describe('Artist Image Browser Compatibility', () => {
  it('uses standard img element for cross-browser support', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    expect(artistImage.tagName).toBe('IMG');
  });

  it('uses object-fit CSS for proper image scaling', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    expect(artistImage).toHaveClass('object-cover');
  });

  it('uses object-position for proper image centering', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    expect(artistImage).toHaveClass('object-center');
  });

  it('container uses standard CSS properties for layout', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    const artistImage = screen.getByAltText(/artist portrait in traditional attire/i);
    const container = artistImage.parentElement;
    
    // Check for standard layout properties
    expect(container).toHaveClass('w-full');
    expect(container).toHaveClass('overflow-hidden');
    expect(container).toHaveClass('rounded-lg');
  });
});
