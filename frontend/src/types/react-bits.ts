/**
 * TypeScript definitions for React Bits equivalent using Framer Motion
 * This provides the same interface as described in the design document
 */

import { HTMLMotionProps } from 'framer-motion';

export interface BoundConfig {
  strength: number; // 0-1, controls bound effect intensity
  damping: number;  // 0-1, controls bounce damping
  stiffness?: number; // Spring stiffness (optional)
}

export interface HoverConfig {
  scale: number;
  elevation: number;
  transition: string;
}

export interface BoundCardProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  variant?: 'flat' | 'elevated' | 'outlined';
  interactive?: boolean;
  bound?: BoundConfig;
  hover?: Partial<HoverConfig>;
  children: React.ReactNode;
  className?: string;
}

export interface MasonryGalleryConfig {
  layout: {
    columns: {
      desktop: number;
      tablet: number;
      mobile: number;
    };
    gap: number;
    cardVariants: ('small' | 'medium' | 'large')[];
    variantDistribution: {
      small: number;    // percentage
      medium: number;   // percentage
      large: number;    // percentage
    };
  };
  animations: {
    staggerDelay: number;
    hoverScale: number;
    boundStrength: number;
    boundDamping: number;
  };
  interactions: {
    lazyLoad: boolean;
    infiniteScroll: boolean;
    filterEnabled: boolean;
    sortEnabled: boolean;
  };
}

export type CardVariant = 'small' | 'medium' | 'large';
export type CardSize = 'flat' | 'elevated' | 'outlined';