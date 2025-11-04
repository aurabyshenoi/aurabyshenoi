/**
 * Lazy Image Loading Utilities for Featured Artwork Gallery
 * Implements intersection observer-based lazy loading with fallbacks
 */

export interface LazyImageOptions {
  rootMargin?: string;
  threshold?: number;
  placeholder?: string;
  errorImage?: string;
  enableWebP?: boolean;
  quality?: number;
}

export interface ImageLoadEvent {
  src: string;
  success: boolean;
  loadTime: number;
  error?: string;
}

export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private loadedImages: Set<string> = new Set();
  private loadingImages: Set<string> = new Set();
  private options: Required<LazyImageOptions>;
  private loadEventListeners: ((event: ImageLoadEvent) => void)[] = [];

  constructor(options: LazyImageOptions = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
      errorImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2NjY2NjYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=',
      enableWebP: true,
      quality: 85,
      ...options
    };

    this.initializeObserver();
  }

  /**
   * Initialize intersection observer
   */
  private initializeObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.loadAllImages();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer?.unobserve(img);
          }
        });
      },
      {
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );
  }

  /**
   * Observe an image for lazy loading
   */
  public observe(img: HTMLImageElement): void {
    if (!img.dataset.src) {
      console.warn('LazyImageLoader: Image missing data-src attribute');
      return;
    }

    // Set placeholder immediately
    if (!img.src || img.src === '') {
      img.src = this.options.placeholder;
    }

    // Add loading class
    img.classList.add('lazy-loading');

    if (this.observer) {
      this.observer.observe(img);
    } else {
      // Fallback: load immediately
      this.loadImage(img);
    }
  }

  /**
   * Load an image
   */
  private async loadImage(img: HTMLImageElement): Promise<void> {
    const originalSrc = img.dataset.src;
    if (!originalSrc || this.loadedImages.has(originalSrc) || this.loadingImages.has(originalSrc)) {
      return;
    }

    this.loadingImages.add(originalSrc);
    const startTime = performance.now();

    try {
      // Determine best image format
      const optimizedSrc = await this.getOptimizedImageSrc(originalSrc);
      
      // Preload the image
      const success = await this.preloadImage(optimizedSrc);
      
      if (success) {
        // Update image source
        img.src = optimizedSrc;
        img.classList.remove('lazy-loading');
        img.classList.add('lazy-loaded');
        
        this.loadedImages.add(originalSrc);
        
        // Emit load event
        const loadTime = performance.now() - startTime;
        this.emitLoadEvent({
          src: originalSrc,
          success: true,
          loadTime
        });
      } else {
        throw new Error('Failed to load image');
      }
    } catch (error) {
      // Handle error
      img.src = this.options.errorImage;
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
      
      const loadTime = performance.now() - startTime;
      this.emitLoadEvent({
        src: originalSrc,
        success: false,
        loadTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      this.loadingImages.delete(originalSrc);
    }
  }

  /**
   * Get optimized image source with format detection
   */
  private async getOptimizedImageSrc(src: string): Promise<string> {
    if (!this.options.enableWebP) {
      return src;
    }

    // Check if WebP is supported
    const supportsWebP = await this.checkWebPSupport();
    
    if (supportsWebP && !src.includes('.webp')) {
      // Try to get WebP version
      const webpSrc = this.convertToWebP(src);
      const webpExists = await this.checkImageExists(webpSrc);
      
      if (webpExists) {
        return webpSrc;
      }
    }

    return src;
  }

  /**
   * Convert image path to WebP format
   */
  private convertToWebP(src: string): string {
    const extension = src.split('.').pop()?.toLowerCase();
    if (extension && ['jpg', 'jpeg', 'png'].includes(extension)) {
      return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return src;
  }

  /**
   * Check if WebP format is supported
   */
  private checkWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Check if an image exists
   */
  private checkImageExists(src: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  /**
   * Preload an image
   */
  private preloadImage(src: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve(true);
      };
      
      img.onerror = () => {
        resolve(false);
      };
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        resolve(false);
      }, 10000); // 10 second timeout
      
      img.src = src;
    });
  }

  /**
   * Load all images immediately (fallback)
   */
  private loadAllImages(): void {
    const lazyImages = document.querySelectorAll('img[data-src]') as NodeListOf<HTMLImageElement>;
    lazyImages.forEach((img) => {
      this.loadImage(img);
    });
  }

  /**
   * Observe multiple images
   */
  public observeAll(selector: string = 'img[data-src]'): void {
    const images = document.querySelectorAll(selector) as NodeListOf<HTMLImageElement>;
    images.forEach((img) => {
      this.observe(img);
    });
  }

  /**
   * Add load event listener
   */
  public onLoad(callback: (event: ImageLoadEvent) => void): void {
    this.loadEventListeners.push(callback);
  }

  /**
   * Emit load event
   */
  private emitLoadEvent(event: ImageLoadEvent): void {
    this.loadEventListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('LazyImageLoader: Error in load event callback:', error);
      }
    });
  }

  /**
   * Get loading statistics
   */
  public getStats(): {
    loaded: number;
    loading: number;
    total: number;
    averageLoadTime: number;
  } {
    const totalImages = document.querySelectorAll('img[data-src]').length;
    
    return {
      loaded: this.loadedImages.size,
      loading: this.loadingImages.size,
      total: totalImages,
      averageLoadTime: 0 // Would need to track load times
    };
  }

  /**
   * Preload critical images
   */
  public preloadCritical(srcs: string[]): Promise<void[]> {
    const promises = srcs.map((src) => this.preloadImage(src));
    return Promise.all(promises.map(p => p.catch(() => false))).then(() => []);
  }

  /**
   * Cleanup observer
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.loadedImages.clear();
    this.loadingImages.clear();
    this.loadEventListeners.length = 0;
  }
}

/**
 * Initialize lazy loading for gallery images
 */
export const initializeGalleryLazyLoading = (): LazyImageLoader => {
  const loader = new LazyImageLoader({
    rootMargin: '100px', // Start loading 100px before image enters viewport
    threshold: 0.1,
    enableWebP: true,
    quality: 85
  });

  // Observe gallery images
  loader.observeAll('.gallery-image[data-src]');

  // Log loading performance
  loader.onLoad((event) => {
    if (event.success) {
      console.log(`Image loaded: ${event.src} (${event.loadTime.toFixed(2)}ms)`);
    } else {
      console.warn(`Image failed to load: ${event.src} - ${event.error}`);
    }
  });

  return loader;
};

/**
 * Convert existing gallery images to lazy loading
 */
export const convertGalleryToLazyLoading = (): void => {
  const galleryImages = document.querySelectorAll('.gallery-image') as NodeListOf<HTMLImageElement>;
  
  galleryImages.forEach((img) => {
    if (img.src && !img.dataset.src) {
      // Move src to data-src for lazy loading
      img.dataset.src = img.src;
      img.src = ''; // Clear src to prevent immediate loading
      
      // Add lazy loading class
      img.classList.add('lazy-image');
    }
  });
};

/**
 * Responsive image loading based on viewport size
 */
export const getResponsiveImageSrc = (baseSrc: string, width: number): string => {
  const extension = baseSrc.split('.').pop();
  const baseName = baseSrc.replace(`.${extension}`, '');
  
  // Define breakpoints
  if (width <= 480) {
    return `${baseName}-small.${extension}`;
  } else if (width <= 768) {
    return `${baseName}-medium.${extension}`;
  } else if (width <= 1200) {
    return `${baseName}-large.${extension}`;
  } else {
    return `${baseName}-xlarge.${extension}`;
  }
};

/**
 * Preload critical gallery images
 */
export const preloadCriticalGalleryImages = async (): Promise<void> => {
  const criticalImages = [
    '/img1.jpeg', // First visible image
    '/img2.jpeg'  // Second visible image
  ];

  const loader = new LazyImageLoader();
  await loader.preloadCritical(criticalImages);
};