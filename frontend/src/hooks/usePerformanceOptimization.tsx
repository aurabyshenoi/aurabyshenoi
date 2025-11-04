import React, { useEffect, useCallback, useRef } from 'react';
import { performanceMonitor, trackPageVisibility, monitorNetworkPerformance } from '../utils/performanceMonitor';
import { preloadCriticalImages, imageCache } from '../utils/imageService';

interface PerformanceOptimizationOptions {
  enableImagePreloading?: boolean;
  enableNetworkMonitoring?: boolean;
  enableVisibilityTracking?: boolean;
  criticalImages?: string[];
}

export const usePerformanceOptimization = (options: PerformanceOptimizationOptions = {}) => {
  const {
    enableImagePreloading = true,
    enableNetworkMonitoring = true,
    enableVisibilityTracking = true,
    criticalImages = [],
  } = options;

  const cleanupFunctions = useRef<(() => void)[]>([]);

  // Preload critical images on mount
  useEffect(() => {
    if (enableImagePreloading && criticalImages.length > 0) {
      preloadCriticalImages(criticalImages).catch(error => {
        console.warn('Failed to preload critical images:', error);
      });
    }
  }, [enableImagePreloading, criticalImages]);

  // Initialize performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    performanceMonitor.startTiming('component-mount');

    // Monitor network performance
    if (enableNetworkMonitoring) {
      monitorNetworkPerformance();
    }

    // Track page visibility
    if (enableVisibilityTracking) {
      const cleanup = trackPageVisibility();
      cleanupFunctions.current.push(cleanup);
    }

    return () => {
      performanceMonitor.endTiming('component-mount');
      
      // Run all cleanup functions
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, [enableNetworkMonitoring, enableVisibilityTracking]);

  // Debounced image preloading for dynamic content
  const preloadImages = useCallback(
    debounce((imageUrls: string[]) => {
      if (enableImagePreloading) {
        preloadCriticalImages(imageUrls);
      }
    }, 300),
    [enableImagePreloading]
  );

  // Memory cleanup utility
  const clearImageCache = useCallback(() => {
    imageCache.clear();
    performanceMonitor.logMetric('image-cache-cleared', imageCache.getCacheSize());
  }, []);

  // Performance metrics getter
  const getPerformanceMetrics = useCallback(() => {
    return performanceMonitor.getStoredMetrics();
  }, []);

  // Core Web Vitals measurement
  const measureCoreWebVitals = useCallback(async () => {
    try {
      const vitals = await performanceMonitor.getCoreWebVitals();
      return vitals;
    } catch (error) {
      console.warn('Failed to measure Core Web Vitals:', error);
      return {};
    }
  }, []);

  return {
    preloadImages,
    clearImageCache,
    getPerformanceMetrics,
    measureCoreWebVitals,
    imageCacheSize: imageCache.getCacheSize(),
  };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// React component performance wrapper
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    useEffect(() => {
      performanceMonitor.startTiming(`${componentName}-render`);
      
      return () => {
        performanceMonitor.endTiming(`${componentName}-render`);
      };
    });

    return <Component {...props} />;
  });
};