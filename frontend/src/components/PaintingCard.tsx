import React from 'react';
import { Painting } from '../types/painting';
import { OptimizedImage, useResponsiveImageUrls } from './OptimizedImage';

interface PaintingCardProps {
  painting: Painting;
  onClick: (painting: Painting) => void;
  onInquire?: (painting: Painting) => void;
}

const PaintingCard: React.FC<PaintingCardProps> = ({ painting, onClick, onInquire }) => {
  const imageUrls = useResponsiveImageUrls(painting.images.thumbnail);

  return (
    <div 
      className="group cursor-pointer bg-cream rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onClick={() => onClick(painting)}
    >
      <div className="aspect-square overflow-hidden bg-warm-gray relative">
        <OptimizedImage
          src={imageUrls.medium}
          lowQualitySrc={imageUrls.thumbnail}
          alt={painting.title}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          placeholderClassName="w-full h-full"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {painting.index && (
          <div 
            className="absolute top-3 right-3 bg-sage-green text-white px-3 py-1 rounded-md font-medium text-sm shadow-md"
            aria-label={`Artwork number ${painting.index}`}
            role="status"
          >
            #{painting.index}
          </div>
        )}
      </div>
      
      <div className="p-6 space-y-3">
        {/* Only show medium/type tag */}
        <p className="text-sm text-text-light text-center">
          {painting.medium}
        </p>
        
        {/* Centered, fit-to-text button */}
        <div className="flex justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInquire?.(painting);
            }}
            className="bg-sage-green text-white px-6 py-2 rounded-md font-medium hover:bg-sage-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream"
            aria-label={`Enquire about ${painting.title}`}
          >
            Enquire
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaintingCard;