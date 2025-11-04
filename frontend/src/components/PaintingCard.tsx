import React from 'react';
import { Painting } from '../types/painting';
import AddToCartButton from './AddToCartButton';
import { OptimizedImage, useResponsiveImageUrls } from './OptimizedImage';

interface PaintingCardProps {
  painting: Painting;
  onClick: (painting: Painting) => void;
}

const PaintingCard: React.FC<PaintingCardProps> = ({ painting, onClick }) => {
  const imageUrls = useResponsiveImageUrls(painting.images.thumbnail);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDimensions = (dimensions: Painting['dimensions']) => {
    return `${dimensions.width}" × ${dimensions.height}" ${dimensions.unit}`;
  };

  return (
    <div 
      className="group cursor-pointer bg-cream rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      onClick={() => onClick(painting)}
    >
      <div className="aspect-square overflow-hidden bg-warm-gray">
        <OptimizedImage
          src={imageUrls.medium}
          lowQualitySrc={imageUrls.thumbnail}
          alt={painting.title}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          placeholderClassName="w-full h-full"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-4 space-y-2">
        <h3 className="font-serif text-lg text-text-dark group-hover:text-brown transition-colors duration-200 truncate">
          {painting.title}
        </h3>
        
        <p className="text-sm text-text-light">
          {painting.medium}
        </p>
        
        <p className="text-xs text-text-light">
          {formatDimensions(painting.dimensions)}
        </p>
        
        <div className="flex justify-between items-center pt-2">
          <span className="font-semibold text-brown text-lg">
            {formatPrice(painting.price)}
          </span>
          
          {!painting.isAvailable && (
            <span className="text-xs bg-warm-gray text-text-light px-2 py-1 rounded">
              Sold
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <div className="pt-3">
          <AddToCartButton 
            painting={painting} 
            variant="secondary" 
            size="sm"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default PaintingCard;