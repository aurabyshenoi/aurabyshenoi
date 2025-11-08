/**
 * Performance Configuration for React Bits Masonry Gallery
 * Centralized configuration for performance optimizations and browser compatibility
 */

export interface PerformanceConfig {
  // Animation settings
  animations: {
    enableStaggered: boolean;
    staggerDelay: number;
    enableHover: boolean;
    enableBoundEffects: boolean;
    reducedMotionFallback: boolean;
  };
  
  // Image optimization
  images: {
    enableLazyLoading: boolean;
    enableWebP: boolean;
    enableAVIF: boolean;
    compressionQuality: number;
    enableProgressiveLoading: boolean;
  };
  
  // Layout optimization
  layout: {
    enableVirtualization: boolean;
    enableIntersectionObserver: boolean;
    enableWillChange: boolean;
    enableGPUAcceleration: boolean;
  };
  
  // Bundle optimization
  bundle: {
    enableCodeSplitting: boolean;
    enableTreeShaking: boolean;
    enableMinification: boolean;
    enableGzipCompression: boolean;
  };
  
  // Browser compatibility
  compatibility: {
    enablePolyfills: boolean;
    enableFallbacks: boolean;
    supportedBrowsers: string[];
    minimumVersions: Record<string, number>;
  };
  
  // Performance monitoring
  monitoring: {
    enablePerformanceAPI: boolean;
    enableMemoryMonitoring: boolean;
    enableFPSMonitoring: boolean;
    enableUserTiming: boolean;
  };
}

// Default high-performance configuration
export const highPerformanceConfig: PerformanceConfig = {
  animations: {
    enableStaggered: true,
    staggerDelay: 100,
    enableHover: true,
    enableBoundEffects: true,
    reducedMotionFallback: true,
  },
  images: {
    enableLazyLoading: true,
    enableWebP: true,
    enableAVIF: true,
    compressionQuality: 85,
    enableProgressiveLoading: true,
  },
  layout: {
    enableVirtualization: false, // Not needed for small galleries
    enableIntersectionObserver: true,
    enableWillChange: true,
    enableGPUAcceleration: true,
  },
  bundle: {
    enableCodeSplitting: true,
    enableTreeShaking: true,
    enableMinification: true,
    enableGzipCompression: true,
  },
  compatibility: {
    enablePolyfills: true,
    enableFallbacks: true,
    supportedBrowsers: ['Chrome >= 60', 'Firefox >= 55', 'Safari >= 12', 'Edge >= 79'],
    minimumVersions: {
      Chrome: 60,
      Firefox: 55,
      Safari: 12,
      Edge: 79,
    },
  },
  monitoring: {
    enablePerformanceAPI: true,
    enableMemoryMonitoring: true,
    enableFPSMonitoring: true,
    enableUserTiming: true,
  },
};

// Medium-performance configuration for older devices
export const mediumPerformanceConfig: PerformanceConfig = {
  animations: {
    enableStaggered: true,
    staggerDelay: 150,
    enableHover: true,
    enableBoundEffects: true,
    reducedMotionFallback: true,
  },
  images: {
    enableLazyLoading: true,
    enableWebP: true,
    enableAVIF: false,
    compressionQuality: 75,
    enableProgressiveLoading: true,
  },
  layout: {
    enableVirtualization: false,
    enableIntersectionObserver: true,
    enableWillChange: false, // Can cause issues on older devices
    enableGPUAcceleration: true,
  },
  bundle: {
    enableCodeSplitting: true,
    enableTreeShaking: true,
    enableMinification: true,
    enableGzipCompression: true,
  },
  compatibility: {
    enablePolyfills: true,
    enableFallbacks: true,
    supportedBrowsers: ['Chrome >= 50', 'Firefox >= 45', 'Safari >= 10', 'Edge >= 15'],
    minimumVersions: {
      Chrome: 50,
      Firefox: 45,
      Safari: 10,
      Edge: 15,
    },
  },
  monitoring: {
    enablePerformanceAPI: true,
    enableMemoryMonitoring: false,
    enableFPSMonitoring: false,
    enableUserTiming: false,
  },
};

// Low-performance configuration for very old or low-end devices
export const lowPerformanceConfig: PerformanceConfig = {
  animations: {
    enableStaggered: false,
    staggerDelay: 0,
    enableHover: false,
    enableBoundEffects: false,
    reducedMotionFallback: true,
  },
  images: {
    enableLazyLoading: true,
    enableWebP: false,
    enableAVIF: false,
    compressionQuality: 60,
    enableProgressiveLoading: false,
  },
  layout: {
    enableVirtualization: false,
    enableIntersectionObserver: false, // Fallback to simple loading
    enableWillChange: false,
    enableGPUAcceleration: false,
  },
  bundle: {
    enableCodeSplitting: false, // Simpler loading
    enableTreeShaking: true,
    enableMinification: true,
    enableGzipCompression: true,
  },
  compatibility: {
    enablePolyfills: true,
    enableFallbacks: true,
    supportedBrowsers: ['Chrome >= 40', 'Firefox >= 35', 'Safari >= 9', 'Edge >= 12'],
    minimumVersions: {
      Chrome: 40,
      Firefox: 35,
      Safari: 9,
      Edge: 12,
    },
  },
  monitoring: {
    enablePerformanceAPI: false,
    enableMemoryMonitoring: false,
    enableFPSMonitoring: false,
    enableUserTiming: false,
  },
};

// Mobile-optimized configuration
export const mobileOptimizedConfig: PerformanceConfig = {
  animations: {
    enableStaggered: true,
    staggerDelay: 200, // Slower for touch devices
    enableHover: false, // No hover on touch devices
    enableBoundEffects: false, // Simplified for touch
    reducedMotionFallback: true,
  },
  images: {
    enableLazyLoading: true,
    enableWebP: true,
    enableAVIF: true,
    compressionQuality: 70, // Lower for mobile bandwidth
    enableProgressiveLoading: true,
  },
  layout: {
    enableVirtualization: false,
    enableIntersectionObserver: true,
    enableWillChange: false, // Can cause issues on mobile
    enableGPUAcceleration: true,
  },
  bundle: {
    enableCodeSplitting: true,
    enableTreeShaking: true,
    enableMinification: true,
    enableGzipCompression: true,
  },
  compatibility: {
    enablePolyfills: true,
    enableFallbacks: true,
    supportedBrowsers: ['Chrome >= 60', 'Firefox >= 55', 'Safari >= 12', 'Edge >= 79'],
    minimumVersions: {
      Chrome: 60,
      Firefox: 55,
      Safari: 12,
      Edge: 79,
    },
  },
  monitoring: {
    enablePerformanceAPI: true,
    enableMemoryMonitoring: true,
    enableFPSMonitoring: false, // Less important on mobile
    enableUserTiming: false,
  },
};

/**
 * Get performance configuration based on device capabilities
 */
export const getPerformanceConfig = (
  deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop',
  performanceLevel: 'high' | 'medium' | 'low' = 'high'
): PerformanceConfig => {
  if (deviceType === 'mobile') {
    return mobileOptimizedConfig;
  }
  
  switch (performanceLevel) {
    case 'high':
      return highPerformanceConfig;
    case 'medium':
      return mediumPerformanceConfig;
    case 'low':
      return lowPerformanceConfig;
    default:
      return highPerformanceConfig;
  }
};

/**
 * Browser-specific performance optimizations
 */
export const browserOptimizations = {
  Chrome: {
    enableBlink: true,
    enableCompositing: true,
    enableHardwareAcceleration: true,
    preferredImageFormat: 'webp',
  },
  Firefox: {
    enableGecko: true,
    enableLayerization: true,
    enableHardwareAcceleration: true,
    preferredImageFormat: 'webp',
  },
  Safari: {
    enableWebKit: true,
    enableMetal: true,
    enableHardwareAcceleration: true,
    preferredImageFormat: 'webp',
    disableBackdropFilter: false, // Safari 14+ supports it
  },
  Edge: {
    enableBlink: true,
    enableCompositing: true,
    enableHardwareAcceleration: true,
    preferredImageFormat: 'webp',
  },
};

/**
 * Performance budgets and thresholds
 */
export const performanceBudgets = {
  // Time budgets (milliseconds)
  firstContentfulPaint: 1500,
  largestContentfulPaint: 2500,
  firstInputDelay: 100,
  cumulativeLayoutShift: 0.1,
  
  // Size budgets (KB)
  totalBundleSize: 500,
  imagesTotalSize: 1000,
  cssSize: 50,
  jsSize: 300,
  
  // Runtime budgets
  memoryUsage: 50, // MB
  frameRate: 30, // FPS minimum
  interactionLatency: 100, // ms
  
  // Network budgets
  httpRequests: 20,
  domElements: 1000,
  domDepth: 10,
};

/**
 * Feature detection priorities
 */
export const featurePriorities = {
  critical: [
    'flexbox',
    'transforms3d',
    'customProperties',
  ],
  important: [
    'cssGrid',
    'intersectionObserver',
    'willChange',
  ],
  nice_to_have: [
    'backdropFilter',
    'objectFit',
    'aspectRatio',
  ],
};

/**
 * Lazy loading configuration
 */
export const lazyLoadingConfig = {
  rootMargin: '50px',
  threshold: 0.1,
  enableNativeLazyLoading: true,
  fallbackToIntersectionObserver: true,
  placeholderStrategy: 'blur', // 'blur' | 'skeleton' | 'solid'
  fadeInDuration: 300,
};

/**
 * Animation performance settings
 */
export const animationConfig = {
  // Preferred properties for animations (GPU-accelerated)
  preferredProperties: ['transform', 'opacity'],
  
  // Properties to avoid animating (CPU-intensive)
  avoidProperties: ['width', 'height', 'top', 'left', 'margin', 'padding'],
  
  // Timing functions optimized for performance
  timingFunctions: {
    easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Duration recommendations
  durations: {
    micro: 150,   // Small UI changes
    short: 300,   // Standard transitions
    medium: 500,  // Complex animations
    long: 800,    // Page transitions
  },
  
  // Stagger timing
  stagger: {
    base: 50,     // Base delay between items
    max: 300,     // Maximum total stagger time
    curve: 'ease-out', // Stagger timing curve
  },
};