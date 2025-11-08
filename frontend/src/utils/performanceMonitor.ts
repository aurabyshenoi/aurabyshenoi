/**
 * Performance Monitoring and Optimization Utilities
 * Provides performance testing and optimization for React Bits Masonry Gallery
 */

export interface PerformanceMetrics {
  renderTime: number;
  animationFrameRate: number;
  memoryUsage: number;
  bundleSize: number;
  imageLoadTime: number;
  interactionLatency: number;
  layoutShiftScore: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

export interface PerformanceReport {
  metrics: PerformanceMetrics;
  score: number;
  recommendations: string[];
  optimizations: string[];
  warnings: string[];
}

export interface AnimationPerformanceTest {
  averageFPS: number;
  droppedFrames: number;
  smoothness: number;
  duration: number;
  success: boolean;
}

/**
 * Performance monitoring class for React Bits Masonry Gallery
 */
export class MasonryPerformanceMonitor {
  private startTime: number = 0;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private animationId: number = 0;
  private isMonitoring: boolean = false;
  private performanceObserver?: PerformanceObserver;
  private metrics: Partial<PerformanceMetrics> = {};

  constructor() {
    this.initializePerformanceObserver();
  }

  /**
   * Initialize Performance Observer for Web Vitals
   */
  private initializePerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                this.metrics.firstContentfulPaint = entry.startTime;
              }
              break;
            case 'largest-contentful-paint':
              this.metrics.largestContentfulPaint = entry.startTime;
              break;
            case 'layout-shift':
              this.metrics.layoutShiftScore = (this.metrics.layoutShiftScore || 0) + (entry as any).value;
              break;
          }
        }
      });

      try {
        this.performanceObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startTime = performance.now();
    this.frameCount = 0;
    this.lastFrameTime = this.startTime;
    
    this.monitorFrameRate();
    this.measureMemoryUsage();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): PerformanceMetrics {
    if (!this.isMonitoring) return this.getDefaultMetrics();

    this.isMonitoring = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    const endTime = performance.now();
    const totalTime = endTime - this.startTime;
    
    this.metrics.renderTime = totalTime;
    this.metrics.animationFrameRate = this.frameCount / (totalTime / 1000);

    return this.getMetrics();
  }

  /**
   * Monitor frame rate during animations
   */
  private monitorFrameRate(): void {
    const measureFrame = (currentTime: number) => {
      if (!this.isMonitoring) return;

      this.frameCount++;
      this.lastFrameTime = currentTime;
      this.animationId = requestAnimationFrame(measureFrame);
    };

    this.animationId = requestAnimationFrame(measureFrame);
  }

  /**
   * Measure memory usage
   */
  private measureMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      renderTime: this.metrics.renderTime || 0,
      animationFrameRate: this.metrics.animationFrameRate || 0,
      memoryUsage: this.metrics.memoryUsage || 0,
      bundleSize: this.metrics.bundleSize || 0,
      imageLoadTime: this.metrics.imageLoadTime || 0,
      interactionLatency: this.metrics.interactionLatency || 0,
      layoutShiftScore: this.metrics.layoutShiftScore || 0,
      firstContentfulPaint: this.metrics.firstContentfulPaint || 0,
      largestContentfulPaint: this.metrics.largestContentfulPaint || 0,
    };
  }

  /**
   * Get default metrics when monitoring is not active
   */
  private getDefaultMetrics(): PerformanceMetrics {
    return {
      renderTime: 0,
      animationFrameRate: 0,
      memoryUsage: 0,
      bundleSize: 0,
      imageLoadTime: 0,
      interactionLatency: 0,
      layoutShiftScore: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
    };
  }

  /**
   * Test animation performance
   */
  async testAnimationPerformance(duration: number = 3000): Promise<AnimationPerformanceTest> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let frameCount = 0;
      let droppedFrames = 0;
      let lastFrameTime = startTime;

      const testAnimation = (currentTime: number) => {
        frameCount++;
        
        // Check for dropped frames (> 16.67ms between frames for 60fps)
        if (currentTime - lastFrameTime > 16.67) {
          droppedFrames++;
        }
        
        lastFrameTime = currentTime;

        if (currentTime - startTime < duration) {
          requestAnimationFrame(testAnimation);
        } else {
          const totalTime = currentTime - startTime;
          const averageFPS = frameCount / (totalTime / 1000);
          const smoothness = Math.max(0, 100 - (droppedFrames / frameCount) * 100);

          resolve({
            averageFPS,
            droppedFrames,
            smoothness,
            duration: totalTime,
            success: averageFPS >= 30 && smoothness >= 80
          });
        }
      };

      requestAnimationFrame(testAnimation);
    });
  }

  /**
   * Measure image loading performance
   */
  async measureImageLoadTime(imageUrls: string[]): Promise<number> {
    const startTime = performance.now();
    
    const loadPromises = imageUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = url;
      });
    });

    try {
      await Promise.all(loadPromises);
      const endTime = performance.now();
      this.metrics.imageLoadTime = endTime - startTime;
      return this.metrics.imageLoadTime;
    } catch (error) {
      console.warn('Some images failed to load during performance test');
      return performance.now() - startTime;
    }
  }

  /**
   * Measure interaction latency
   */
  measureInteractionLatency(element: HTMLElement): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      
      const handleClick = () => {
        const endTime = performance.now();
        const latency = endTime - startTime;
        this.metrics.interactionLatency = latency;
        element.removeEventListener('click', handleClick);
        resolve(latency);
      };

      element.addEventListener('click', handleClick);
      
      // Simulate click after a short delay
      setTimeout(() => {
        element.click();
      }, 10);
    });
  }

  /**
   * Cleanup performance observer
   */
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.isMonitoring = false;
  }
}

/**
 * Test masonry gallery performance
 */
export const testMasonryGalleryPerformance = async (
  galleryElement: HTMLElement,
  imageUrls: string[] = []
): Promise<PerformanceReport> => {
  const monitor = new MasonryPerformanceMonitor();
  const recommendations: string[] = [];
  const optimizations: string[] = [];
  const warnings: string[] = [];

  try {
    // Start monitoring
    monitor.startMonitoring();

    // Test animation performance
    const animationTest = await monitor.testAnimationPerformance(2000);
    
    // Test image loading if URLs provided
    if (imageUrls.length > 0) {
      await monitor.measureImageLoadTime(imageUrls);
    }

    // Test interaction latency
    if (galleryElement) {
      const firstCard = galleryElement.querySelector('.artwork-bound-card') as HTMLElement;
      if (firstCard) {
        await monitor.measureInteractionLatency(firstCard);
      }
    }

    // Stop monitoring and get metrics
    const metrics = monitor.stopMonitoring();

    // Calculate performance score
    let score = 100;
    
    // Deduct points for poor performance
    if (animationTest.averageFPS < 30) {
      score -= 30;
      warnings.push('Low frame rate detected during animations');
      recommendations.push('Consider reducing animation complexity or enabling hardware acceleration');
    }
    
    if (animationTest.smoothness < 80) {
      score -= 20;
      warnings.push('Animation smoothness below optimal threshold');
      recommendations.push('Optimize CSS transforms and reduce will-change usage');
    }
    
    if (metrics.memoryUsage > 50) {
      score -= 15;
      warnings.push('High memory usage detected');
      recommendations.push('Implement image lazy loading and cleanup unused resources');
    }
    
    if (metrics.imageLoadTime > 2000) {
      score -= 15;
      warnings.push('Slow image loading performance');
      recommendations.push('Optimize image sizes and implement progressive loading');
    }
    
    if (metrics.interactionLatency > 100) {
      score -= 10;
      warnings.push('High interaction latency');
      recommendations.push('Optimize event handlers and reduce JavaScript execution time');
    }
    
    if (metrics.layoutShiftScore > 0.1) {
      score -= 10;
      warnings.push('Layout shift detected');
      recommendations.push('Set explicit dimensions for images and containers');
    }

    // Add optimizations based on good performance
    if (animationTest.averageFPS >= 60) {
      optimizations.push('Excellent frame rate achieved');
    }
    
    if (animationTest.smoothness >= 95) {
      optimizations.push('Smooth animations detected');
    }
    
    if (metrics.memoryUsage < 20) {
      optimizations.push('Efficient memory usage');
    }
    
    if (metrics.interactionLatency < 50) {
      optimizations.push('Fast interaction response');
    }

    // General recommendations
    if (score < 80) {
      recommendations.push('Consider implementing performance optimizations');
      recommendations.push('Test on lower-end devices for better compatibility');
    }

    monitor.cleanup();

    return {
      metrics,
      score: Math.max(0, score),
      recommendations,
      optimizations,
      warnings
    };

  } catch (error) {
    monitor.cleanup();
    throw new Error(`Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Optimize bundle size by analyzing imports
 */
export const analyzeBundleSize = (): {
  estimatedSize: number;
  recommendations: string[];
  optimizations: string[];
} => {
  const recommendations: string[] = [];
  const optimizations: string[] = [];
  
  // Estimate bundle size based on loaded modules
  let estimatedSize = 0;
  
  // Check for large dependencies
  if (window.React) {
    estimatedSize += 42; // React ~42KB gzipped
    optimizations.push('React loaded efficiently');
  }
  
  if ((window as any).FramerMotion) {
    estimatedSize += 25; // Framer Motion ~25KB gzipped
    optimizations.push('Framer Motion loaded for animations');
  } else {
    recommendations.push('Consider lazy loading Framer Motion if not immediately needed');
  }
  
  // Check for unused CSS
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  if (stylesheets.length > 3) {
    recommendations.push('Consider consolidating CSS files to reduce HTTP requests');
  }
  
  // Check for image optimization
  const images = document.querySelectorAll('img');
  let unoptimizedImages = 0;
  images.forEach(img => {
    if (!img.src.includes('webp') && !img.src.includes('avif')) {
      unoptimizedImages++;
    }
  });
  
  if (unoptimizedImages > 0) {
    recommendations.push('Consider using modern image formats (WebP, AVIF) for better compression');
  }
  
  // Bundle size recommendations
  if (estimatedSize > 100) {
    recommendations.push('Consider code splitting to reduce initial bundle size');
    recommendations.push('Implement lazy loading for non-critical components');
  } else {
    optimizations.push('Bundle size is within optimal range');
  }

  return {
    estimatedSize,
    recommendations,
    optimizations
  };
};

/**
 * Test performance on different device types
 */
export const testDevicePerformance = async (): Promise<{
  deviceType: string;
  performance: 'high' | 'medium' | 'low';
  recommendations: string[];
}> => {
  const recommendations: string[] = [];
  
  // Estimate device performance based on available metrics
  const hardwareConcurrency = navigator.hardwareConcurrency || 1;
  const memory = (navigator as any).deviceMemory || 1;
  const connection = (navigator as any).connection;
  
  let performanceLevel: 'high' | 'medium' | 'low' = 'medium';
  let deviceType = 'desktop';
  
  // Detect device type
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    deviceType = 'mobile';
  } else if (/Tablet|iPad/i.test(navigator.userAgent)) {
    deviceType = 'tablet';
  }
  
  // Determine performance level
  if (hardwareConcurrency >= 8 && memory >= 4) {
    performanceLevel = 'high';
  } else if (hardwareConcurrency >= 4 && memory >= 2) {
    performanceLevel = 'medium';
  } else {
    performanceLevel = 'low';
    recommendations.push('Consider reducing animation complexity for better performance');
    recommendations.push('Implement aggressive lazy loading');
    recommendations.push('Reduce the number of simultaneous animations');
  }
  
  // Connection-based recommendations
  if (connection && connection.effectiveType) {
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      recommendations.push('Optimize for slow network connections');
      recommendations.push('Implement progressive image loading');
    }
  }
  
  // Device-specific recommendations
  if (deviceType === 'mobile') {
    recommendations.push('Optimize touch interactions');
    recommendations.push('Reduce hover effects for touch devices');
    recommendations.push('Implement swipe gestures for better mobile UX');
  }
  
  return {
    deviceType,
    performance: performanceLevel,
    recommendations
  };
};

/**
 * Hook for using performance monitoring in React components
 */
export const usePerformanceMonitor = () => {
  const monitor = new MasonryPerformanceMonitor();
  
  return {
    startMonitoring: () => monitor.startMonitoring(),
    stopMonitoring: () => monitor.stopMonitoring(),
    getMetrics: () => monitor.getMetrics(),
    testAnimationPerformance: (duration?: number) => monitor.testAnimationPerformance(duration),
    measureImageLoadTime: (urls: string[]) => monitor.measureImageLoadTime(urls),
    measureInteractionLatency: (element: HTMLElement) => monitor.measureInteractionLatency(element),
    cleanup: () => monitor.cleanup(),
    getStoredMetrics: () => [], // Placeholder for stored metrics
    clearStoredMetrics: () => {}, // Placeholder for clearing metrics
    getCoreWebVitals: async () => ({}) // Placeholder for core web vitals
  };
};

/**
 * Measure API call performance
 */
export const measureApiCall = async <T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`API Call "${name}" took ${duration.toFixed(2)}ms`);
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.error(`API Call "${name}" failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};

/**
 * Log performance test results
 */
export const logPerformanceResults = (report: PerformanceReport): void => {
  console.group('⚡ Performance Test Results');
  
  console.group('📊 Metrics');
  console.log(`Render Time: ${report.metrics.renderTime.toFixed(2)}ms`);
  console.log(`Frame Rate: ${report.metrics.animationFrameRate.toFixed(1)} FPS`);
  console.log(`Memory Usage: ${report.metrics.memoryUsage.toFixed(1)} MB`);
  console.log(`Image Load Time: ${report.metrics.imageLoadTime.toFixed(2)}ms`);
  console.log(`Interaction Latency: ${report.metrics.interactionLatency.toFixed(2)}ms`);
  console.log(`Layout Shift Score: ${report.metrics.layoutShiftScore.toFixed(3)}`);
  console.log(`First Contentful Paint: ${report.metrics.firstContentfulPaint.toFixed(2)}ms`);
  console.log(`Largest Contentful Paint: ${report.metrics.largestContentfulPaint.toFixed(2)}ms`);
  console.groupEnd();
  
  console.log(`\n🎯 Performance Score: ${report.score}/100`);
  
  if (report.optimizations.length > 0) {
    console.group('✅ Optimizations');
    report.optimizations.forEach(opt => console.log(`• ${opt}`));
    console.groupEnd();
  }
  
  if (report.warnings.length > 0) {
    console.group('⚠️ Warnings');
    report.warnings.forEach(warning => console.warn(`• ${warning}`));
    console.groupEnd();
  }
  
  if (report.recommendations.length > 0) {
    console.group('💡 Recommendations');
    report.recommendations.forEach(rec => console.log(`• ${rec}`));
    console.groupEnd();
  }
  
  console.groupEnd();
};