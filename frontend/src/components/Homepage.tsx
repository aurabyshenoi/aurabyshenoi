import React, { useState, useEffect, useRef } from 'react';
import { Layout, PaintingCard } from './index';
import { useCart } from '../contexts/CartContext';
import { Painting } from '../types/painting';
import { apiFetch } from '../utils/api';
import { GalleryManager, defaultGalleryConfig } from '../utils/galleryManager';
import { initializeGalleryTesting } from '../utils/galleryTesting';

interface HomepageProps {
  onCartClick?: () => void;
  onGalleryClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onCartClick, onGalleryClick, onAboutClick, onContactClick }) => {
  const { cart } = useCart();
  const [featuredPaintings, setFeaturedPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const galleryManagerRef = useRef<GalleryManager | null>(null);

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    }
  };

  // Fetch featured paintings
  useEffect(() => {
    const fetchFeaturedPaintings = async () => {
      try {
        const response = await apiFetch('/api/paintings?featured=true&limit=6');
        if (response.ok) {
          const data = await response.json();
          setFeaturedPaintings(data.paintings || []);
        }
      } catch (error) {
        console.error('Error fetching featured paintings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPaintings();
  }, []);

  // Initialize gallery manager after component mounts
  useEffect(() => {
    // Wait for DOM to be ready
    const initializeGallery = () => {
      if (!galleryManagerRef.current) {
        galleryManagerRef.current = new GalleryManager(defaultGalleryConfig);
        
        // Initialize testing in development mode
        initializeGalleryTesting();
      }
    };

    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initializeGallery, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup is handled by the gallery manager itself
    };
  }, []);

  return (
    <Layout 
      cartItemCount={cart.totalItems} 
      onCartClick={handleCartClick}
      onGalleryClick={onGalleryClick}
      onAboutClick={onAboutClick}
      onContactClick={onContactClick}
    >
      <div className="min-h-screen bg-off-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-cream via-off-white to-sage-green-light/20 overflow-hidden">
          <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-brown mb-6 leading-tight">
                  Discover Art That
                  <span className="block text-sage-green-dark">Speaks to Your Soul</span>
                </h1>
                <p className="text-lg md:text-xl text-text-light mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Welcome to a world where nature's beauty comes alive through vibrant colors and 
                  expressive brushstrokes. Each painting tells a unique story, waiting to find 
                  its perfect home.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button
                    onClick={onGalleryClick}
                    className="bg-sage-green text-white px-8 py-4 rounded-md font-medium text-lg hover:bg-sage-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 shadow-lg"
                  >
                    Explore Gallery
                  </button>
                  <button
                    onClick={onAboutClick}
                    className="bg-transparent border-2 border-brown text-brown px-8 py-4 rounded-md font-medium text-lg hover:bg-brown hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2"
                  >
                    Meet the Artist
                  </button>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative">
                <div className="relative z-10">
                  <div className="w-full bg-warm-gray rounded-lg shadow-2xl overflow-hidden">
                    {/* Featured artwork image */}
                    <img 
                      src="/image.png" 
                      alt="Featured Artwork" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-brown/10 rounded-full"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-sage-green/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Artwork Gallery */}
        <section className="featured-artwork-gallery py-16 md:py-20">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="gallery-title text-3xl md:text-4xl font-serif text-brown mb-4">
                Featured Artwork
              </h2>
              <p className="text-text-light text-lg max-w-3xl mx-auto">
                Discover a curated selection of our most beloved pieces, each capturing 
                the essence of natural beauty and artistic expression.
              </p>
            </div>

            {/* Gallery Collage - Puzzle-like Layout */}
            <div className="gallery-collage mb-12" role="grid" aria-label="Featured artwork gallery">
              {/* Large featured piece */}
              <div className="gallery-item size-large" data-image-index="0" role="gridcell">
                <img 
                  src="/img1.jpeg" 
                  alt="Featured Artwork 1 - Abstract landscape painting with vibrant colors" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>

              {/* Tall piece */}
              <div className="gallery-item size-tall" data-image-index="1" role="gridcell">
                <img 
                  src="/img2.jpeg" 
                  alt="Featured Artwork 2 - Nature scene with flowing water" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>

              {/* Small square */}
              <div className="gallery-item size-small" data-image-index="2" role="gridcell">
                <img 
                  src="/img3.jpeg" 
                  alt="Featured Artwork 3 - Colorful floral composition" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>

              {/* Small square */}
              <div className="gallery-item size-small" data-image-index="3" role="gridcell">
                <img 
                  src="/img4.jpeg" 
                  alt="Featured Artwork 4 - Panoramic mountain vista" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>

              {/* Wide panoramic */}
              <div className="gallery-item size-wide" data-image-index="4" role="gridcell">
                <img 
                  src="/img5.jpeg" 
                  alt="Featured Artwork 5 - Vertical forest scene" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>

              {/* Medium rectangle */}
              <div className="gallery-item size-medium" data-image-index="5" role="gridcell">
                <img 
                  src="/img6.jpeg" 
                  alt="Featured Artwork 6 - Sunset over ocean waves" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>

              {/* Small square */}
              <div className="gallery-item size-small" data-image-index="6" role="gridcell">
                <img 
                  src="/img7.jpeg" 
                  alt="Featured Artwork 7 - Serene lake reflection" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>

              {/* Small square */}
              <div className="gallery-item size-small" data-image-index="7" role="gridcell">
                <img 
                  src="/img8.jpeg" 
                  alt="Featured Artwork 8 - Expansive desert landscape" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>

              {/* Medium rectangle */}
              <div className="gallery-item size-medium" data-image-index="8" role="gridcell">
                <img 
                  src="/img9.jpeg" 
                  alt="Featured Artwork 9 - Urban cityscape at twilight" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>

              {/* Small square */}
              <div className="gallery-item size-small" data-image-index="9" role="gridcell">
                <img 
                  src="/img10.jpeg" 
                  alt="Featured Artwork 10 - Dramatic storm clouds" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>

              {/* Small square */}
              <div className="gallery-item size-small" data-image-index="10" role="gridcell">
                <img 
                  src="/img11.jpeg" 
                  alt="Featured Artwork 11 - Towering redwood trees" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>

              {/* Small square */}
              <div className="gallery-item size-small" data-image-index="11" role="gridcell">
                <img 
                  src="/img12.jpeg" 
                  alt="Featured Artwork 12 - Delicate butterfly on flower" 
                  className="gallery-image"
                />
                <div className="gallery-overlay" aria-hidden="true">
                  <span className="view-icon" role="img" aria-label="View in modal">🔍</span>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <button
                onClick={onGalleryClick}
                className="bg-brown text-white px-8 py-3 rounded-md font-medium hover:bg-brown-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2"
              >
                View All Artwork
              </button>
            </div>
          </div>
        </section>

        {/* About Preview Section */}
        <section className="bg-cream py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Artist Image */}
              <div className="order-2 lg:order-1">
                <div className="relative">
                  <div className="w-full max-w-md mx-auto h-96 bg-warm-gray rounded-lg shadow-lg overflow-hidden">
                    {/* Placeholder for artist photo */}
                    <div className="w-full h-full bg-gradient-to-br from-sage-green-light to-sage-green flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        <p className="text-sm opacity-80">Artist Portrait</p>
                      </div>
                    </div>
                  </div>
                  {/* Decorative frame */}
                  <div className="absolute -inset-2 bg-brown/10 rounded-lg -z-10"></div>
                </div>
              </div>

              {/* About Content */}
              <div className="order-1 lg:order-2 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-serif text-brown mb-6">
                  About the Artist
                </h2>
                <div className="space-y-4 text-text-dark leading-relaxed mb-8">
                  <p>
                    Passionate about capturing the beauty of nature through vibrant colors 
                    and expressive brushstrokes, each painting tells a unique story of 
                    inspiration drawn from the natural world.
                  </p>
                  <p>
                    With over a decade of artistic experience, the focus remains on creating 
                    pieces that not only capture a moment in time but also evoke the feelings 
                    and sensations of being present in that space.
                  </p>
                </div>
                <button
                  onClick={onAboutClick}
                  className="bg-sage-green text-white px-8 py-3 rounded-md font-medium hover:bg-sage-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter/Contact Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="bg-sage-green-light/20 rounded-lg p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-serif text-brown mb-4">
                Stay Connected
              </h2>
              <p className="text-text-light text-lg mb-8 max-w-2xl mx-auto">
                Be the first to know about new paintings, exhibitions, and special offers. 
                Join our community of art lovers and collectors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-md border border-warm-gray focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent"
                />
                <button className="bg-brown text-white px-6 py-3 rounded-md font-medium hover:bg-brown-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Modal Viewer */}
        <div 
          className="modal-viewer" 
          id="artworkModal" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className="modal-background" aria-hidden="true"></div>
          <div className="modal-content">
            <button className="modal-close" aria-label="Close artwork viewer">&times;</button>
            <img 
              src="" 
              alt="" 
              className="modal-image" 
              id="modalImage" 
              role="img"
            />
            <button 
              className="nav-arrow nav-prev" 
              id="prevBtn" 
              aria-label="View previous artwork"
            >
              &#8249;
            </button>
            <button 
              className="nav-arrow nav-next" 
              id="nextBtn" 
              aria-label="View next artwork"
            >
              &#8250;
            </button>
          </div>
          {/* Screen reader announcements */}
          <div id="modal-title" className="sr-only">Artwork Viewer</div>
          <div id="modal-description" className="sr-only">
            Use arrow keys to navigate between artworks, or press Escape to close
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Homepage;