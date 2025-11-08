/**
 * Custom hook for managing responsive masonry gallery configuration
 * Handles window resize events, breakpoint changes, and dynamic configuration updates
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CardVariant } from '../types/react-bits';
import { defaultMasonryConfig } from '../config/reactBitsTheme';

// Breakpoint definitions
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  large: 1200
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export interface ResponsiveMasonryConfig {
  columns: number;
  gap: number;
  cardVariants: CardVariant[];
  variantDistribution: {
    small: number;
    medium: number;
    large: number;
  };
  animationDelay: number;
  cardHeights: {
    small: number;
    medium: number;
    large: number;
  };
}

export interface UseResponsiveMasonryConfigOptions {
  // Custom breakpoint overrides
  customBreakpoints?: Partial<typeof BREAKPOINTS>;
  
  // Custom configuration per breakpoint
  mobileConfig?: Partial<ResponsiveMasonryConfig>;
  tabletConfig?: Partial<ResponsiveMasonryConfig>;
  desktopConfig?: Partial<ResponsiveMasonryConfig>;
  
  // Debounce delay for resize events (ms)
  resizeDebounce?: number;
  
  // Whether to use reduced motion preferences
  respectReducedMotion?: boolean;
}

export interface UseResponsiveMasonryConfigReturn {
  // Current configuration
  config: ResponsiveMasonryConfig;
  
  // Current breakpoint information
  currentBreakpoint: BreakpointKey;
  windowWidth: number;
  windowHeight: number;
  
  // Utility functions
  isBreakpoint: (breakpoint: BreakpointKey) => boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Configuration getters
  getColumnCount: () => number;
  getGapSize: () => number;
  getCardVariants: () => CardVariant[];
  getAnimationDelay: () => number;
}

const useResponsiveMasonryConfig = (
  options: UseResponsiveMasonryConfigOptions = {}
): UseResponsiveMasonryConfigReturn => {
  const {
    customBreakpoints = {},
    mobileConfig = {},
    tabletConfig = {},
    desktopConfig = {},
    resizeDebounce = 150,
    respectReducedMotion = true
  } = options;

  // Merge custom breakpoints with defaults
  const breakpoints = useMemo(() => ({
    ...BREAKPOINTS,
    ...customBreakpoints
  }), [customBreakpoints]);

  // Window dimensions state
  const [windowWidth, setWindowWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  
  const [windowHeight, setWindowHeight] = useState(() => 
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  // Determine current breakpoint
  const currentBreakpoint = useMemo((): BreakpointKey => {
    if (windowWidth < breakpoints.tablet) return 'mobile';
    if (windowWidth < breakpoints.desktop) return 'tablet';
    return 'desktop';
  }, [windowWidth, breakpoints]);

  // Breakpoint utility functions
  const isBreakpoint = useCallback((breakpoint: BreakpointKey): boolean => {
    return currentBreakpoint === breakpoint;
  }, [currentBreakpoint]);

  const isMobile = useMemo(() => currentBreakpoint === 'mobile', [currentBreakpoint]);
  const isTablet = useMemo(() => currentBreakpoint === 'tablet', [currentBreakpoint]);
  const isDesktop = useMemo(() => currentBreakpoint === 'desktop', [currentBreakpoint]);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (!respectReducedMotion || typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [respectReducedMotion]);

  // Generate responsive configuration
  const config = useMemo((): ResponsiveMasonryConfig => {
    const baseConfig = defaultMasonryConfig;
    
    // Base configuration by breakpoint
    let responsiveConfig: Partial<ResponsiveMasonryConfig>;
    
    switch (currentBreakpoint) {
      case 'mobile':
        responsiveConfig = {
          columns: 1,
          gap: 15,
          cardVariants: ['small', 'medium'], // Fewer large cards on mobile
          variantDistribution: {
            small: 60,
            medium: 40,
            large: 0
          },
          animationDelay: prefersReducedMotion ? 0 : 80,
          cardHeights: {
            small: 200,
            medium: 250,
            large: 300
          },
          ...mobileConfig
        };
        break;
        
      case 'tablet':
        responsiveConfig = {
          columns: 2,
          gap: 18,
          cardVariants: ['small', 'medium', 'large'],
          variantDistribution: {
            small: 50,
            medium: 35,
            large: 15
          },
          animationDelay: prefersReducedMotion ? 0 : 90,
          cardHeights: {
            small: 220,
            medium: 280,
            large: 350
          },
          ...tabletConfig
        };
        break;
        
      case 'desktop':
      default:
        responsiveConfig = {
          columns: windowWidth > breakpoints.large ? 4 : 3,
          gap: 20,
          cardVariants: ['small', 'medium', 'large'],
          variantDistribution: baseConfig.layout.variantDistribution,
          animationDelay: prefersReducedMotion ? 0 : baseConfig.animations.staggerDelay,
          cardHeights: {
            small: 250,
            medium: 320,
            large: 400
          },
          ...desktopConfig
        };
        break;
    }
    
    return {
      columns: responsiveConfig.columns || 3,
      gap: responsiveConfig.gap || 20,
      cardVariants: responsiveConfig.cardVariants || ['small', 'medium', 'large'],
      variantDistribution: responsiveConfig.variantDistribution || baseConfig.layout.variantDistribution,
      animationDelay: responsiveConfig.animationDelay || baseConfig.animations.staggerDelay,
      cardHeights: responsiveConfig.cardHeights || {
        small: 250,
        medium: 320,
        large: 400
      }
    };
  }, [
    currentBreakpoint, 
    windowWidth, 
    breakpoints.large, 
    prefersReducedMotion,
    mobileConfig,
    tabletConfig,
    desktopConfig
  ]);

  // Configuration getter functions
  const getColumnCount = useCallback(() => config.columns, [config.columns]);
  const getGapSize = useCallback(() => config.gap, [config.gap]);
  const getCardVariants = useCallback(() => config.cardVariants, [config.cardVariants]);
  const getAnimationDelay = useCallback(() => config.animationDelay, [config.animationDelay]);

  // Debounced resize handler
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
        setWindowHeight(window.innerHeight);
      }, resizeDebounce);
    };

    // Initial setup
    const updateDimensions = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    updateDimensions();
    window.addEventListener('resize', handleResize);
    
    // Listen for orientation changes on mobile
    window.addEventListener('orientationchange', () => {
      // Delay to allow for orientation change to complete
      setTimeout(updateDimensions, 100);
    });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [resizeDebounce]);

  // Listen for reduced motion preference changes
  useEffect(() => {
    if (!respectReducedMotion || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      // Force re-render by updating window width (triggers config recalculation)
      setWindowWidth(window.innerWidth);
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [respectReducedMotion]);

  return {
    config,
    currentBreakpoint,
    windowWidth,
    windowHeight,
    isBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    getColumnCount,
    getGapSize,
    getCardVariants,
    getAnimationDelay
  };
};

export default useResponsiveMasonryConfig;