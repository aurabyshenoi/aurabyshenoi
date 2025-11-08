/**
 * Performance Optimization Hook
 * Provides performance monitoring and optimization for React Bits Masonry Gallery
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  MasonryPerformanceMonitor, 
  testDevicePerformance,
  analyzeBundleSize,
  type PerformanceReport 
} from '../utils/performanceMonitor';
import { 
  detectBrowser, 
  applyBrowserSpecificStyles,
  type BrowserInfo 
} from '../utils/browserCompatibility';

interface PerformanceOptimizationConfig {
  enableMonitoring?: boolean;
  enableBrowserOptimizations?: boolean;
  performanceThreshold?: number;
  memoryThreshold?: number;
  fpsThreshold?: number;
  autoOptimize?: boolean;
}

interface PerformanceState {
  isMonitoring: boolean;
  currentFPS: number;
  memoryUsage: number;
  performanceScore: number;
  optimizationLevel: 'high' | 'medium' | 'low';
  browserInfo: BrowserInfo | null;
  recommendations: string[];
}

interface PerformanceOptimizations {
  reduceAnimations: boolean;
  enableLazyLoading: boolean;
  optimizeImages: boolean;
  reduceParallax: boolean;
  simplifyHovers: boolean;
  disableBlur: boolean;
}

const usePerformanceOptimization = (config: PerformanceOptimizationConfig = {}) => {
  const {
    enableMonitoring = true,
    enableBrowserOptimizations = true,
    performanceThreshold = 60,
    memoryThreshold = 100,
    fpsThreshold = 30,
    autoOptimize = true
  } = config;

  const monitorRef = useRef<MasonryPerformanceMonitor | null>(null);
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    isMonitoring: false,
    currentFPS: 0,
    memoryUsage: 0,
    performanceScore: 100,
    optimizationLevel: 'high',
    browserInfo: null,
    recommendations: []
  });

  const [optimizations, setOptimizations] = useState<PerformanceOptimizations>({
    reduceAnimations: false,
    enableLazyLoading: true,
    optimizeImages: true,
    reduceParallax: false,
    simplifyHovers: false,
    disableBlur: false
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize performance monitoring
  useEffect(() => {
    if (!enableMonitoring || isInitialized) return;

    const initialize = async () => {
      try {
        // Detect browser and apply optimizations
        const browserInfo = detectBrowser();
        if (enableBrowserOptimizations) {
          applyBrowserSpecificStyles();
        }

        // Analyze device performance
        const deviceAnalysis = await testDevicePerformance();
        
        // Analyze bundle size
        const bundleAnalysis = analyzeBundleSize();

        // Initialize performance monitor
        if (!monitorRef.current) {
          monitorRef.current = new MasonryPerformanceMonitor();
        }

        // Determine optimization level based on device performance
        let optimizationLevel: 'high' | 'medium' | 'low' = 'high';
        if (deviceAnalysis.performance === 'low') {
          optimizationLevel = 'low';
        } else if (deviceAnalysis.performance === 'medium') {
          optimizationLevel = 'medium';
        }

        // Apply automatic optimizations if enabled
        if (autoOptimize) {
          applyAutomaticOptimizations(optimizationLevel, browserInfo, deviceAnalysis);
        }

        setPerformanceState(prev => ({
          ...prev,
          browserInfo,
          optimizationLevel,
          recommendations: [
            ...deviceAnalysis.recommendations,
            ...bundleAnalysis.recommendations
          ]
        }));

        setIsInitialized(true);
      } catch (error) {
        console.warn('Performance optimization initialization failed:', error);
        setIsInitialized(true);
      }
    };

    initialize();
  }, [enableMonitoring, enableBrowserOptimizations, autoOptimize, isInitialized]);

  // Apply automatic optimizations based on device capabilities
  const applyAutomaticOptimizations = useCallback((
    level: 'high' | 'medium' | 'low',
    browser: BrowserInfo,
    device: Awaited<ReturnType<typeof testDevicePerformance>>
  ) => {
    const newOptimizations: PerformanceOptimizations = {
      reduceAnimations: level === 'low',
      enableLazyLoading: true,
      optimizeImages: true,
      reduceParallax: level === 'low' || device.deviceType === 'mobile',
      simplifyHovers: level === 'low' || device.deviceType === 'mobile',
      disableBlur: level === 'low' || !browser.features.backdropFilter
    };

    // Browser-specific optimizations
    if (browser.name === 'Safari' && !browser.features.backdropFilter) {
      newOptimizations.disableBlur = true;
    }

    if (browser.name === 'Firefox' && level === 'low') {
      newOptimizations.reduceAnimations = true;
    }

    setOptimizations(newOptimizations);

    // Apply CSS classes for optimizations
    applyOptimizationClasses(newOptimizations);
  }, []);

  // Apply CSS classes based on optimizations
  const applyOptimizationClasses = useCallback((opts: PerformanceOptimizations) => {
    const documentElement = document.documentElement;
    
    // Remove existing optimization classes
    documentElement.classList.remove(
      'reduce-animations',
      'enable-lazy-loading',
      'optimize-images',
      'reduce-parallax',
      'simplify-hovers',
      'disable-blur'
    );

    // Apply optimization classes
    if (opts.reduceAnimations) {
      documentElement.classList.add('reduce-animations');
    }
    if (opts.enableLazyLoading) {
      documentElement.classList.add('enable-lazy-loading');
    }
    if (opts.optimizeImages) {
      documentElement.classList.add('optimize-images');
    }
    if (opts.reduceParallax) {
      documentElement.classList.add('reduce-parallax');
    }
    if (opts.simplifyHovers) {
      documentElement.classList.add('simplify-hovers');
    }
    if (opts.disableBlur) {
      documentElement.classList.add('disable-blur');
    }
  }, []);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    if (!monitorRef.current || performanceState.isMonitoring) return;

    monitorRef.current.startMonitoring();
    setPerformanceState(prev => ({ ...prev, isMonitoring: true }));

    // Monitor performance metrics periodically
    const monitoringInterval = setInterval(() => {
      if (!monitorRef.current) return;

      const metrics = monitorRef.current.getMetrics();
      
      setPerformanceState(prev => ({
        ...prev,
        currentFPS: metrics.animationFrameRate,
        memoryUsage: metrics.memoryUsage,
        performanceScore: calculatePerformanceScore(metrics)
      }));

      // Auto-adjust optimizations based on performance
      if (autoOptimize) {
        adjustOptimizationsBasedOnPerformance(metrics);
      }
    }, 1000);

    // Store interval ID for cleanup
    (monitorRef.current as any).monitoringInterval = monitoringInterval;
  }, [performanceState.isMonitoring, autoOptimize]);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    if (!monitorRef.current || !performanceState.isMonitoring) return;

    const metrics = monitorRef.current.stopMonitoring();
    
    // Clear monitoring interval
    if ((monitorRef.current as any).monitoringInterval) {
      clearInterval((monitorRef.current as any).monitoringInterval);
    }

    setPerformanceState(prev => ({
      ...prev,
      isMonitoring: false,
      performanceScore: calculatePerformanceScore(metrics)
    }));
  }, [performanceState.isMonitoring]);

  // Calculate performance score from metrics
  const calculatePerformanceScore = useCallback((metrics: any) => {
    let score = 100;
    
    if (metrics.animationFrameRate < fpsThreshold) {
      score -= 30;
    }
    if (metrics.memoryUsage > memoryThreshold) {
      score -= 20;
    }
    if (metrics.interactionLatency > 100) {
      score -= 15;
    }
    if (metrics.imageLoadTime > 2000) {
      score -= 15;
    }
    if (metrics.layoutShiftScore > 0.1) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }, [fpsThreshold, memoryThreshold]);

  // Adjust optimizations based on current performance
  const adjustOptimizationsBasedOnPerformance = useCallback((metrics: any) => {
    const currentScore = calculatePerformanceScore(metrics);
    
    if (currentScore < performanceThreshold) {
      setOptimizations(prev => {
        const newOpts = {
          ...prev,
          reduceAnimations: currentScore < 40,
          simplifyHovers: currentScore < 60,
          disableBlur: currentScore < 50 || metrics.memoryUsage > memoryThreshold
        };
        
        applyOptimizationClasses(newOpts);
        return newOpts;
      });
    }
  }, [performanceThreshold, memoryThreshold, calculatePerformanceScore, applyOptimizationClasses]);

  // Manual optimization controls
  const setOptimization = useCallback((key: keyof PerformanceOptimizations, value: boolean) => {
    setOptimizations(prev => {
      const newOpts = { ...prev, [key]: value };
      applyOptimizationClasses(newOpts);
      return newOpts;
    });
  }, [applyOptimizationClasses]);

  // Get performance report
  const getPerformanceReport = useCallback(async (): Promise<PerformanceReport | null> => {
    if (!monitorRef.current) return null;

    try {
      const galleryElement = document.querySelector('.masonry-gallery-container') as HTMLElement;
      if (!galleryElement) return null;

      const report = await import('../utils/performanceMonitor').then(module => 
        module.testMasonryGalleryPerformance(galleryElement, [])
      );
      
      return report;
    } catch (error) {
      console.warn('Failed to generate performance report:', error);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (monitorRef.current) {
        monitorRef.current.cleanup();
        if ((monitorRef.current as any).monitoringInterval) {
          clearInterval((monitorRef.current as any).monitoringInterval);
        }
      }
    };
  }, []);

  return {
    // State
    performanceState,
    optimizations,
    isInitialized,
    
    // Actions
    startMonitoring,
    stopMonitoring,
    setOptimization,
    getPerformanceReport,
    
    // Utilities
    applyAutomaticOptimizations: (level: 'high' | 'medium' | 'low') => {
      if (performanceState.browserInfo) {
        applyAutomaticOptimizations(level, performanceState.browserInfo, {
          deviceType: 'desktop',
          performance: level,
          recommendations: []
        });
      }
    }
  };
};

export default usePerformanceOptimization;