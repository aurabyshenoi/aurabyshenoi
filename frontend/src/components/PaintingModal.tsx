import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Painting } from '../types/painting';
import { OptimizedImage, useResponsiveImageUrls } from './OptimizedImage';

interface PaintingModalProps {
  painting: Painting | null;
  isOpen: boolean;
  onClose: () => void;
  onInquire?: (painting: Painting) => void;
}

const PaintingModal: React.FC<PaintingModalProps> = ({ 
  painting, 
  isOpen, 
  onClose,
  onInquire
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when painting changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [painting]);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !painting) {
    return null;
  }

  const formatDimensions = (dimensions: Painting['dimensions']) => {
    return `${dimensions.width}" × ${dimensions.height}" ${dimensions.unit}`;
  };

  const allImages = [painting.images.thumbnail, ...painting.images.fullSize];
  const currentImage = allImages[currentImageIndex];
  const imageUrls = useResponsiveImageUrls(currentImage);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-cream rounded-lg shadow-2xl max-w-6xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-cream bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brown"
        >
          <X className="w-6 h-6 text-text-dark" />
        </button>

        <div className="flex flex-col lg:flex-row max-h-[90vh]">
          {/* Image Section */}
          <div className="lg:w-2/3 relative bg-warm-gray">
            <div className="aspect-square lg:aspect-auto lg:h-full flex items-center justify-center">
              <OptimizedImage
                src={imageUrls.xlarge}
                lowQualitySrc={imageUrls.medium}
                alt={painting.title}
                className="max-w-full max-h-full"
                placeholderClassName="max-w-full max-h-full"
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>

            {/* Image Navigation */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-cream bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brown"
                >
                  <ChevronLeft className="w-6 h-6 text-text-dark" />
                </button>
                
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-cream bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brown"
                >
                  <ChevronRight className="w-6 h-6 text-text-dark" />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {allImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-brown' 
                          : 'bg-cream bg-opacity-60 hover:bg-opacity-80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Details Section */}
          <div className="lg:w-1/3 p-6 lg:p-8 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {painting.index && (
                    <div 
                      className="bg-sage-green text-white px-3 py-1 rounded-md font-medium text-sm shadow-md"
                      aria-label={`Artwork number ${painting.index}`}
                      role="status"
                    >
                      #{painting.index}
                    </div>
                  )}
                  <h2 className="font-serif text-2xl lg:text-3xl text-text-dark">
                    {painting.title}
                  </h2>
                </div>
                <p className="text-text-light text-lg">
                  {painting.medium}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-text-dark mb-1">Category</h3>
                  <p className="text-text-light capitalize">{painting.category}</p>
                </div>
              </div>

              <div className="border-t border-warm-gray pt-6">
                <div className="flex items-center justify-end mb-4">
                  {!painting.isAvailable && (
                    <span className="bg-warm-gray text-text-light px-3 py-1 rounded text-sm">
                      Sold
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onInquire?.(painting)}
                  className="w-full bg-sage-green text-white px-6 py-3 rounded-md font-medium hover:bg-sage-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  disabled={!painting.isAvailable}
                  aria-label={`Inquire about ${painting.title}`}
                >
                  {painting.isAvailable ? 'Enquire' : 'Sold - Not Available'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaintingModal;