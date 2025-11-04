// Performance monitoring utilities
import { useMemo } from 'react';

interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers(): void {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.logNavigationMetrics(entry as PerformanceNavigationTiming);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);

        // Observe resource loading
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.logResourceMetrics(entry as PerformanceResourceTiming);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);

        // Observe largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.logMetric('largest-contentful-paint', lastEntry.startTime, {
            element: (lastEntry as any).element?.tagName,
            url: (lastEntry as any).url,
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Observe first input delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.logMetric('first-input-delay', entry.processingStart - entry.startTime, {
              eventType: (entry as any).name,
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('Performance observers not fully supported:', error);
      }
    }
  }

  private logNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const metrics = {
      'dns-lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'tcp-connection': entry.connectEnd - entry.connectStart,
      'tls-negotiation': entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      'request-response': entry.responseEnd - entry.requestStart,
      'dom-processing': entry.domContentLoadedEventEnd - entry.responseEnd,
      'resource-loading': entry.loadEventEnd - entry.domContentLoadedEventEnd,
      'total-load-time': entry.loadEventEnd - entry.navigationStart,
    };

    Object.entries(metrics).forEach(([name, duration]) => {
      this.logMetric(`navigation-${name}`, duration);
    });
  }

  private logResourceMetrics(entry: PerformanceResourceTiming): void {
    // Only log image resources for now
    if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      this.logMetric('image-load-time', entry.responseEnd - entry.startTime, {
        url: entry.name,
        size: entry.transferSize,
        cached: entry.transferSize === 0,
      });
    }
  }

  // Start timing a custom metric
  startTiming(name: string, metadata?: Record<string, any>): void {
    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  // End timing a custom metric
  endTiming(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`No timing started for metric: ${name}`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    this.logMetric(name, duration, metric.metadata);
    this.metrics.delete(name);

    return duration;
  }

  // Log a metric directly
  logMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} = ${value.toFixed(2)}ms`, metadata);
    }

    // Store in session storage for debugging
    try {
      const stored = sessionStorage.getItem('performance-metrics');
      const metrics = stored ? JSON.parse(stored) : [];
      metrics.push(metric);
      
      // Keep only last 100 metrics
      if (metrics.length > 100) {
        metrics.splice(0, metrics.length - 100);
      }
      
      sessionStorage.setItem('performance-metrics', JSON.stringify(metrics));
    } catch (error) {
      // Ignore storage errors
    }
  }

  // Get Core Web Vitals
  getCoreWebVitals(): Promise<{
    lcp?: number;
    fid?: number;
    cls?: number;
  }> {
    return new Promise((resolve) => {
      const vitals: any = {};
      let resolveTimeout: NodeJS.Timeout;

      // Set a timeout to resolve even if not all metrics are available
      resolveTimeout = setTimeout(() => resolve(vitals), 3000);

      // Get LCP
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
            lcpObserver.disconnect();
            
            if (vitals.lcp && vitals.fid !== undefined && vitals.cls !== undefined) {
              clearTimeout(resolveTimeout);
              resolve(vitals);
            }
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // Get FID
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              vitals.fid = entry.processingStart - entry.startTime;
            });
            fidObserver.disconnect();
            
            if (vitals.lcp && vitals.fid !== undefined && vitals.cls !== undefined) {
              clearTimeout(resolveTimeout);
              resolve(vitals);
            }
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Get CLS
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            });
            vitals.cls = clsValue;
            
            if (vitals.lcp && vitals.fid !== undefined && vitals.cls !== undefined) {
              clearTimeout(resolveTimeout);
              resolve(vitals);
            }
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          clearTimeout(resolveTimeout);
          resolve(vitals);
        }
      } else {
        clearTimeout(resolveTimeout);
        resolve(vitals);
      }
    });
  }

  // Get stored metrics
  getStoredMetrics(): any[] {
    try {
      const stored = sessionStorage.getItem('performance-metrics');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  // Clear stored metrics
  clearStoredMetrics(): void {
    try {
      sessionStorage.removeItem('performance-metrics');
    } catch (error) {
      // Ignore storage errors
    }
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  return useMemo(() => ({
    startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
    endTiming: performanceMonitor.endTiming.bind(performanceMonitor),
    logMetric: performanceMonitor.logMetric.bind(performanceMonitor),
    getCoreWebVitals: performanceMonitor.getCoreWebVitals.bind(performanceMonitor),
    getStoredMetrics: performanceMonitor.getStoredMetrics.bind(performanceMonitor),
    clearStoredMetrics: performanceMonitor.clearStoredMetrics.bind(performanceMonitor),
  }), []);
};

// Utility functions for common performance measurements
export const measureImageLoad = (src: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.logMetric('image-load', loadTime, { src });
      resolve(loadTime);
    };
    
    img.onerror = () => {
      const loadTime = performance.now() - startTime;
      performanceMonitor.logMetric('image-load-error', loadTime, { src });
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
};

export const measureApiCall = async <T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  performanceMonitor.startTiming(`api-${name}`);
  try {
    const result = await apiCall();
    performanceMonitor.endTiming(`api-${name}`);
    return result;
  } catch (error) {
    performanceMonitor.endTiming(`api-${name}`);
    throw error;
  }
};

// Enhanced performance monitoring for production
export class ProductionPerformanceMonitor {
  private metricsBuffer: any[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.startBatchFlush();
    this.monitorMemoryUsage();
  }

  private startBatchFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushMetrics();
    }, this.flushInterval);
  }

  private flushMetrics(): void {
    if (this.metricsBuffer.length === 0) return;

    // In production, you would send these to your analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to analytics service
      // this.sendToAnalytics(this.metricsBuffer);
      console.log('Flushing performance metrics:', this.metricsBuffer.length);
    }

    this.metricsBuffer = [];
  }

  logMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      metadata,
    };

    this.metricsBuffer.push(metric);

    // Flush immediately if buffer is full
    if (this.metricsBuffer.length >= this.batchSize) {
      this.flushMetrics();
    }
  }

  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.logMetric('memory-usage', memory.usedJSHeapSize, {
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }, 60000); // Every minute
    }
  }

  cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushMetrics(); // Final flush
  }
}

// Create production monitor instance
export const productionMonitor = new ProductionPerformanceMonitor();

// Bundle size analyzer utility
export const analyzeBundleSize = (): void => {
  if (process.env.NODE_ENV === 'development') {
    // Analyze loaded scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const totalSize = scripts.reduce((total, script) => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('chunk') || src.includes('vendor')) {
        // Estimate size based on typical chunk sizes
        return total + 100; // KB estimate
      }
      return total;
    }, 0);

    console.log(`Estimated bundle size: ${totalSize}KB`);
    performanceMonitor.logMetric('bundle-size-estimate', totalSize);
  }
};

// Network performance monitoring
export const monitorNetworkPerformance = (): void => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    performanceMonitor.logMetric('network-effective-type', 0, {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
    });
  }
};

// Page visibility performance tracking
export const trackPageVisibility = (): void => {
  let visibilityStart = Date.now();

  const handleVisibilityChange = () => {
    if (document.hidden) {
      const visibleTime = Date.now() - visibilityStart;
      performanceMonitor.logMetric('page-visible-time', visibleTime);
    } else {
      visibilityStart = Date.now();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};