/**
 * MasonryGallery Component
 * Responsive masonry layout container for React Bits bound cards
 */

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { Painting } from '../types/painting';
import { CardVariant } from '../types/react-bits';
import BoundArtworkCard from './BoundArtworkCard';
import { 
  calculateResponsiveMasonryLayout, 
  getMasonryLayoutStats 
} from '../utils/masonryLayout';
import useMasonryAnimations from '../hooks/useMasonryAnimations';
import useResponsiveMasonryConfig from '../hooks/useResponsiveMasonryConfig';



interface MasonryGalleryProps {
  artworks: Painting[];
  onCardClick: (artwork: Painting, index: number) => void;
  className?: string;
  // Optional overrides for responsive configuration
  mobileConfig?: {
    columns?: number;
    gap?: number;
    cardVariants?: CardVariant[];
  };
  tabletConfig?: {
    columns?: number;
    gap?: number;
    cardVariants?: CardVariant[];
  };
  desktopConfig?: {
    columns?: number;
    gap?: number;
    cardVariants?: CardVariant[];
  };
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({
  artworks,
  onCardClick,
  className = '',
  mobileConfig,
  tabletConfig,
  desktopConfig
}) => {
  const galleryRef = useRef<HTMLElement>(null);
  const [focusedCardIndex, setFocusedCardIndex] = React.useState<number>(-1);
  // Use responsive configuration hook
  const { 
    config, 
    currentBreakpoint, 
    windowWidth,
    isMobile,
    isTablet,
    isDesktop 
  } = useResponsiveMasonryConfig({
    mobileConfig,
    tabletConfig,
    desktopConfig,
    resizeDebounce: 150,
    respectReducedMotion: true
  });
  
  // Initialize masonry animations hook with responsive delay
  const { registerCard, getAnimationDelay, isCardVisible } = useMasonryAnimations(
    artworks.length,
    {
      staggerDelay: config.animationDelay,
      threshold: 0.1,
      rootMargin: '50px'
    }
  );

  // Calculate masonry layout with responsive configuration
  const masonryColumns = useMemo(() => {
    const layoutOptions = {
      cardVariants: config.cardVariants,
      gap: config.gap,
      balanceThreshold: 100,
      variantDistribution: config.variantDistribution
    };
    
    const columns = calculateResponsiveMasonryLayout(artworks, windowWidth, layoutOptions);
    
    // Log layout stats for debugging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      const stats = getMasonryLayoutStats(columns);
      console.log('Masonry Layout Stats:', {
        ...stats,
        breakpoint: currentBreakpoint,
        config: config
      });
    }
    
    return columns;
  }, [artworks, windowWidth, config, currentBreakpoint]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const totalCards = artworks.length;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        setFocusedCardIndex(prev => {
          const next = prev < totalCards - 1 ? prev + 1 : 0;
          // Focus the next card
          setTimeout(() => {
            const nextCard = galleryRef.current?.querySelector(`[data-card-index="${next}"]`) as HTMLElement;
            nextCard?.focus();
          }, 0);
          return next;
        });
        break;
        
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        setFocusedCardIndex(prev => {
          const next = prev > 0 ? prev - 1 : totalCards - 1;
          // Focus the previous card
          setTimeout(() => {
            const nextCard = galleryRef.current?.querySelector(`[data-card-index="${next}"]`) as HTMLElement;
            nextCard?.focus();
          }, 0);
          return next;
        });
        break;
        
      case 'Home':
        event.preventDefault();
        setFocusedCardIndex(0);
        setTimeout(() => {
          const firstCard = galleryRef.current?.querySelector(`[data-card-index="0"]`) as HTMLElement;
          firstCard?.focus();
        }, 0);
        break;
        
      case 'End':
        event.preventDefault();
        setFocusedCardIndex(totalCards - 1);
        setTimeout(() => {
          const lastCard = galleryRef.current?.querySelector(`[data-card-index="${totalCards - 1}"]`) as HTMLElement;
          lastCard?.focus();
        }, 0);
        break;
    }
  }, [artworks.length]);

  // Generate responsive container classes
  const containerClasses = `
    masonry-gallery-container
    ${isMobile ? 'flex-col' : 'flex'}
    gap-${config.gap === 20 ? '5' : config.gap === 15 ? '4' : '3'}
    w-full
    max-w-6xl
    mx-auto
    px-4
    py-8
    ${className}
  `.trim();

  return (
    <section 
      ref={galleryRef}
      className={containerClasses}
      role="region"
      aria-label="Featured artwork gallery"
      aria-describedby="gallery-description"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Screen reader description */}
      <div id="gallery-description" className="sr-only">
        A masonry gallery displaying {artworks.length} featured artworks. 
        Use arrow keys to navigate between artworks and press Enter or Space to view details.
        Currently showing {config.columns} columns on {currentBreakpoint} layout.
        Press Home to go to first artwork, End to go to last artwork.
      </div>
      
      {masonryColumns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className={`masonry-column flex-1 flex flex-col gap-${config.gap === 20 ? '5' : config.gap === 15 ? '4' : '3'}`}
          role="group"
          aria-label={`Gallery column ${columnIndex + 1} of ${masonryColumns.length}`}
          style={{
            display: isMobile && columnIndex > 0 ? 'none' : 
                     isTablet && columnIndex > 1 ? 'none' :
                     isDesktop && columnIndex > 2 ? 'none' : 'flex'
          }}
        >
          {column.items.map((artwork, itemIndex) => {
            const globalIndex = masonryColumns
              .slice(0, columnIndex)
              .reduce((acc, col) => acc + col.items.length, 0) + itemIndex;
            
            return (
              <BoundArtworkCard
                key={artwork._id}
                artwork={artwork}
                variant={artwork.variant}
                onClick={onCardClick}
                animationDelay={getAnimationDelay(globalIndex)}
                index={globalIndex}
                isVisible={isCardVisible(globalIndex)}
                onRegisterElement={registerCard}
                totalArtworks={artworks.length}
              />
            );
          })}
        </div>
      ))}
    </section>
  );
};





export default MasonryGallery;