import React, { useState, useEffect, useMemo } from 'react';
import { Layout, FilterBar, PaintingGrid, PaintingModal } from './index';
import { usePaintings } from '../hooks/usePaintings';
import { Painting } from '../types/painting';
import { preloadCriticalImages, preloadNextBatch, preloadOnScroll } from '../utils/imagePreloader';
import { assignIndices } from '../utils/artworkIndexing';

interface GalleryProps {
  onAdminAccess?: () => void;
  onAboutClick?: () => void;
  onHomeClick?: () => void;
  onContactClick?: () => void;
  onArtworkInquiry?: (painting: Painting) => void;
}

const Gallery: React.FC<GalleryProps> = ({ onAdminAccess, onAboutClick, onHomeClick, onContactClick, onArtworkInquiry }) => {
  const {
    paintings,
    loading,
    error,
    filters,
    setFilters,
    categories,
    priceRange
  } = usePaintings();

  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Assign indices to paintings whenever the paintings list changes
  const indexedPaintings = useMemo(() => {
    return assignIndices(paintings);
  }, [paintings]);

  // Preload critical images when paintings load
  useEffect(() => {
    if (indexedPaintings.length > 0 && !loading) {
      preloadCriticalImages(indexedPaintings, 6);
      
      // Preload next batch after a delay
      setTimeout(() => {
        preloadNextBatch(indexedPaintings, 6, 6);
      }, 2000);
    }
  }, [indexedPaintings, loading]);

  // Preload images based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate approximate visible painting index based on scroll position
      const scrollPercentage = scrollPosition / (documentHeight - windowHeight);
      const visibleIndex = Math.floor(scrollPercentage * indexedPaintings.length);
      
      preloadOnScroll(indexedPaintings, visibleIndex);
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
  }, [indexedPaintings]);

  const handlePaintingClick = (painting: Painting) => {
    setSelectedPainting(painting);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPainting(null);
  };



  if (error) {
    return (
      <Layout 
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
          {/* Results Summary */}
          <div className="mb-6">
            {!loading && (
              <p className="text-text-light">
                {indexedPaintings.length === 0 
                  ? 'No paintings found'
                  : `Showing ${indexedPaintings.length} painting${indexedPaintings.length !== 1 ? 's' : ''}`
                }
              </p>
            )}
          </div>

          {/* Painting Grid */}
          <PaintingGrid
            paintings={indexedPaintings}
            onPaintingClick={handlePaintingClick}
            onInquire={onArtworkInquiry}
            loading={loading}
          />
        </div>

        {/* Painting Modal */}
        <PaintingModal
          painting={selectedPainting}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onInquire={onArtworkInquiry}
        />
      </div>
    </Layout>
  );
};

export default Gallery;