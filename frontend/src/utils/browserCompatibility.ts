/**
 * Browser Compatibility Utilities for Featured Artwork Gallery
 * Provides fallbacks and feature detection for cross-browser support
 */

export interface BrowserSupport {
  cssGrid: boolean;
  transforms: boolean;
  transitions: boolean;
  touchEvents: boolean;
  intersectionObserver: boolean;
  webp: boolean;
}

export class BrowserCompatibility {
  private static instance: BrowserCompatibility;
  private support: BrowserSupport;

  private constructor() {
    this.support = this.detectFeatures();
    this.applyFallbacks();
  }

  public static getInstance(): BrowserCompatibility {
    if (!BrowserCompatibility.instance) {
      BrowserCompatibility.instance = new BrowserCompatibility();
    }
    return BrowserCompatibility.instance;
  }

  /**
   * Detect browser feature support
   */
  private detectFeatures(): BrowserSupport {
    return {
      cssGrid: this.supportsCSSGrid(),
      transforms: this.supportsTransforms(),
      transitions: this.supportsTransitions(),
      touchEvents: this.supportsTouchEvents(),
      intersectionObserver: this.supportsIntersectionObserver(),
      webp: false // Will be detected asynchronously
    };
  }

  /**
   * Check CSS Grid support
   */
  private supportsCSSGrid(): boolean {
    const testElement = document.createElement('div');
    testElement.style.display = 'grid';
    return testElement.style.display === 'grid';
  }

  /**
   * Check CSS Transform support
   */
  private supportsTransforms(): boolean {
    const testElement = document.createElement('div');
    const transforms = [
      'transform',
      'WebkitTransform',
      'MozTransform',
      'msTransform',
      'OTransform'
    ];
    
    return transforms.some(transform => {
      testElement.style[transform as any] = 'scale(1)';
      return testElement.style[transform as any] !== '';
    });
  }

  /**
   * Check CSS Transition support
   */
  private supportsTransitions(): boolean {
    const testElement = document.createElement('div');
    const transitions = [
      'transition',
      'WebkitTransition',
      'MozTransition',
      'msTransition',
      'OTransition'
    ];
    
    return transitions.some(transition => {
      testElement.style[transition as any] = 'all 0.3s ease';
      return testElement.style[transition as any] !== '';
    });
  }

  /**
   * Check touch event support
   */
  private supportsTouchEvents(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Check Intersection Observer support
   */
  private supportsIntersectionObserver(): boolean {
    return 'IntersectionObserver' in window;
  }

  /**
   * Detect WebP support asynchronously
   */
  public async detectWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        const isSupported = webP.height === 2;
        this.support.webp = isSupported;
        resolve(isSupported);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Apply fallbacks for unsupported features
   */
  private applyFallbacks(): void {
    // CSS Grid fallback
    if (!this.support.cssGrid) {
      this.applyCSSGridFallback();
    }

    // Transform fallback
    if (!this.support.transforms) {
      this.applyTransformFallback();
    }

    // Transition fallback
    if (!this.support.transitions) {
      this.applyTransitionFallback();
    }

    // Touch event fallback
    if (!this.support.touchEvents) {
      this.applyTouchFallback();
    }
  }

  /**
   * Apply CSS Grid fallback using flexbox
   */
  private applyCSSGridFallback(): void {
    const style = document.createElement('style');
    style.textContent = `
      .gallery-collage {
        display: flex !important;
        flex-wrap: wrap;
        justify-content: space-between;
      }
      
      .gallery-item {
        flex: 0 0 calc(25% - 12px);
        margin-bottom: 15px;
        height: 200px;
      }
      
      .gallery-item.size-large {
        flex: 0 0 calc(50% - 8px);
        height: 415px;
      }
      
      .gallery-item.size-wide {
        flex: 0 0 calc(50% - 8px);
        height: 200px;
      }
      
      .gallery-item.size-medium,
      .gallery-item.size-tall {
        flex: 0 0 calc(25% - 12px);
        height: 415px;
      }
      
      .gallery-item.size-small {
        flex: 0 0 calc(25% - 12px);
        height: 200px;
      }
      
      @media (max-width: 768px) {
        .gallery-item {
          flex: 0 0 calc(50% - 8px);
          height: 150px;
        }
        
        .gallery-item.size-large {
          flex: 0 0 100%;
          height: 300px;
        }
        
        .gallery-item.size-wide {
          flex: 0 0 100%;
          height: 150px;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Add fallback class to body
    document.body.classList.add('no-css-grid');
  }

  /**
   * Apply transform fallback using positioning
   */
  private applyTransformFallback(): void {
    const style = document.createElement('style');
    style.textContent = `
      .no-transforms .gallery-item:hover .gallery-image {
        transform: none !important;
        position: relative;
        z-index: 10;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }
      
      .no-transforms .modal-close:hover,
      .no-transforms .nav-arrow:hover {
        transform: none !important;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('no-transforms');
  }

  /**
   * Apply transition fallback
   */
  private applyTransitionFallback(): void {
    const style = document.createElement('style');
    style.textContent = `
      .no-transitions * {
        transition: none !important;
        -webkit-transition: none !important;
        -moz-transition: none !important;
        -ms-transition: none !important;
        -o-transition: none !important;
      }
    `;
    document.head.appendChild(style);
    document.body.classList.add('no-transitions');
  }

  /**
   * Apply touch event fallback using mouse events
   */
  private applyTouchFallback(): void {
    // Add mouse event listeners as fallback for touch events
    document.body.classList.add('no-touch');
    
    // This will be handled in the gallery manager
    // by checking for touch support before adding touch listeners
  }

  /**
   * Get browser support information
   */
  public getSupport(): BrowserSupport {
    return { ...this.support };
  }

  /**
   * Check if a specific feature is supported
   */
  public isSupported(feature: keyof BrowserSupport): boolean {
    return this.support[feature];
  }

  /**
   * Add vendor prefixes for CSS properties
   */
  public addVendorPrefixes(element: HTMLElement, property: string, value: string): void {
    const prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];
    
    prefixes.forEach(prefix => {
      const prefixedProperty = prefix + property;
      try {
        (element.style as any)[this.camelCase(prefixedProperty)] = value;
      } catch (e) {
        // Ignore unsupported properties
      }
    });
  }

  /**
   * Convert kebab-case to camelCase
   */
  private camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  /**
   * Polyfill for older browsers
   */
  public loadPolyfills(): void {
    // Object.assign polyfill for IE
    if (!Object.assign) {
      Object.assign = function(target: any, ...sources: any[]) {
        if (target == null) {
          throw new TypeError('Cannot convert undefined or null to object');
        }
        
        const to = Object(target);
        
        for (let index = 0; index < sources.length; index++) {
          const nextSource = sources[index];
          
          if (nextSource != null) {
            for (const nextKey in nextSource) {
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      };
    }

    // Array.from polyfill for IE
    if (!Array.from) {
      Array.from = function(arrayLike: any, mapFn?: any, thisArg?: any) {
        const C = this;
        const items = Object(arrayLike);
        if (arrayLike == null) {
          throw new TypeError('Array.from requires an array-like object - not null or undefined');
        }
        
        const mapFunction = mapFn === undefined ? undefined : mapFn;
        if (typeof mapFunction !== 'undefined' && typeof mapFunction !== 'function') {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        
        const len = parseInt(items.length);
        const A = typeof C === 'function' ? Object(new C(len)) : new Array(len);
        
        let k = 0;
        let kValue;
        while (k < len) {
          kValue = items[k];
          if (mapFunction) {
            A[k] = typeof thisArg === 'undefined' ? mapFunction(kValue, k) : mapFunction.call(thisArg, kValue, k);
          } else {
            A[k] = kValue;
          }
          k += 1;
        }
        A.length = len;
        return A;
      };
    }

    // NodeList.forEach polyfill for IE
    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = Array.prototype.forEach;
    }
  }

  /**
   * Initialize browser compatibility checks and fallbacks
   */
  public static initialize(): BrowserCompatibility {
    const instance = BrowserCompatibility.getInstance();
    instance.loadPolyfills();
    
    // Detect WebP support asynchronously
    instance.detectWebPSupport().then(supported => {
      if (supported) {
        document.body.classList.add('webp-supported');
      } else {
        document.body.classList.add('no-webp');
      }
    });
    
    return instance;
  }
}

/**
 * Browser-specific CSS fixes
 */
export const applyBrowserSpecificFixes = (): void => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Safari-specific fixes
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    document.body.classList.add('browser-safari');
    
    const style = document.createElement('style');
    style.textContent = `
      .browser-safari .gallery-image {
        -webkit-backface-visibility: hidden;
        -webkit-transform: translateZ(0);
      }
      
      .browser-safari .modal-viewer {
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Firefox-specific fixes
  if (userAgent.includes('firefox')) {
    document.body.classList.add('browser-firefox');
    
    const style = document.createElement('style');
    style.textContent = `
      .browser-firefox .gallery-item {
        -moz-osx-font-smoothing: grayscale;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Edge-specific fixes
  if (userAgent.includes('edge')) {
    document.body.classList.add('browser-edge');
    
    const style = document.createElement('style');
    style.textContent = `
      .browser-edge .gallery-collage {
        -ms-grid-columns: 1fr 1fr 1fr 1fr;
        -ms-grid-rows: 200px 200px 200px 200px;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Internet Explorer fixes
  if (userAgent.includes('trident') || userAgent.includes('msie')) {
    document.body.classList.add('browser-ie');
    
    const style = document.createElement('style');
    style.textContent = `
      .browser-ie .gallery-collage {
        display: -ms-flexbox !important;
        -ms-flex-wrap: wrap;
        -ms-flex-pack: justify;
      }
      
      .browser-ie .gallery-item {
        -ms-flex: 0 0 calc(25% - 12px);
      }
      
      .browser-ie .modal-viewer {
        display: -ms-flexbox;
        -ms-flex-align: center;
        -ms-flex-pack: center;
      }
    `;
    document.head.appendChild(style);
  }
};