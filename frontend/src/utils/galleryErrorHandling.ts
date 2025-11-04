/**
 * Error Handling and Performance Monitoring for Gallery
 * Provides robust error handling and performance tracking
 */

export interface GalleryError {
  type: 'image-load' | 'modal' | 'navigation' | 'initialization';
  message: string;
  timestamp: number;
  context?: Record<string, any>;
}

export interface PerformanceReport {
  loadTimes: number[];
  errorCount: number;
  successRate: number;
  averageLoadTime: number;
  recommendations: string[];
}

export class GalleryErrorHandler {
  private errors: GalleryError[] = [];
  private loadTimes: number[] = [];
  private maxErrors: number = 50;
  private maxLoadTimes: number = 100;

  /**
   * Log an error
   */
  public logError(type: GalleryError['type'], message: string, context?: Record<string, any>): void {
    const error: GalleryError = {
      type,
      message,
      timestamp: Date.now(),
      context
    };

    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Gallery Error [${type}]:`, message, context);
    }

    // Report critical errors
    if (this.isCriticalError(type)) {
      this.reportCriticalError(error);
    }
  }

  /**
   * Record load time
   */
  public recordLoadTime(time: number): void {
    this.loadTimes.push(time);

    // Keep only recent load times
    if (this.loadTimes.length > this.maxLoadTimes) {
      this.loadTimes = this.loadTimes.slice(-this.maxLoadTimes);
    }
  }

  /**
   * Check if error is critical
   */
  private isCriticalError(type: GalleryError['type']): boolean {
    return type === 'initialization' || type === 'modal';
  }

  /**
   * Report critical error
   */
  private reportCriticalError(error: GalleryError): void {
    // In a real application, this would send to an error reporting service
    console.error('Critical Gallery Error:', error);
    
    // Show user-friendly error message
    this.showUserError(error);
  }

  /**
   * Show user-friendly error message
   */
  private showUserError(error: GalleryError): void {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'gallery-error-notification';
    errorContainer.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-message">Gallery temporarily unavailable. Please refresh the page.</span>
        <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add styles
    errorContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 4px;
      padding: 12px;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;

    document.body.appendChild(errorContainer);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorContainer.parentElement) {
        errorContainer.remove();
      }
    }, 5000);
  }

  /**
   * Get performance report
   */
  public getPerformanceReport(): PerformanceReport {
    const totalOperations = this.loadTimes.length + this.errors.length;
    const successCount = this.loadTimes.length;
    const errorCount = this.errors.length;
    
    const successRate = totalOperations > 0 ? (successCount / totalOperations) * 100 : 100;
    const averageLoadTime = this.loadTimes.length > 0 
      ? this.loadTimes.reduce((sum, time) => sum + time, 0) / this.loadTimes.length 
      : 0;

    const recommendations = this.generateRecommendations(averageLoadTime, successRate);

    return {
      loadTimes: [...this.loadTimes],
      errorCount,
      successRate,
      averageLoadTime,
      recommendations
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(averageLoadTime: number, successRate: number): string[] {
    const recommendations: string[] = [];

    if (averageLoadTime > 2000) {
      recommendations.push('Consider optimizing image sizes or implementing lazy loading');
    }

    if (averageLoadTime > 5000) {
      recommendations.push('Image load times are very slow - check network conditions or image optimization');
    }

    if (successRate < 95) {
      recommendations.push('High error rate detected - check image URLs and network connectivity');
    }

    if (successRate < 80) {
      recommendations.push('Critical: Very high error rate - immediate attention required');
    }

    if (this.errors.filter(e => e.type === 'image-load').length > 5) {
      recommendations.push('Multiple image load failures - verify image sources');
    }

    return recommendations;
  }

  /**
   * Get recent errors
   */
  public getRecentErrors(count: number = 10): GalleryError[] {
    return this.errors.slice(-count);
  }

  /**
   * Clear error history
   */
  public clearErrors(): void {
    this.errors = [];
  }

  /**
   * Clear performance data
   */
  public clearPerformanceData(): void {
    this.loadTimes = [];
  }

  /**
   * Export error data for debugging
   */
  public exportErrorData(): string {
    return JSON.stringify({
      errors: this.errors,
      loadTimes: this.loadTimes,
      report: this.getPerformanceReport(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }, null, 2);
  }
}

/**
 * Retry mechanism for failed operations
 */
export class RetryManager {
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  /**
   * Execute operation with retry logic
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
    maxRetries: number = this.maxRetries
  ): Promise<T> {
    const attempts = this.retryAttempts.get(operationId) || 0;

    try {
      const result = await operation();
      this.retryAttempts.delete(operationId); // Reset on success
      return result;
    } catch (error) {
      if (attempts < maxRetries) {
        this.retryAttempts.set(operationId, attempts + 1);
        
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempts);
        await this.delay(delay);
        
        return this.executeWithRetry(operation, operationId, maxRetries);
      } else {
        this.retryAttempts.delete(operationId);
        throw error;
      }
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset retry count for operation
   */
  public resetRetries(operationId: string): void {
    this.retryAttempts.delete(operationId);
  }

  /**
   * Get retry count for operation
   */
  public getRetryCount(operationId: string): number {
    return this.retryAttempts.get(operationId) || 0;
  }
}

/**
 * Image load error handler with fallbacks
 */
export const handleImageLoadError = (
  img: HTMLImageElement,
  errorHandler: GalleryErrorHandler,
  retryManager: RetryManager
): void => {
  const originalSrc = img.src;
  const imageId = `image-${originalSrc}`;

  // Log the error
  errorHandler.logError('image-load', `Failed to load image: ${originalSrc}`, {
    imageElement: img.outerHTML,
    retryCount: retryManager.getRetryCount(imageId)
  });

  // Try to retry loading
  retryManager.executeWithRetry(
    () => new Promise<void>((resolve, reject) => {
      const testImg = new Image();
      testImg.onload = () => {
        img.src = originalSrc;
        resolve();
      };
      testImg.onerror = () => reject(new Error('Image load failed'));
      testImg.src = originalSrc;
    }),
    imageId,
    2 // Max 2 retries for images
  ).catch(() => {
    // Final fallback: show placeholder
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2NjY2NjYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
    img.alt = 'Image not available';
    img.classList.add('image-error');
  });
};

/**
 * Global error handler instance
 */
export const galleryErrorHandler = new GalleryErrorHandler();
export const retryManager = new RetryManager();

/**
 * Initialize error handling for gallery
 */
export const initializeGalleryErrorHandling = (): void => {
  // Handle image load errors
  document.addEventListener('error', (event) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'IMG' && target.closest('.gallery-item')) {
      handleImageLoadError(target as HTMLImageElement, galleryErrorHandler, retryManager);
    }
  }, true);

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('gallery')) {
      galleryErrorHandler.logError('initialization', event.reason.message, {
        stack: event.reason.stack
      });
    }
  });

  // Performance monitoring
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('img') || entry.name.includes('image')) {
            galleryErrorHandler.recordLoadTime(entry.duration);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Performance monitoring not available:', error);
    }
  }

  // Log initialization success
  console.log('Gallery error handling initialized');
};