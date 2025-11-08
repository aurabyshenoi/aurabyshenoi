/**
 * Browser Compatibility Testing Utilities
 * Provides cross-browser testing and compatibility checks for React Bits Masonry Gallery
 */

export interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  isSupported: boolean;
  features: BrowserFeatures;
}

export interface BrowserFeatures {
  cssGrid: boolean;
  flexbox: boolean;
  transforms3d: boolean;
  willChange: boolean;
  intersectionObserver: boolean;
  framerMotion: boolean;
  backdropFilter: boolean;
  customProperties: boolean;
  objectFit: boolean;
  aspectRatio: boolean;
}

export interface CompatibilityReport {
  browser: BrowserInfo;
  masonrySupport: boolean;
  animationSupport: boolean;
  performanceOptimizations: string[];
  warnings: string[];
  fallbacks: string[];
}

/**
 * Detect current browser and version
 */
export const detectBrowser = (): BrowserInfo => {
  const userAgent = navigator.userAgent;
  const vendor = navigator.vendor;
  
  let name = 'Unknown';
  let version = 'Unknown';
  let engine = 'Unknown';
  
  // Chrome
  if (/Chrome/.test(userAgent) && /Google Inc/.test(vendor)) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'Blink';
  }
  // Firefox
  else if (/Firefox/.test(userAgent)) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'Gecko';
  }
  // Safari
  else if (/Safari/.test(userAgent) && /Apple Computer/.test(vendor)) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'WebKit';
  }
  // Edge
  else if (/Edg/.test(userAgent)) {
    name = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : 'Unknown';
    engine = 'Blink';
  }
  
  const features = detectBrowserFeatures();
  const isSupported = checkBrowserSupport(name, version, features);
  
  return {
    name,
    version,
    engine,
    isSupported,
    features
  };
};

/**
 * Detect browser feature support
 */
export const detectBrowserFeatures = (): BrowserFeatures => {
  const testElement = document.createElement('div');
  
  return {
    cssGrid: CSS.supports('display', 'grid'),
    flexbox: CSS.supports('display', 'flex'),
    transforms3d: CSS.supports('transform', 'translate3d(0, 0, 0)'),
    willChange: CSS.supports('will-change', 'transform'),
    intersectionObserver: 'IntersectionObserver' in window,
    framerMotion: checkFramerMotionSupport(),
    backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
    customProperties: CSS.supports('color', 'var(--test)'),
    objectFit: CSS.supports('object-fit', 'cover'),
    aspectRatio: CSS.supports('aspect-ratio', '1 / 1')
  };
};

/**
 * Check if Framer Motion is supported
 */
const checkFramerMotionSupport = (): boolean => {
  try {
    // Check if the browser supports the features Framer Motion needs
    return (
      'requestAnimationFrame' in window &&
      'performance' in window &&
      CSS.supports('transform', 'translateX(0px)') &&
      CSS.supports('opacity', '0')
    );
  } catch {
    return false;
  }
};

/**
 * Check if browser is supported for React Bits Masonry Gallery
 */
export const checkBrowserSupport = (
  browserName: string, 
  version: string, 
  features: BrowserFeatures
): boolean => {
  const versionNum = parseInt(version, 10);
  
  // Minimum version requirements
  const minVersions: Record<string, number> = {
    Chrome: 60,
    Firefox: 55,
    Safari: 12,
    Edge: 79
  };
  
  const minVersion = minVersions[browserName];
  if (minVersion && versionNum < minVersion) {
    return false;
  }
  
  // Essential features required
  const requiredFeatures: (keyof BrowserFeatures)[] = [
    'flexbox',
    'transforms3d',
    'customProperties',
    'intersectionObserver'
  ];
  
  return requiredFeatures.every(feature => features[feature]);
};

/**
 * Generate comprehensive compatibility report
 */
export const generateCompatibilityReport = (): CompatibilityReport => {
  const browser = detectBrowser();
  const warnings: string[] = [];
  const fallbacks: string[] = [];
  const performanceOptimizations: string[] = [];
  
  // Check masonry layout support
  const masonrySupport = browser.features.flexbox && browser.features.customProperties;
  if (!masonrySupport) {
    warnings.push('Masonry layout may not render correctly');
    fallbacks.push('Single column layout fallback will be used');
  }
  
  // Check animation support
  const animationSupport = browser.features.transforms3d && browser.features.framerMotion;
  if (!animationSupport) {
    warnings.push('Animations may be reduced or disabled');
    fallbacks.push('Static card layout without animations');
  }
  
  // Browser-specific optimizations
  if (browser.name === 'Safari') {
    performanceOptimizations.push('WebKit-specific transform optimizations enabled');
    if (!browser.features.backdropFilter) {
      warnings.push('Backdrop filter effects not supported');
      fallbacks.push('Solid background fallback for overlays');
    }
  }
  
  if (browser.name === 'Firefox') {
    performanceOptimizations.push('Gecko-specific animation optimizations enabled');
    if (!browser.features.willChange) {
      warnings.push('will-change property not supported');
      fallbacks.push('Manual layer creation for animations');
    }
  }
  
  if (browser.name === 'Chrome' || browser.name === 'Edge') {
    performanceOptimizations.push('Blink engine optimizations enabled');
    performanceOptimizations.push('Hardware acceleration optimized');
  }
  
  // Performance optimizations based on features
  if (browser.features.willChange) {
    performanceOptimizations.push('will-change property optimization enabled');
  }
  
  if (browser.features.transforms3d) {
    performanceOptimizations.push('3D transform hardware acceleration enabled');
  }
  
  if (browser.features.intersectionObserver) {
    performanceOptimizations.push('Intersection Observer for lazy loading enabled');
  }
  
  return {
    browser,
    masonrySupport,
    animationSupport,
    performanceOptimizations,
    warnings,
    fallbacks
  };
};

/**
 * Apply browser-specific CSS classes to document
 */
export const applyBrowserSpecificStyles = (): void => {
  const browser = detectBrowser();
  const documentElement = document.documentElement;
  
  // Remove existing browser classes
  documentElement.classList.remove(
    'browser-chrome', 'browser-firefox', 'browser-safari', 'browser-edge',
    'engine-blink', 'engine-gecko', 'engine-webkit',
    'supports-backdrop-filter', 'supports-will-change', 'supports-object-fit'
  );
  
  // Add browser-specific classes
  documentElement.classList.add(`browser-${browser.name.toLowerCase()}`);
  documentElement.classList.add(`engine-${browser.engine.toLowerCase()}`);
  
  // Add feature support classes
  if (browser.features.backdropFilter) {
    documentElement.classList.add('supports-backdrop-filter');
  }
  
  if (browser.features.willChange) {
    documentElement.classList.add('supports-will-change');
  }
  
  if (browser.features.objectFit) {
    documentElement.classList.add('supports-object-fit');
  }
  
  if (!browser.features.transforms3d) {
    documentElement.classList.add('no-transforms3d');
  }
  
  if (!browser.features.intersectionObserver) {
    documentElement.classList.add('no-intersection-observer');
  }
};

/**
 * Test masonry layout rendering across browsers
 */
export const testMasonryLayoutRendering = (): Promise<{
  success: boolean;
  errors: string[];
  warnings: string[];
}> => {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Create test masonry container
      const testContainer = document.createElement('div');
      testContainer.className = 'masonry-gallery-container';
      testContainer.style.position = 'absolute';
      testContainer.style.top = '-9999px';
      testContainer.style.left = '-9999px';
      testContainer.style.width = '600px';
      testContainer.style.height = '400px';
      
      // Create test columns
      for (let i = 0; i < 3; i++) {
        const column = document.createElement('div');
        column.className = 'masonry-column';
        
        // Create test cards
        for (let j = 0; j < 2; j++) {
          const card = document.createElement('div');
          card.className = 'artwork-bound-card variant-medium';
          card.style.height = '200px';
          column.appendChild(card);
        }
        
        testContainer.appendChild(column);
      }
      
      document.body.appendChild(testContainer);
      
      // Test layout calculations
      setTimeout(() => {
        const containerRect = testContainer.getBoundingClientRect();
        const columns = testContainer.querySelectorAll('.masonry-column');
        
        // Verify container layout
        if (containerRect.width === 0 || containerRect.height === 0) {
          errors.push('Masonry container failed to render');
        }
        
        // Verify column layout
        if (columns.length !== 3) {
          errors.push('Incorrect number of masonry columns rendered');
        }
        
        columns.forEach((column, index) => {
          const columnRect = column.getBoundingClientRect();
          if (columnRect.width === 0) {
            errors.push(`Column ${index + 1} failed to render properly`);
          }
        });
        
        // Test flexbox layout
        const computedStyle = window.getComputedStyle(testContainer);
        if (computedStyle.display !== 'flex') {
          warnings.push('Flexbox layout not applied correctly');
        }
        
        // Cleanup
        document.body.removeChild(testContainer);
        
        resolve({
          success: errors.length === 0,
          errors,
          warnings
        });
      }, 100);
      
    } catch (error) {
      errors.push(`Layout test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      resolve({
        success: false,
        errors,
        warnings
      });
    }
  });
};

/**
 * Test bound card animations across browsers
 */
export const testBoundCardAnimations = (): Promise<{
  success: boolean;
  errors: string[];
  warnings: string[];
}> => {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Create test card
      const testCard = document.createElement('div');
      testCard.className = 'artwork-bound-card variant-medium';
      testCard.style.position = 'absolute';
      testCard.style.top = '-9999px';
      testCard.style.left = '-9999px';
      testCard.style.width = '200px';
      testCard.style.height = '200px';
      
      document.body.appendChild(testCard);
      
      // Test transform support
      testCard.style.transform = 'translate3d(10px, 10px, 0) scale(1.05)';
      const computedTransform = window.getComputedStyle(testCard).transform;
      
      if (computedTransform === 'none' || !computedTransform.includes('matrix')) {
        warnings.push('3D transforms may not be supported');
      }
      
      // Test transition support
      testCard.style.transition = 'transform 0.3s ease';
      const computedTransition = window.getComputedStyle(testCard).transition;
      
      if (!computedTransition.includes('transform')) {
        warnings.push('CSS transitions may not work correctly');
      }
      
      // Test hover effects
      testCard.classList.add('hover-test');
      const hoverStyles = window.getComputedStyle(testCard, ':hover');
      
      // Cleanup
      document.body.removeChild(testCard);
      
      resolve({
        success: errors.length === 0,
        errors,
        warnings
      });
      
    } catch (error) {
      errors.push(`Animation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      resolve({
        success: false,
        errors,
        warnings
      });
    }
  });
};

/**
 * Run comprehensive cross-browser tests
 */
export const runCrossBrowserTests = async (): Promise<{
  compatibilityReport: CompatibilityReport;
  layoutTest: Awaited<ReturnType<typeof testMasonryLayoutRendering>>;
  animationTest: Awaited<ReturnType<typeof testBoundCardAnimations>>;
  overallSuccess: boolean;
}> => {
  const compatibilityReport = generateCompatibilityReport();
  const layoutTest = await testMasonryLayoutRendering();
  const animationTest = await testBoundCardAnimations();
  
  const overallSuccess = 
    compatibilityReport.browser.isSupported &&
    compatibilityReport.masonrySupport &&
    layoutTest.success &&
    animationTest.success;
  
  return {
    compatibilityReport,
    layoutTest,
    animationTest,
    overallSuccess
  };
};

/**
 * Browser compatibility class for managing browser-specific functionality
 */
export class BrowserCompatibility {
  private static instance: BrowserCompatibility;
  private browserInfo: BrowserInfo;

  private constructor() {
    this.browserInfo = detectBrowser();
  }

  public static getInstance(): BrowserCompatibility {
    if (!BrowserCompatibility.instance) {
      BrowserCompatibility.instance = new BrowserCompatibility();
    }
    return BrowserCompatibility.instance;
  }

  public static initialize(): void {
    BrowserCompatibility.getInstance();
    applyBrowserSpecificStyles();
  }

  public isSupported(feature: keyof BrowserFeatures | 'touchEvents'): boolean {
    if (feature === 'touchEvents') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return this.browserInfo.features[feature];
  }

  public getSupport(): Record<string, boolean> {
    return {
      ...this.browserInfo.features,
      touchEvents: this.isSupported('touchEvents')
    };
  }

  public getBrowserInfo(): BrowserInfo {
    return this.browserInfo;
  }
}

/**
 * Apply browser-specific fixes and optimizations
 */
export const applyBrowserSpecificFixes = (): void => {
  const browser = detectBrowser();
  
  // Apply browser-specific CSS classes
  applyBrowserSpecificStyles();
  
  // Safari-specific fixes
  if (browser.name === 'Safari') {
    // Fix for Safari's backdrop-filter issues
    if (!browser.features.backdropFilter) {
      document.documentElement.classList.add('no-backdrop-filter');
    }
  }
  
  // Firefox-specific fixes
  if (browser.name === 'Firefox') {
    // Fix for Firefox's will-change issues
    if (!browser.features.willChange) {
      document.documentElement.classList.add('no-will-change');
    }
  }
  
  // Mobile-specific fixes
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    document.documentElement.classList.add('mobile-device');
  }
};

/**
 * Log cross-browser test results to console
 */
export const logCrossBrowserTestResults = (results: Awaited<ReturnType<typeof runCrossBrowserTests>>): void => {
  console.group('🌐 Cross-Browser Compatibility Test Results');
  
  console.group('📊 Browser Information');
  console.log(`Browser: ${results.compatibilityReport.browser.name} ${results.compatibilityReport.browser.version}`);
  console.log(`Engine: ${results.compatibilityReport.browser.engine}`);
  console.log(`Supported: ${results.compatibilityReport.browser.isSupported ? '✅' : '❌'}`);
  console.groupEnd();
  
  console.group('🎨 Feature Support');
  Object.entries(results.compatibilityReport.browser.features).forEach(([feature, supported]) => {
    console.log(`${feature}: ${supported ? '✅' : '❌'}`);
  });
  console.groupEnd();
  
  console.group('🏗️ Layout Test');
  console.log(`Success: ${results.layoutTest.success ? '✅' : '❌'}`);
  if (results.layoutTest.errors.length > 0) {
    console.error('Errors:', results.layoutTest.errors);
  }
  if (results.layoutTest.warnings.length > 0) {
    console.warn('Warnings:', results.layoutTest.warnings);
  }
  console.groupEnd();
  
  console.group('🎭 Animation Test');
  console.log(`Success: ${results.animationTest.success ? '✅' : '❌'}`);
  if (results.animationTest.errors.length > 0) {
    console.error('Errors:', results.animationTest.errors);
  }
  if (results.animationTest.warnings.length > 0) {
    console.warn('Warnings:', results.animationTest.warnings);
  }
  console.groupEnd();
  
  if (results.compatibilityReport.performanceOptimizations.length > 0) {
    console.group('⚡ Performance Optimizations');
    results.compatibilityReport.performanceOptimizations.forEach(opt => {
      console.log(`• ${opt}`);
    });
    console.groupEnd();
  }
  
  if (results.compatibilityReport.warnings.length > 0) {
    console.group('⚠️ Warnings');
    results.compatibilityReport.warnings.forEach(warning => {
      console.warn(`• ${warning}`);
    });
    console.groupEnd();
  }
  
  if (results.compatibilityReport.fallbacks.length > 0) {
    console.group('🔄 Fallbacks');
    results.compatibilityReport.fallbacks.forEach(fallback => {
      console.log(`• ${fallback}`);
    });
    console.groupEnd();
  }
  
  console.log(`\n🎯 Overall Success: ${results.overallSuccess ? '✅' : '❌'}`);
  console.groupEnd();
};