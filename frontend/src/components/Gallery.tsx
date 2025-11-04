import React, { useState, useEffect } from 'react';
import { Layout, FilterBar, PaintingGrid, PaintingModal } from './index';
import { usePaintings } from '../hooks/usePaintings';
import { useCart } from '../contexts/CartContext';
import { Painting } from '../types/painting';
import { preloadCriticalImages, preloadNextBatch, preloadOnScroll } from '../utils/imagePreloader';

interface GalleryProps {
  onAdminAccess?: () => void;
  onAboutClick?: () => void;
  onHomeClick?: () => void;
  onContactClick?: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ onAdminAccess, onAboutClick, onHomeClick, onContactClick }) => {
  const {
    paintings,
    loading,
    error,
    filters,
    setFilters,
    categories,
    priceRange
  } = usePaintings();

  const { cart, toggleCart } = useCart();
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Preload critical images when paintings load
  useEffect(() => {
    if (paintings.length > 0 && !loading) {
      preloadCriticalImages(paintings, 6);
      
      // Preload next batch after a delay
      setTimeout(() => {
        preloadNextBatch(paintings, 6, 6);
      }, 2000);
    }
  }, [paintings, loading]);

  // Preload images based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate approximate visible painting index based on scroll position
      const scrollPercentage = scrollPosition / (documentHeight - windowHeight);
      const visibleIndex = Math.floor(scrollPercentage * paintings.length);
      
      preloadOnScroll(paintings, visibleIndex);
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [paintings]);

  const handlePaintingClick = (painting: Painting) => {
    setSelectedPainting(painting);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPainting(null);
  };



  const handleCartClick = () => {
    toggleCart();
  };

  if (error) {
    return (
      <Layout 
        cartItemCount={cart.totalItems} 
        onCartClick={handleCartClick}
        onHomeClick={onHomeClick}
        onAboutClick={onAboutClick}
        onContactClick={onContactClick}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif text-text-dark mb-4">Gallery</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      cartItemCount={cart.totalItems} 
      onCartClick={handleCartClick}
      onHomeClick={onHomeClick}
      onGalleryClick={() => {}}
      onAboutClick={onAboutClick}
      onContactClick={onContactClick}
    >
      <div className="min-h-screen bg-off-white">
        {/* Page Header */}
        <div className="bg-cream border-b border-warm-gray">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-serif text-brown mb-4">
                Art Gallery
              </h1>
              <p className="text-text-light text-lg max-w-2xl mx-auto">
                Discover unique paintings that capture the beauty of nature and emotion. 
                Each piece is carefully crafted with passion and attention to detail.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          categories={categories}
          priceRange={priceRange}
        />

        {/* Gallery Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Results Summary and Admin Access */}
          <div className="flex justify-between items-center mb-6">
            {!loading && (
              <p className="text-text-light">
                {paintings.length === 0 
                  ? 'No paintings found'
                  : `Showing ${paintings.length} painting${paintings.length !== 1 ? 's' : ''}`
                }
              </p>
            )}
            
            {onAdminAccess && (
              <button
                onClick={onAdminAccess}
                className="text-sm text-gray-500 hover:text-sage-green transition-colors duration-200"
              >
                Admin
              </button>
            )}
          </div>

          {/* Painting Grid */}
          <PaintingGrid
            paintings={paintings}
            onPaintingClick={handlePaintingClick}
            loading={loading}
          />
        </div>

        {/* Painting Modal */}
        <PaintingModal
          painting={selectedPainting}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </Layout>
  );
};

export default Gallery;