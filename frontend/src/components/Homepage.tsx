import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './index';
import { usePaintings } from '../hooks/usePaintings';
import { Painting } from '../types/painting';
import { apiFetch, subscribeToNewsletter } from '../utils/api';
import { GalleryManager, defaultGalleryConfig } from '../utils/galleryManager';
import { initializeGalleryTesting } from '../utils/galleryTesting';
import MasonryGallery from './MasonryGallery';

interface HomepageProps {
  onGalleryClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
}

const Homepage: React.FC<HomepageProps> = ({ onGalleryClick, onAboutClick, onContactClick }) => {
  const { allPaintings, loading: paintingsLoading } = usePaintings();
  const [featuredPaintings, setFeaturedPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const galleryManagerRef = useRef<GalleryManager | null>(null);
  
  // Modal state for artwork viewer
  const [selectedArtwork, setSelectedArtwork] = useState<Painting | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Newsletter form state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Handle artwork card click to open modal
  const handleArtworkClick = (artwork: Painting, index: number) => {
    setSelectedArtwork(artwork);
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedArtwork(null);
  };

  // Handle modal navigation
  const handleModalNavigation = (direction: 'prev' | 'next') => {
    if (!featuredPaintings.length) return;
    
    let newIndex = selectedIndex;
    if (direction === 'prev') {
      newIndex = selectedIndex > 0 ? selectedIndex - 1 : featuredPaintings.length - 1;
    } else {
      newIndex = selectedIndex < featuredPaintings.length - 1 ? selectedIndex + 1 : 0;
    }
    
    setSelectedIndex(newIndex);
    setSelectedArtwork(featuredPaintings[newIndex]);
  };

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email.trim());
  };

  // Handle newsletter email change
  const handleNewsletterEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewsletterEmail(e.target.value);
    // Clear error when user starts typing
    if (newsletterError) {
      setNewsletterError(null);
    }
    // Clear success message when user starts typing again
    if (newsletterSuccess) {
      setNewsletterSuccess(false);
    }
  };

  // Handle newsletter form submission
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setNewsletterError(null);
    setNewsletterSuccess(false);

    // Validate email
    const trimmedEmail = newsletterEmail.trim();
    if (!trimmedEmail) {
      setNewsletterError('Email address is required');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setNewsletterError('Please enter a valid email address');
      return;
    }

    // Submit to API
    setNewsletterLoading(true);
    try {
      await subscribeToNewsletter(trimmedEmail);
      setNewsletterSuccess(true);
      setNewsletterEmail(''); // Reset form
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to subscribe. Please try again later.';
      setNewsletterError(errorMessage);
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Fetch featured paintings with fallback to local data
  useEffect(() => {
    const fetchFeaturedPaintings = async () => {
      try {
        const response = await apiFetch('/api/paintings?featured=true&limit=6');
        if (response.ok) {
          const data = await response.json();
          setFeaturedPaintings(data.data?.paintings || []);
        } else {
          // Fallback to local paintings data, showing all 12 images
          if (allPaintings.length > 0) {
            // Show all paintings (1-12)
            const featuredSelection = allPaintings.slice(0, 12);
            setFeaturedPaintings(featuredSelection);
          }
        }
      } catch (error) {
        console.error('Error fetching featured paintings:', error);
        // Fallback to local paintings data on error, showing all 12 images
        if (allPaintings.length > 0) {
          // Show all paintings (1-12)
          const featuredSelection = allPaintings.slice(0, 12);
          setFeaturedPaintings(featuredSelection);
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when allPaintings is loaded or immediately if already loaded
    if (!paintingsLoading) {
      fetchFeaturedPaintings();
    } else {
      setLoading(paintingsLoading);
    }
  }, [allPaintings, paintingsLoading]);

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

  // Handle keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (event.key) {
        case 'Escape':
          handleModalClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleModalNavigation('prev');
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleModalNavigation('next');
          break;
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, selectedIndex, featuredPaintings]);

  return (
    <Layout 
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
                    {/* Featured artwork image with optimized loading */}
                    <img 
                      src="/image.png" 
                      alt="Featured Artwork" 
                      className="w-full h-auto object-contain"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        console.error('Failed to load hero image');
                      }}
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

            {/* Masonry Gallery with React Bits Bound Cards */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-text-light">Loading featured artwork...</div>
              </div>
            ) : featuredPaintings.length > 0 ? (
              <div className="mb-12">
                <MasonryGallery
                  artworks={featuredPaintings} // Show all featured pieces (12 total)
                  onCardClick={handleArtworkClick}
                />
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-text-light">No featured artwork available at the moment.</p>
              </div>
            )}

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
                  <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl aspect-[4/3] bg-warm-gray rounded-lg shadow-lg overflow-hidden mx-auto lg:mx-0">
                    <img 
                      src="/artist-photo.jpeg" 
                      alt="Artist portrait in traditional attire with vibrant orange decorations and lush greenery in the background"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    {/* Fallback placeholder (hidden by default) */}
                    <div className="w-full h-full bg-gradient-to-br from-sage-green-light to-sage-green flex items-center justify-center" style={{ display: 'none' }}>
                      <div className="text-center text-white">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        <p className="text-xs sm:text-sm opacity-80">Artist Portrait</p>
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
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address for newsletter
                  </label>
                  <input
                    type="email"
                    id="newsletter-email"
                    value={newsletterEmail}
                    onChange={handleNewsletterEmailChange}
                    placeholder="Enter your email"
                    disabled={newsletterLoading}
                    aria-describedby="newsletter-error newsletter-success"
                    aria-invalid={!!newsletterError}
                    aria-required="true"
                    className="flex-1 px-4 py-3 rounded-md border border-warm-gray focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button 
                    type="submit"
                    disabled={newsletterLoading || !newsletterEmail.trim() || !isValidEmail(newsletterEmail)}
                    className="bg-brown text-white px-6 py-3 rounded-md font-medium hover:bg-brown-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </div>
                {newsletterError && (
                  <div 
                    id="newsletter-error" 
                    role="alert" 
                    aria-live="polite"
                    className="mt-4 text-red-600 text-sm"
                  >
                    {newsletterError}
                  </div>
                )}
                {newsletterSuccess && (
                  <div 
                    id="newsletter-success" 
                    role="status" 
                    aria-live="polite"
                    className="mt-4 text-green-600 text-sm"
                  >
                    Successfully subscribed to newsletter!
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>

        {/* Modal Viewer */}
        {isModalOpen && selectedArtwork && (
          <div 
            className="modal-viewer active" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <div 
              className="modal-background" 
              aria-hidden="true"
              onClick={handleModalClose}
            ></div>
            <div className="modal-content">
              <button 
                className="modal-close" 
                aria-label="Close artwork viewer"
                onClick={handleModalClose}
              >
                &times;
              </button>
              <img 
                src={selectedArtwork.images.fullSize?.[0] || selectedArtwork.images.thumbnail} 
                alt={selectedArtwork.title}
                className="modal-image"
                role="img"
              />
              <button 
                className="nav-arrow nav-prev" 
                aria-label="View previous artwork"
                onClick={() => handleModalNavigation('prev')}
              >
                &#8249;
              </button>
              <button 
                className="nav-arrow nav-next" 
                aria-label="View next artwork"
                onClick={() => handleModalNavigation('next')}
              >
                &#8250;
              </button>
            </div>
            {/* Screen reader announcements */}
            <div id="modal-title" className="sr-only">
              Artwork Viewer - {selectedArtwork.title}
            </div>
            <div id="modal-description" className="sr-only">
              Use arrow keys to navigate between artworks, or press Escape to close
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Homepage;