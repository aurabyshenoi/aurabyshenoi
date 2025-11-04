/**
 * Performance Optimization Utilities for Featured Artwork Gallery
 * Handles image optimization, caching, and performance monitoring
 */

export interface PerformanceMetrics {
  imageLoadTime: number;
  galleryInitTime: number;
  modalOpenTime: number;
  navigationTime: number;
  memoryUsage?: number;
}

export interface ImageOptimizationOptions {
  quality: number;
  format: 'webp' | 'jpeg' | 'png' | 'auto';
  sizes: number[];
  enableCaching: boolean;
  cacheSize: number;
}

export class GalleryPerformanceOptimizer {
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private performanceMetrics: PerformanceMetrics = {
    imageLoadTime: 0,
    galleryInitTime: 0,
    modalOpenTime: 0,
    navigationTime: 0
  };
  private options: ImageOptimizationOptions;
  private observer: PerformanceObserver | null = null;

  constructor(options: Partial<ImageOptimizationOptions> = {}) {
    this.options = {
      quality: 85,
      format: 'auto',
      sizes: [480, 768, 1200, 1920],
      enableCaching: true,
      cacheSize: 50,
      ...options
    };

    this.initializePerformanceMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name.includes('gallery')) {
              this.recordPerformanceMetric(entry);
            }
          });
        });

        this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }
  }

  /**
   * Record performance metric
   */
  private recordPerformanceMetric(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'measure':
        if (entry.name === 'gallery-init') {
          this.performanceMetrics.galleryInitTime = entry.duration;
        } else if (entry.name === 'modal-open') {
          this.performanceMetrics.modalOpenTime = entry.duration;
        } else if (entry.name === 'navigation') {
          this.performanceMetrics.navigationTime = entry.duration;
        }
        break;
      case 'resource':
        if (entry.name.includes('img')) {
          this.performanceMetrics.imageLoadTime = Math.max(
            this.performanceMetrics.imageLoadTime,
            entry.duration
          );
        }
        break;
    }
  }

  /**
   * Optimize image for current viewport and device
   */
  public optimizeImage(src: string, targetWidth?: number): string {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const viewportWidth = window.innerWidth;
    const actualWidth = targetWidth || viewportWidth;
    const optimizedWidth = Math.ceil(actualWidth * devicePixelRatio);

    // Find the best size from available sizes
    const bestSize = this.options.sizes.find(size => size >= optimizedWidth) || 
                     this.options.sizes[this.options.sizes.length - 1];

    // Generate optimized URL
    return this.generateOptimizedUrl(src, bestSize);
  }

  /**
   * Generate optimized image URL
   */
  private generateOptimizedUrl(src: string, width: number): string {
    const url = new URL(src, window.location.origin);
    const extension = url.pathname.split('.').pop()?.toLowerCase();
    
    // For local images, return as-is (would need server-side optimization)
    if (url.origin === window.location.origin) {
      return src;
    }

    // For external images or CDN, add optimization parameters
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', this.options.quality.toString());
    
    if (this.options.format !== 'auto') {
      url.searchParams.set('f', this.options.format);
    }

    return url.toString();
  }

  /**
   * Preload and cache critical images
   */
  public async preloadCriticalImages(srcs: string[]): Promise<void> {
    const preloadPromises = srcs.map(async (src) => {
      if (this.imageCache.has(src)) {
        return; // Already cached
      }

      try {
        const optimizedSrc = this.optimizeImage(src);
        const img = await this.loadImage(optimizedSrc);
        
        if (this.options.enableCaching) {
          this.cacheImage(src, img);
        }
      } catch (error) {
        console.warn(`Failed to preload image: ${src}`, error);
      }
    });

    await Promise.all(preloadPromises);
  }

  /**
   * Load image with performance tracking
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      const img = new Image();

      img.onload = () => {
        const loadTime = performance.now() - startTime;
        performance.mark(`image-load-${src}`);
        resolve(img);
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };

      // Set timeout to prevent hanging
      setTimeout(() => {
        reject(new Error(`Image load timeout: ${src}`));
      }, 15000);

      img.src = src;
    });
  }

  /**
   * Cache image with LRU eviction
   */
  private cacheImage(src: string, img: HTMLImageElement): void {
    if (this.imageCache.size >= this.options.cacheSize) {
      // Remove oldest entry (LRU)
      const firstKey = this.imageCache.keys().next().value;
      if (firstKey) {
        this.imageCache.delete(firstKey);
      }
    }

    this.imageCache.set(src, img);
  }

  /**
   * Get cached image
   */
  public getCachedImage(src: string): HTMLImageElement | null {
    return this.imageCache.get(src) || null;
  }

  /**
   * Optimize gallery layout for performance
   */
  public optimizeGalleryLayout(): void {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
      const element = item as HTMLElement;
      
      // Add will-change for items that will be animated
      element.style.willChange = 'transform';
      
      // Use transform3d to enable hardware acceleration
      element.style.transform = 'translate3d(0, 0, 0)';
      
      // Optimize images within items
      const img = element.querySelector('.gallery-image') as HTMLImageElement;
      if (img) {
        // Enable hardware acceleration for images
        img.style.transform = 'translate3d(0, 0, 0)';
        img.style.backfaceVisibility = 'hidden';
        
        // Set loading attribute for native lazy loading
        img.loading = 'lazy';
        
        // Add intersection observer for viewport-based optimization
        this.observeImageForOptimization(img);
      }
    });
  }

  /**
   * Observe image for viewport-based optimization
   */
  private observeImageForOptimization(img: HTMLImageElement): void {
    if (!('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const image = entry.target as HTMLImageElement;
            this.optimizeImageForViewport(image);
            observer.unobserve(image);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(img);
  }

  /**
   * Optimize image for current viewport
   */
  private optimizeImageForViewport(img: HTMLImageElement): void {
    const rect = img.getBoundingClientRect();
    const optimizedSrc = this.optimizeImage(img.src, rect.width);
    
    if (optimizedSrc !== img.src) {
      img.src = optimizedSrc;
    }
  }

  /**
   * Debounce function for performance
   */
  public debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Throttle function for performance
   */
  public throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Optimize modal performance
   */
  public optimizeModalPerformance(): void {
    const modal = document.getElementById('artworkModal');
    if (!modal) return;

    // Enable hardware acceleration
    modal.style.transform = 'translate3d(0, 0, 0)';
    modal.style.backfaceVisibility = 'hidden';

    // Optimize modal image
    const modalImage = modal.querySelector('.modal-image') as HTMLImageElement;
    if (modalImage) {
      modalImage.style.transform = 'translate3d(0, 0, 0)';
      modalImage.style.backfaceVisibility = 'hidden';
    }

    // Optimize navigation buttons
    const navButtons = modal.querySelectorAll('.nav-arrow');
    navButtons.forEach((button) => {
      const element = button as HTMLElement;
      element.style.transform = 'translate3d(0, 0, 0)';
      element.style.backfaceVisibility = 'hidden';
    });
  }

  /**
   * Monitor and report performance metrics
   */
  public getPerformanceReport(): {
    metrics: PerformanceMetrics;
    cacheStats: {
      size: number;
      hitRate: number;
    };
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    // Analyze performance and provide recommendations
    if (this.performanceMetrics.imageLoadTime > 2000) {
      recommendations.push('Consider optimizing image sizes or using a CDN');
    }

    if (this.performanceMetrics.galleryInitTime > 500) {
      recommendations.push('Gallery initialization is slow, consider lazy loading');
    }

    if (this.performanceMetrics.modalOpenTime > 300) {
      recommendations.push('Modal opening is slow, check for blocking operations');
    }

    // Check memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.performanceMetrics.memoryUsage = memory.usedJSHeapSize;
      
      if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        recommendations.push('High memory usage detected, consider reducing cache size');
      }
    }

    return {
      metrics: this.performanceMetrics,
      cacheStats: {
        size: this.imageCache.size,
        hitRate: 0 // Would need to track cache hits/misses
      },
      recommendations
    };
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.imageCache.clear();
  }

  /**
   * Start performance measurement
   */
  public startMeasurement(name: string): void {
    performance.mark(`${name}-start`);
  }

  /**
   * End performance measurement
   */
  public endMeasurement(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const entries = performance.getEntriesByName(name, 'measure');
    return entries.length > 0 ? entries[entries.length - 1].duration : 0;
  }
}

/**
 * Initialize gallery performance optimization
 */
export const initializeGalleryPerformance = (): GalleryPerformanceOptimizer => {
  const optimizer = new GalleryPerformanceOptimizer({
    quality: 85,
    format: 'auto',
    enableCaching: true,
    cacheSize: 20
  });

  // Start gallery initialization measurement
  optimizer.startMeasurement('gallery-init');

  // Optimize layout
  optimizer.optimizeGalleryLayout();
  optimizer.optimizeModalPerformance();

  // Preload critical images
  const criticalImages = ['/img1.jpeg', '/img2.jpeg'];
  optimizer.preloadCriticalImages(criticalImages);

  // End gallery initialization measurement
  setTimeout(() => {
    optimizer.endMeasurement('gallery-init');
  }, 100);

  return optimizer;
};

/**
 * Image format detection and optimization
 */
export const detectOptimalImageFormat = async (): Promise<'webp' | 'jpeg'> => {
  // Test WebP support
  const webpSupported = await new Promise<boolean>((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => resolve(webP.height === 2);
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });

  return webpSupported ? 'webp' : 'jpeg';
};

/**
 * Compress image quality based on connection speed
 */
export const getOptimalQuality = (): number => {
  // Check connection type if available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    switch (connection.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 60; // Lower quality for slow connections
      case '3g':
        return 75; // Medium quality
      case '4g':
      default:
        return 85; // High quality for fast connections
    }
  }

  return 85; // Default quality
};