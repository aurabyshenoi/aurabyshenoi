/**
 * Gallery Manager for Featured Artwork Gallery
 * Handles modal viewing, navigation, and user interactions
 */

import { BrowserCompatibility, applyBrowserSpecificFixes } from './browserCompatibility';
import { initializeGalleryPerformance, GalleryPerformanceOptimizer } from './galleryPerformance';
import { initializeGalleryLazyLoading, LazyImageLoader } from './lazyImageLoader';
import { initializeGalleryErrorHandling, galleryErrorHandler } from './galleryErrorHandling';

export interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
  size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
}

export interface GalleryConfig {
  images: GalleryImage[];
  currentIndex: number;
  isModalOpen: boolean;
}

export class GalleryManager {
  private config: GalleryConfig;
  private modal: HTMLElement | null = null;
  private modalImage: HTMLImageElement | null = null;
  private closeButton: HTMLElement | null = null;
  private prevButton: HTMLElement | null = null;
  private nextButton: HTMLElement | null = null;
  private modalBackground: HTMLElement | null = null;
  private galleryItems: NodeListOf<Element> | null = null;
  private focusedItemIndex: number = 0;
  private lastFocusedElement: HTMLElement | null = null;
  private performanceOptimizer: GalleryPerformanceOptimizer | null = null;
  private lazyLoader: LazyImageLoader | null = null;
  
  // Touch gesture properties
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchEndX: number = 0;
  private touchEndY: number = 0;
  private minSwipeDistance: number = 50;
  private maxVerticalDistance: number = 100;

  constructor(config: GalleryConfig) {
    this.config = {
      ...config,
      currentIndex: 0,
      isModalOpen: false
    };
    
    // Initialize browser compatibility
    BrowserCompatibility.initialize();
    applyBrowserSpecificFixes();
    
    // Initialize performance optimizations
    this.performanceOptimizer = initializeGalleryPerformance();
    this.lazyLoader = initializeGalleryLazyLoading();
    
    // Initialize error handling
    initializeGalleryErrorHandling();
    
    this.init();
  }

  /**
   * Initialize the gallery manager
   */
  private init(): void {
    this.setupModalElements();
    this.setupEventListeners();
    this.setupGalleryItemListeners();
  }

  /**
   * Set up modal DOM element references
   */
  private setupModalElements(): void {
    try {
      this.modal = document.getElementById('artworkModal');
      this.modalImage = document.getElementById('modalImage') as HTMLImageElement;
      this.closeButton = this.modal?.querySelector('.modal-close') as HTMLElement;
      this.prevButton = document.getElementById('prevBtn');
      this.nextButton = document.getElementById('nextBtn');
      this.modalBackground = this.modal?.querySelector('.modal-background') as HTMLElement;

      if (!this.modal) {
        galleryErrorHandler.logError('initialization', 'Modal element not found', {
          modalId: 'artworkModal'
        });
        return;
      }

      // Initially hide the modal
      this.modal.style.display = 'none';
    } catch (error) {
      galleryErrorHandler.logError('initialization', 'Failed to setup modal elements', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Set up event listeners for modal controls
   */
  private setupEventListeners(): void {
    // Close button
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.closeModal());
    }

    // Background click to close
    if (this.modalBackground) {
      this.modalBackground.addEventListener('click', () => this.closeModal());
    }

    // Navigation buttons
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => this.navigatePrev());
    }

    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => this.navigateNext());
    }

    // Keyboard navigation
    document.addEventListener('keydown', (event) => this.handleKeydown(event));

    // Touch gesture support
    this.setupTouchListeners();
  }

  /**
   * Set up click listeners for gallery items and accessibility attributes
   */
  private setupGalleryItemListeners(): void {
    this.galleryItems = document.querySelectorAll('.gallery-item');
    
    this.galleryItems.forEach((item, index) => {
      const element = item as HTMLElement;
      
      // Add accessibility attributes
      element.setAttribute('tabindex', '0');
      element.setAttribute('role', 'button');
      element.setAttribute('aria-label', `View artwork ${index + 1} in modal`);
      
      // Click handler
      element.addEventListener('click', () => {
        const imageIndex = parseInt(element.getAttribute('data-image-index') || '0');
        this.openModal(imageIndex);
      });
      
      // Keyboard handler for gallery items
      element.addEventListener('keydown', (event) => {
        this.handleGalleryItemKeydown(event, index);
      });
    });
  }

  /**
   * Open modal with specified image index
   */
  public openModal(index: number): void {
    if (!this.modal || !this.modalImage) {
      console.error('Gallery Manager: Modal elements not found');
      return;
    }

    if (index < 0 || index >= this.config.images.length) {
      console.error('Gallery Manager: Invalid image index');
      return;
    }

    // Start performance measurement
    this.performanceOptimizer?.startMeasurement('modal-open');

    // Store the currently focused element to restore later
    this.lastFocusedElement = document.activeElement as HTMLElement;

    this.config.currentIndex = index;
    this.config.isModalOpen = true;

    // Update modal image
    this.updateModalImage();

    // Show modal
    this.modal.style.display = 'flex';
    
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    // Focus management for accessibility - focus the modal content
    if (this.closeButton) {
      this.closeButton.focus();
    } else {
      this.modal.focus();
    }

    // Trap focus within modal
    this.trapFocus();

    // End performance measurement
    setTimeout(() => {
      this.performanceOptimizer?.endMeasurement('modal-open');
    }, 0);
  }

  /**
   * Close the modal
   */
  public closeModal(): void {
    if (!this.modal) return;

    this.config.isModalOpen = false;
    this.modal.style.display = 'none';
    
    // Restore background scrolling
    document.body.style.overflow = '';

    // Remove tab handler if it exists
    if ((this.modal as any)._tabHandler) {
      this.modal.removeEventListener('keydown', (this.modal as any)._tabHandler);
      delete (this.modal as any)._tabHandler;
    }

    // Restore focus to the previously focused element
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
  }

  /**
   * Navigate to next image
   */
  public navigateNext(): void {
    if (!this.config.isModalOpen) return;

    // Start performance measurement
    this.performanceOptimizer?.startMeasurement('navigation');

    // Circular navigation: go to first image if at last
    this.config.currentIndex = (this.config.currentIndex + 1) % this.config.images.length;
    this.updateModalImage();

    // End performance measurement
    setTimeout(() => {
      this.performanceOptimizer?.endMeasurement('navigation');
    }, 0);
  }

  /**
   * Navigate to previous image
   */
  public navigatePrev(): void {
    if (!this.config.isModalOpen) return;

    // Start performance measurement
    this.performanceOptimizer?.startMeasurement('navigation');

    // Circular navigation: go to last image if at first
    this.config.currentIndex = this.config.currentIndex === 0 
      ? this.config.images.length - 1 
      : this.config.currentIndex - 1;
    this.updateModalImage();

    // End performance measurement
    setTimeout(() => {
      this.performanceOptimizer?.endMeasurement('navigation');
    }, 0);
  }

  /**
   * Update the modal image display
   */
  private updateModalImage(): void {
    if (!this.modalImage || !this.config.images[this.config.currentIndex]) {
      return;
    }

    const currentImage = this.config.images[this.config.currentIndex];
    
    // Use performance optimizer to get optimized image source
    const optimizedSrc = this.performanceOptimizer?.optimizeImage(currentImage.src) || currentImage.src;
    
    this.modalImage.src = optimizedSrc;
    this.modalImage.alt = currentImage.alt;
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeydown(event: KeyboardEvent): void {
    if (!this.config.isModalOpen) return;

    switch (event.key) {
      case 'Escape':
        this.closeModal();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.navigatePrev();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.navigateNext();
        break;
    }
  }

  /**
   * Get current gallery configuration
   */
  public getConfig(): GalleryConfig {
    return { ...this.config };
  }

  /**
   * Update gallery configuration
   */
  public updateConfig(newConfig: Partial<GalleryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Handle keyboard navigation for gallery items
   */
  private handleGalleryItemKeydown(event: KeyboardEvent, index: number): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        const imageIndex = parseInt((event.target as HTMLElement).getAttribute('data-image-index') || '0');
        this.openModal(imageIndex);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.focusNextGalleryItem();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.focusPrevGalleryItem();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusGalleryItemBelow();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusGalleryItemAbove();
        break;
    }
  }

  /**
   * Focus next gallery item
   */
  private focusNextGalleryItem(): void {
    if (!this.galleryItems) return;
    
    this.focusedItemIndex = (this.focusedItemIndex + 1) % this.galleryItems.length;
    (this.galleryItems[this.focusedItemIndex] as HTMLElement).focus();
  }

  /**
   * Focus previous gallery item
   */
  private focusPrevGalleryItem(): void {
    if (!this.galleryItems) return;
    
    this.focusedItemIndex = this.focusedItemIndex === 0 
      ? this.galleryItems.length - 1 
      : this.focusedItemIndex - 1;
    (this.galleryItems[this.focusedItemIndex] as HTMLElement).focus();
  }

  /**
   * Focus gallery item below (simplified grid navigation)
   */
  private focusGalleryItemBelow(): void {
    if (!this.galleryItems) return;
    
    // Simple implementation: move 2 items forward (approximate row navigation)
    const nextIndex = Math.min(this.focusedItemIndex + 2, this.galleryItems.length - 1);
    if (nextIndex !== this.focusedItemIndex) {
      this.focusedItemIndex = nextIndex;
      (this.galleryItems[this.focusedItemIndex] as HTMLElement).focus();
    }
  }

  /**
   * Focus gallery item above (simplified grid navigation)
   */
  private focusGalleryItemAbove(): void {
    if (!this.galleryItems) return;
    
    // Simple implementation: move 2 items backward (approximate row navigation)
    const prevIndex = Math.max(this.focusedItemIndex - 2, 0);
    if (prevIndex !== this.focusedItemIndex) {
      this.focusedItemIndex = prevIndex;
      (this.galleryItems[this.focusedItemIndex] as HTMLElement).focus();
    }
  }

  /**
   * Trap focus within modal for accessibility
   */
  private trapFocus(): void {
    if (!this.modal) return;

    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Add event listener for tab trapping
    this.modal.addEventListener('keydown', handleTabKey);

    // Store reference to remove listener later
    (this.modal as any)._tabHandler = handleTabKey;
  }

  /**
   * Set up touch event listeners for swipe gestures
   */
  private setupTouchListeners(): void {
    if (!this.modal) return;

    const browserCompat = BrowserCompatibility.getInstance();
    
    // Only add touch listeners if touch is supported
    if (!browserCompat.isSupported('touchEvents')) {
      return;
    }

    // Touch start
    this.modal.addEventListener('touchstart', (event) => {
      if (!this.config.isModalOpen) return;
      
      // Only handle single touch
      if (event.touches.length !== 1) return;
      
      const touch = event.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    }, { passive: true });

    // Touch move - prevent default to avoid scrolling during swipe
    this.modal.addEventListener('touchmove', (event) => {
      if (!this.config.isModalOpen) return;
      
      // Only prevent default for horizontal swipes
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const deltaX = Math.abs(touch.clientX - this.touchStartX);
        const deltaY = Math.abs(touch.clientY - this.touchStartY);
        
        // If horizontal movement is greater than vertical, prevent scrolling
        if (deltaX > deltaY && deltaX > 10) {
          event.preventDefault();
        }
      }
    }, { passive: false });

    // Touch end
    this.modal.addEventListener('touchend', (event) => {
      if (!this.config.isModalOpen) return;
      
      // Only handle single touch
      if (event.changedTouches.length !== 1) return;
      
      const touch = event.changedTouches[0];
      this.touchEndX = touch.clientX;
      this.touchEndY = touch.clientY;
      
      this.handleSwipeGesture();
    }, { passive: true });
  }

  /**
   * Handle swipe gesture detection and navigation
   */
  private handleSwipeGesture(): void {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = Math.abs(this.touchEndY - this.touchStartY);
    const absDeltaX = Math.abs(deltaX);
    
    // Check if it's a horizontal swipe (not vertical scroll)
    if (absDeltaX > this.minSwipeDistance && deltaY < this.maxVerticalDistance) {
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      if (deltaX > 0) {
        // Swipe right - go to previous image
        this.navigatePrev();
      } else {
        // Swipe left - go to next image
        this.navigateNext();
      }
    }
  }

  /**
   * Add visual feedback for touch interactions
   */
  private addTouchFeedback(element: HTMLElement): void {
    element.style.transform = 'scale(0.95)';
    element.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
      element.style.transform = '';
      element.style.transition = '';
    }, 100);
  }
}

/**
 * Default gallery configuration for the featured artwork section
 */
export const defaultGalleryConfig: GalleryConfig = {
  images: [
    {
      src: '/img1.jpeg',
      alt: 'Featured Artwork 1 - Abstract landscape painting with vibrant colors',
      title: 'Abstract Landscape',
      size: 'large'
    },
    {
      src: '/img2.jpeg',
      alt: 'Featured Artwork 2 - Nature scene with flowing water',
      title: 'Flowing Waters',
      size: 'medium'
    },
    {
      src: '/img3.jpeg',
      alt: 'Featured Artwork 3 - Colorful floral composition',
      title: 'Floral Composition',
      size: 'small'
    },
    {
      src: '/img4.jpeg',
      alt: 'Featured Artwork 4 - Panoramic mountain vista',
      title: 'Mountain Vista',
      size: 'wide'
    },
    {
      src: '/img5.jpeg',
      alt: 'Featured Artwork 5 - Vertical forest scene',
      title: 'Forest Scene',
      size: 'tall'
    },
    {
      src: '/img6.jpeg',
      alt: 'Featured Artwork 6 - Sunset over ocean waves',
      title: 'Ocean Sunset',
      size: 'medium'
    },
    {
      src: '/img7.jpeg',
      alt: 'Featured Artwork 7 - Serene lake reflection',
      title: 'Lake Reflection',
      size: 'small'
    },
    {
      src: '/img8.jpeg',
      alt: 'Featured Artwork 8 - Expansive desert landscape',
      title: 'Desert Landscape',
      size: 'wide'
    },
    {
      src: '/img9.jpeg',
      alt: 'Featured Artwork 9 - Urban cityscape at twilight',
      title: 'City Twilight',
      size: 'medium'
    },
    {
      src: '/img10.jpeg',
      alt: 'Featured Artwork 10 - Dramatic storm clouds',
      title: 'Storm Clouds',
      size: 'large'
    },
    {
      src: '/img11.jpeg',
      alt: 'Featured Artwork 11 - Towering redwood trees',
      title: 'Redwood Trees',
      size: 'tall'
    },
    {
      src: '/img12.jpeg',
      alt: 'Featured Artwork 12 - Delicate butterfly on flower',
      title: 'Butterfly Garden',
      size: 'small'
    }
  ],
  currentIndex: 0,
  isModalOpen: false
};