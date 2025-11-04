import React from 'react';
import { Painting } from '../types/painting';
import PaintingCard from './PaintingCard';

interface PaintingGridProps {
  paintings: Painting[];
  onPaintingClick: (painting: Painting) => void;
  loading?: boolean;
}

const PaintingGrid: React.FC<PaintingGridProps> = ({ 
  paintings, 
  onPaintingClick, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-warm-gray rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-warm-gray rounded w-3/4"></div>
              <div className="h-3 bg-warm-gray rounded w-1/2"></div>
              <div className="h-3 bg-warm-gray rounded w-1/3"></div>
              <div className="h-4 bg-warm-gray rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (paintings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-light text-lg mb-4">
          No paintings found
        </div>
        <p className="text-text-light text-sm">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
      {paintings.map((painting) => (
        <PaintingCard
          key={painting._id}
          painting={painting}
          onClick={onPaintingClick}
        />
      ))}
    </div>
  );
};

export default PaintingGrid;