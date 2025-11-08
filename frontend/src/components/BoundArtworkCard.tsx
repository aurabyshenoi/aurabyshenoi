/**
 * BoundArtworkCard Component
 * Wrapper around React Bits bound card component customized for artwork display
 */

import React, { useRef, useEffect } from 'react';
import { BoundCard } from './ReactBits';
import { Painting } from '../types/painting';
import { CardVariant } from '../types/react-bits';
import { 
  boundCardPresets, 
  hoverEffectPresets, 
  animationStates,
  reactBitsComponentTheme 
} from '../config/reactBitsTheme';

interface BoundArtworkCardProps {
  artwork: Painting;
  variant: CardVariant;
  onClick: (artwork: Painting, index: number) => void;
  animationDelay?: number;
  index: number;
  className?: string;
  isVisible?: boolean;
  onRegisterElement?: (element: HTMLElement | null, index: number) => void;
  totalArtworks?: number;
}

const BoundArtworkCard: React.FC<BoundArtworkCardProps> = ({
  artwork,
  variant,
  onClick,
  animationDelay = 0,
  index,
  className = '',
  isVisible = false,
  onRegisterElement,
  totalArtworks
}) => {

  const cardRef = useRef<HTMLDivElement>(null);

  // Register element with animation system
  useEffect(() => {
    if (onRegisterElement && cardRef.current) {
      onRegisterElement(cardRef.current, index);
    }
  }, [onRegisterElement, index]);

  // Get animation class based on column position
  const getAnimationClass = (index: number): string => {
    const columnIndex = index % 3; // Assuming 3 columns for desktop
    
    if (columnIndex === 0) return 'animate-slide-in-left';
    if (columnIndex === 2) return 'animate-slide-in-right';
    return 'animate-fade-in-up';
  };

  // Get hover effect configuration based on variant
  const getHoverEffect = (variant: CardVariant) => {
    return hoverEffectPresets[variant] || hoverEffectPresets.gallery;
  };

  // Get bound configuration for artwork cards
  const getBoundConfig = () => {
    return boundCardPresets.gallery; // Use gallery preset for more refined movement
  };

  // Get responsive height classes for different screen sizes
  const getHeightClasses = (variant: CardVariant): string => {
    // Use CSS custom properties for responsive heights
    // Heights are managed by CSS media queries in index.css
    return `artwork-bound-card-${variant}`;
  };

  const cardClasses = `
    artwork-bound-card
    variant-${variant}
    w-full
    ${getHeightClasses(variant)}
    ${isVisible ? 'masonry-card-visible' : 'masonry-card-hidden'}
    ${isVisible ? getAnimationClass(index) : ''}
    ${className}
  `.trim();

  const hoverEffect = getHoverEffect(variant);
  const boundConfig = getBoundConfig();

  const cardStyle = {
    animationDelay: isVisible ? `${animationDelay}ms` : '0ms',
    animationDuration: reactBitsComponentTheme.animations.entrance.duration,
    animationTimingFunction: reactBitsComponentTheme.animations.entrance.easing,
    animationFillMode: 'forwards' as const,
    '--hover-scale': hoverEffect.scale,
    '--hover-shadow-intensity': hoverEffect.shadowIntensity,
    '--hover-transition': hoverEffect.transition,
    '--hover-translate-y': `${hoverEffect.translateY}px`,
    // Apply theme colors as CSS custom properties
    '--card-bg': reactBitsComponentTheme.artwork.card.backgroundColor,
    '--card-border-radius': reactBitsComponentTheme.artwork.card.borderRadius,
    '--card-shadow': reactBitsComponentTheme.artwork.card.boxShadow,
    '--text-primary': reactBitsComponentTheme.artwork.title.color,
    '--text-secondary': reactBitsComponentTheme.artwork.metadata.color
  } as React.CSSProperties;

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(artwork, index);
    }
  };

  return (
    <div ref={cardRef}>
      <BoundCard
        className={cardClasses}
        style={cardStyle}
        onClick={() => onClick(artwork, index)}
        onKeyDown={handleKeyDown}
        variant="elevated"
        interactive
        bound={boundConfig}
        hover={{
          scale: hoverEffect.scale,
          elevation: hoverEffect.elevation,
          transition: hoverEffect.transition
        }}
        // Accessibility attributes
        role="button"
        tabIndex={0}
        data-card-index={index}
        aria-label={`View artwork: ${artwork.title}${artwork.medium ? ` - ${artwork.medium}` : ''}${artwork.price ? ` - ${artwork.price.toLocaleString()}` : ''}`}
        aria-describedby={`artwork-description-${index}`}
        aria-posinset={index + 1}
        aria-setsize={totalArtworks || 1}
      >
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {/* Artwork Image Only - No Overlays */}
        <img
          src={artwork.images.thumbnail}
          alt={artwork.title}
          className="artwork-image w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-painting.svg';
          }}
        />
        
        {/* Screen reader description only */}
        <div 
          id={`artwork-description-${index}`}
          className="sr-only"
        >
          {artwork.description || `Artwork titled ${artwork.title}`}
          {artwork.medium && `, created using ${artwork.medium}`}
          {artwork.dimensions && `, dimensions ${artwork.dimensions.width} by ${artwork.dimensions.height} ${artwork.dimensions.unit}`}
          {artwork.price && `, priced at ${artwork.price.toLocaleString()}`}
          {!artwork.isAvailable && `, currently sold`}
          . Press Enter or Space to view details.
        </div>
      </div>
      </BoundCard>
    </div>
  );
};

export default BoundArtworkCard;
