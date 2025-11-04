// Image preloader utility for better performance

interface PreloadOptions {
  priority?: 'high' | 'low';
  crossOrigin?: 'anonymous' | 'use-credentials';
}

class ImagePreloader {
  private cache = new Map<string, Promise<HTMLImageElement>>();
  private loadedImages = new Set<string>();
  private maxCacheSize = 100; // Limit cache size to prevent memory issues
  private cacheAccessOrder = new Map<string, number>(); // Track access order for LRU eviction
  private accessCounter = 0;

  /**
   * Preload a single image with LRU cache management
   */
  preload(src: string, options: PreloadOptions = {}): Promise<HTMLImageElement> {
    // Return cached promise if already loading/loaded
    if (this.cache.has(src)) {
      this.updateAccessOrder(src);
      return this.cache.get(src)!;
    }

    // Implement LRU cache eviction
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      if (options.crossOrigin) {
        img.crossOrigin = options.crossOrigin;
      }

      // Set loading priority for modern browsers
      if ('loading' in img) {
        img.loading = options.priority === 'high' ? 'eager' : 'lazy';
      }
      
      // Set fetch priority for modern browsers
      if ('fetchPriority' in img) {
        (img as any).fetchPriority = options.priority || 'auto';
      }

      img.onload = () => {
        this.loadedImages.add(src);
        this.updateAccessOrder(src);
        resolve(img);
      };

      img.onerror = () => {
        this.cache.delete(src); // Remove from cache on error
        this.cacheAccessOrder.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };

      img.src = src;
    });

    this.cache.set(src, promise);
    this.updateAccessOrder(src);
    return promise;
  }

  private updateAccessOrder(src: string): void {
    this.cacheAccessOrder.set(src, ++this.accessCounter);
  }

  private evictLeastRecentlyUsed(): void {
    let lruKey = '';
    let lruAccess = Infinity;
    
    for (const [key, access] of this.cacheAccessOrder) {
      if (access < lruAccess) {
        lruAccess = access;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.cache.delete(lruKey);
      this.cacheAccessOrder.delete(lruKey);
      this.loadedImages.delete(lruKey);
    }
  }

  /**
   * Preload multiple images with better error handling
   */
  preloadMultiple(sources: string[], options: PreloadOptions = {}): Promise<HTMLImageElement[]> {
    const promises = sources.map(src => this.preload(src, options));
    return Promise.allSettled(promises).then(results => 
      results
        .filter((result): result is PromiseFulfilledResult<HTMLImageElement> => result.status === 'fulfilled')
        .map(result => result.value)
    );
  }

  /**
   * Preload images with staggered loading to prevent overwhelming the browser
   */
  async preloadStaggered(
    sources: string[], 
    batchSize: number = 3, 
    delay: number = 100,
    options: PreloadOptions = {}
  ): Promise<void> {
    for (let i = 0; i < sources.length; i += batchSize) {
      const batch = sources.slice(i, i + batchSize);
      await this.preloadMultiple(batch, options);
      
      // Add delay between batches to prevent overwhelming the browser
      if (i + batchSize < sources.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Preload images with different priorities
   */
  preloadWithPriority(
    highPriority: string[] = [],
    lowPriority: string[] = [],
    options: PreloadOptions = {}
  ): Promise<{ high: HTMLImageElement[]; low: HTMLImageElement[] }> {
    const highPromises = this.preloadMultiple(highPriority, { ...options, priority: 'high' });
    
    // Start low priority after a small delay
    const lowPromises = new Promise<HTMLImageElement[]>((resolve) => {
      setTimeout(() => {
        this.preloadMultiple(lowPriority, { ...options, priority: 'low' }).then(resolve);
      }, 100);
    });

    return Promise.all([highPromises, lowPromises]).then(([high, low]) => ({
      high,
      low,
    }));
  }

  /**
   * Check if an image is already loaded
   */
  isLoaded(src: string): boolean {
    return this.loadedImages.has(src);
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    this.loadedImages.clear();
    this.cacheAccessOrder.clear();
    this.accessCounter = 0;
  }

  /**
   * Get cache size and statistics
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Get detailed cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; loadedCount: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      loadedCount: this.loadedImages.size,
      hitRate: this.accessCounter > 0 ? this.loadedImages.size / this.accessCounter : 0,
    };
  }
}

// Create a singleton instance
export const imagePreloader = new ImagePreloader();

// Hook for preloading images in React components
export const useImagePreloader = () => {
  return {
    preload: imagePreloader.preload.bind(imagePreloader),
    preloadMultiple: imagePreloader.preloadMultiple.bind(imagePreloader),
    preloadWithPriority: imagePreloader.preloadWithPriority.bind(imagePreloader),
    isLoaded: imagePreloader.isLoaded.bind(imagePreloader),
    clearCache: imagePreloader.clearCache.bind(imagePreloader),
  };
};

// Utility function to extract image URLs from paintings for preloading
export const extractImageUrlsFromPaintings = (paintings: any[]): {
  thumbnails: string[];
  fullSize: string[];
} => {
  const thumbnails: string[] = [];
  const fullSize: string[] = [];

  paintings.forEach(painting => {
    if (painting.images?.thumbnail) {
      thumbnails.push(painting.images.thumbnail);
    }
    if (painting.images?.fullSize) {
      fullSize.push(...painting.images.fullSize);
    }
  });

  return { thumbnails, fullSize };
};

// Preload critical images (above the fold)
export const preloadCriticalImages = async (paintings: any[], count: number = 6) => {
  const criticalPaintings = paintings.slice(0, count);
  const { thumbnails } = extractImageUrlsFromPaintings(criticalPaintings);
  
  try {
    await imagePreloader.preloadMultiple(thumbnails);
  } catch (error) {
    console.warn('Some critical images failed to preload:', error);
  }
};

// Preload images for the next page/batch with staggered loading
export const preloadNextBatch = (paintings: any[], currentIndex: number, batchSize: number = 6) => {
  const nextBatch = paintings.slice(currentIndex, currentIndex + batchSize);
  const { thumbnails } = extractImageUrlsFromPaintings(nextBatch);
  
  // Preload in background with staggered loading (don't await)
  imagePreloader.preloadStaggered(thumbnails, 2, 50, { priority: 'low' }).catch(error => {
    console.warn('Some next batch images failed to preload:', error);
  });
};

// Optimize images for different screen sizes
export const getOptimizedImageUrl = (baseUrl: string, width: number, quality: number = 80): string => {
  // If it's a Cloudinary URL, add optimization parameters
  if (baseUrl.includes('cloudinary.com')) {
    const parts = baseUrl.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${width},q_${quality},f_auto,dpr_auto/${parts[1]}`;
    }
  }
  return baseUrl;
};

// Generate responsive image srcset
export const generateSrcSet = (baseUrl: string): string => {
  const sizes = [400, 600, 800, 1200];
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, size)} ${size}w`)
    .join(', ');
};

// Preload images based on user interaction patterns
export const preloadOnHover = (painting: any): void => {
  if (painting.images?.fullSize) {
    imagePreloader.preloadStaggered(painting.images.fullSize, 1, 100, { priority: 'low' });
  }
};

// Preload images based on scroll position
export const preloadOnScroll = (paintings: any[], visibleIndex: number): void => {
  const preloadAhead = 6; // Number of images to preload ahead
  const startIndex = Math.max(0, visibleIndex);
  const endIndex = Math.min(paintings.length, visibleIndex + preloadAhead);
  
  const nextPaintings = paintings.slice(startIndex, endIndex);
  const { thumbnails } = extractImageUrlsFromPaintings(nextPaintings);
  
  if (thumbnails.length > 0) {
    imagePreloader.preloadStaggered(thumbnails, 2, 50, { priority: 'low' });
  }
};