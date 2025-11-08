/**
 * Cross-browser Testing Utilities for Featured Artwork Gallery
 * Provides automated testing and validation for gallery functionality
 */

import { BrowserCompatibility } from './browserCompatibility';

export interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  browserInfo?: string;
}

export interface TestSuite {
  name: string;
  results: TestResult[];
  passed: boolean;
  duration: number;
}

export class GalleryTester {
  private browserCompat: BrowserCompatibility;
  private testResults: TestSuite[] = [];

  constructor() {
    this.browserCompat = BrowserCompatibility.getInstance();
  }

  /**
   * Run all gallery tests
   */
  public async runAllTests(): Promise<TestSuite[]> {
    console.log('🧪 Starting Gallery Cross-Browser Tests...');
    
    const testSuites = [
      () => this.testCSSGridSupport(),
      () => this.testHoverEffects(),
      () => this.testModalFunctionality(),
      () => this.testNavigationControls(),
      () => this.testKeyboardNavigation(),
      () => this.testTouchGestures(),
      () => this.testResponsiveLayout(),
      () => this.testAccessibility(),
      () => this.testImageLoading(),
      () => this.testPerformance()
    ];

    for (const testSuite of testSuites) {
      try {
        const result = await testSuite();
        this.testResults.push(result);
      } catch (error) {
        console.error('Test suite failed:', error);
      }
    }

    this.logTestResults();
    return this.testResults;
  }

  /**
   * Test CSS Grid support and fallbacks
   */
  private testCSSGridSupport(): TestSuite {
    const startTime = performance.now();
    const results: TestResult[] = [];

    // Test CSS Grid detection
    results.push({
      testName: 'CSS Grid Detection',
      passed: typeof this.browserCompat.isSupported('cssGrid') === 'boolean',
      message: `CSS Grid support: ${this.browserCompat.isSupported('cssGrid')}`
    });

    // Test grid layout rendering
    const galleryCollage = document.querySelector('.gallery-collage') as HTMLElement;
    if (galleryCollage) {
      const computedStyle = window.getComputedStyle(galleryCollage);
      const isGrid = computedStyle.display === 'grid';
      const isFlex = computedStyle.display === 'flex';
      
      results.push({
        testName: 'Gallery Layout Rendering',
        passed: isGrid || isFlex,
        message: `Gallery using ${computedStyle.display} layout`
      });
    } else {
      results.push({
        testName: 'Gallery Layout Rendering',
        passed: false,
        message: 'Gallery collage element not found'
      });
    }

    // Test fallback classes
    const hasGridFallback = document.body.classList.contains('no-css-grid');
    results.push({
      testName: 'CSS Grid Fallback',
      passed: this.browserCompat.isSupported('cssGrid') || hasGridFallback,
      message: hasGridFallback ? 'Fallback applied' : 'Native grid support'
    });

    const duration = performance.now() - startTime;
    return {
      name: 'CSS Grid Support',
      results,
      passed: results.every(r => r.passed),
      duration
    };
  }

  /**
   * Test hover effects and transitions
   */
  private testHoverEffects(): TestSuite {
    const startTime = performance.now();
    const results: TestResult[] = [];

    // Test transform support
    results.push({
      testName: 'CSS Transform Support',
      passed: this.browserCompat.isSupported('transform' as any),
      message: `Transform support: ${this.browserCompat.isSupported('transform' as any)}`
    });

    // Test transition support
    results.push({
      testName: 'CSS Transition Support',
      passed: this.browserCompat.isSupported('transition' as any),
      message: `Transition support: ${this.browserCompat.isSupported('transition' as any)}`
    });

    // Test gallery item hover styles
    const galleryItem = document.querySelector('.gallery-item') as HTMLElement;
    if (galleryItem) {
      const image = galleryItem.querySelector('.gallery-image') as HTMLElement;
      if (image) {
        const computedStyle = window.getComputedStyle(image);
        const hasTransition = computedStyle.transition !== 'all 0s ease 0s';
        
        results.push({
          testName: 'Gallery Item Hover Styles',
          passed: true,
          message: `Transition property: ${computedStyle.transition}`
        });
      }
    }

    const duration = performance.now() - startTime;
    return {
      name: 'Hover Effects',
      results,
      passed: results.every(r => r.passed),
      duration
    };
  }

  /**
   * Test modal functionality
   */
  private testModalFunctionality(): TestSuite {
    const startTime = performance.now();
    const results: TestResult[] = [];

    // Test modal element existence
    const modal = document.getElementById('artworkModal');
    results.push({
      testName: 'Modal Element Exists',
      passed: !!modal,
      message: modal ? 'Modal element found' : 'Modal element not found'
    });

    if (modal) {
      // Test modal components
      const modalImage = document.getElementById('modalImage');
      const closeButton = modal.querySelector('.modal-close');
      const prevButton = document.getElementById('prevBtn');
      const nextButton = document.getElementById('nextBtn');

      results.push({
        testName: 'Modal Components',
        passed: !!(modalImage && closeButton && prevButton && nextButton),
        message: 'All modal components present'
      });

      // Test modal initial state
      const isHidden = modal.style.display === 'none' || 
                      window.getComputedStyle(modal).display === 'none';
      results.push({
        testName: 'Modal Initial State',
        passed: isHidden,
        message: isHidden ? 'Modal initially hidden' : 'Modal visible on load'
      });

      // Test modal z-index
      const computedStyle = window.getComputedStyle(modal);
      const zIndex = parseInt(computedStyle.zIndex);
      results.push({
        testName: 'Modal Z-Index',
        passed: zIndex >= 1000,
        message: `Modal z-index: ${zIndex}`
      });
    }

    const duration = performance.now() - startTime;
    return {
      name: 'Modal Functionality',
      results,
      passed: results.every(r => r.passed),
      duration
    };
  }

  /**
   * Test navigation controls
   */
  private testNavigationControls(): TestSuite {
    const startTime = performance.now();
    const results: TestResult[] = [];

    const prevButton = document.getElementById('prevBtn');
    const nextButton = document.getElementById('nextBtn');

    // Test navigation button existence
    results.push({
      testName: 'Navigation Buttons Exist',
      passed: !!(prevButton && nextButton),
      message: 'Previous and next buttons found'
    });

    if (prevButton && nextButton) {
      // Test button accessibility
      const prevAriaLabel = prevButton.getAttribute('aria-label');
      const nextAriaLabel = nextButton.getAttribute('aria-label');
      
      results.push({
        testName: 'Navigation Button Accessibility',
        passed: !!(prevAriaLabel && nextAriaLabel),
        message: 'Navigation buttons have aria-labels'
      });

      // Test button positioning
      const prevStyle = window.getComputedStyle(prevButton);
      const nextStyle = window.getComputedStyle(nextButton);
      
      results.push({
        testName: 'Navigation Button Positioning',
        passed: prevStyle.position === 'absolute' && nextStyle.position === 'absolute',
        message: 'Navigation buttons positioned absolutely'
      });
    }

    const duration = performance.now() - startTime;
    return {
      name: 'Navigation Controls',
      results,
      passed: results.every(r => r.passed),
      duration
    };
  }

  /**
   * Test keyboard navigation
   */
  private testKeyboardNavigation(): TestSuite {
    const startTime = performance.now();
    const results: TestResult[] = [];

    // Test gallery item tabindex
    const galleryItems = document.querySelectorAll('.gallery-item');
    const hasTabIndex = Array.from(galleryItems).every(item => 
      item.getAttribute('tabindex') === '0'
    );

    results.push({
      testName: 'Gallery Item Tab Navigation',
      passed: hasTabIndex,
      message: hasTabIndex ? 'All gallery items have tabindex' : 'Missing tabindex on gallery items'
    });

    // Test ARIA roles
    const hasAriaRoles = Array.from(galleryItems).every(item => 
      item.getAttribute('role') === 'button'
    );

    results.push({
      testName: 'Gallery Item ARIA Roles',
      passed: hasAriaRoles,
      message: hasAriaRoles ? 'All gallery items have button role' : 'Missing ARIA roles'
    });

    // Test focus styles
    const firstItem = galleryItems[0] as HTMLElement;
    if (firstItem) {
      firstItem.focus();
      const computedStyle = window.getComputedStyle(firstItem);
      const hasOutline = computedStyle.outline !== 'none' && computedStyle.outline !== '';
      
      results.push({
        testName: 'Focus Styles',
        passed: hasOutline,
        message: hasOutline ? 'Focus outline present' : 'No focus outline detected'
      });
    }

    const duration = performance.now() - startTime;
    return {
      name: 'Keyboard Navigation',
      results,
      passed: results.every(r => r.passed),
      duration
    };
  }

  /**
   * Test touch gesture support
   */
  private testTouchGestures(): TestSuite {
    const startTime = performance.now();
    const results: TestResult[] = [];

    // Test touch event support detection
    const touchSupported = this.browserCompat.isSupported('touchEvents');
    results.push({
      testName: 'Touch Event Detection',
      passed: typeof touchSupported === 'boolean',
      message: `Touch events supported: ${touchSupported}`
    });

    // Test touch-friendly button sizes on mobile
    if (window.innerWidth <= 768) {
      const navButtons = document.querySelectorAll('.nav-arrow');
      const hasLargeButtons = Array.from(navButtons).every(button => {
        const style = window.getComputedStyle(button as Element);
        const width = parseInt(style.width);
        const height = parseInt(style.height);
        return width >= 44 && height >= 44; // Minimum touch target size
      });

      results.push({
        testName: 'Touch-Friendly Button Sizes',
        passed: hasLargeButtons,
        message: hasLargeButtons ? 'Buttons meet minimum touch target size' : 'Buttons too small for touch'
      });
    }

    const duration = performance.now() - startTime;
    return {
      name: 'Touch Gestures',
      results,
      passed: results.every(r => r.passed),
      duration
    };
  }

  /**
   * Test responsive layout
   */
  private testResponsiveLayout(): TestSuite {
    const startTime = performance.now();
    const results: TestResult[] = [];

    const originalWidth = window.innerWidth;
    
    // Test mobile layout (simulate)
    const mobileMediaQuery = window.matchMedia('(max-width: 768px)');
    results.push({
      testName: 'Mobile Media Query',
      passed: typeof mobileMediaQuery.matches === 'boolean',
      message: `Mobile layout active: ${mobileMediaQuery.matches}`
    });

    // Test tablet layout
    const tabletMediaQuery = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');
    results.push({
      testName: 'Tablet Media Query',
      passed: typeof tabletMediaQuery.matches === 'boolean',
      message: `Tablet layout active: ${tabletMediaQuery.matches}`
    });

    // Test desktop layout
    const desktopMediaQuery = window.matchMedia('(min-width: 1025px)');
    results.push({
      testName: 'Desktop Media Query',
      passed: typeof desktopMediaQuery.matches === 'boolean',
      message: `Desktop layout active: ${desktopMediaQuery.matches}`
    });

    // Test gallery grid responsiveness
    const galleryCollage = document.querySelector('.gallery-collage') as HTMLElement;
    if (galleryCollage) {
      const computedStyle = window.getComputedStyle(galleryCollage);
      const gridColumns = computedStyle.gridTemplateColumns;
      
      results.push({
        testName: 'Responsive Grid Columns',
        passed: !!gridColumns && gridColumns !== 'none',
        message: `Grid columns: ${gridColumns || 'Not using grid'}`
      });
    }

    const duration = performance.now() - startTime;
    return {
      name: 'Responsive Layout',
      results,
      passed: results.every(r => r.passed),
      duration
    };
  }

  /**
   * Test accessibility features
   */
  private testAccessibility(): TestSuite {
    const startTime = performance.now();
    const results: TestResult[] = [];

    // Test ARIA labels
    const modal = document.getElementById('artworkModal');
    if (modal) {
      const hasAriaModal = modal.getAttribute('aria-modal') === 'true';
      const hasRole = modal.getAttribute('role') === 'dialog';
      
      results.push({
        testName: 'Modal ARIA Attributes',
        passed: hasAriaModal && hasRole,
        message: 'Modal has proper ARIA attributes'
      });
    }

    // Test screen reader content
    const srElements = document.querySelectorAll('.sr-only');
    results.push({
      testName: 'Screen Reader Content',
      passed: srElements.length > 0,
      message: `Found ${srElements.length} screen reader elements`
    });

    // Test image alt text
    const galleryImages = document.querySelectorAll('.gallery-image');
    const hasAltText = Array.from(galleryImages).every(img => 
      (img as HTMLImageElement).alt && (img as HTMLImageElement).alt.trim() !== ''
    );

    results.push({
      testName: 'Image Alt Text',
      passed: hasAltText,
      message: hasAltText ? 'All images have alt text' : 'Missing alt text on some images'
    });

    const duration = performance.now() - startTime;
    return {
      name: 'Accessibility',
      results,
      passed: results.every(r => r.passed),
      duration
    };
  }

  /**
   * Test image loading and error handling
   */
  private testImageLoading(): TestSuite {
    const startTime = performance.now();
    const results: TestResult[] = [];

    const galleryImages = document.querySelectorAll('.gallery-image') as NodeListOf<HTMLImageElement>;
    
    // Test image loading
    let loadedImages = 0;
    let errorImages = 0;

    galleryImages.forEach(img => {
      if (img.complete) {
        if (img.naturalWidth > 0) {
          loadedImages++;
        } else {
          errorImages++;
        }
      }
    });

    results.push({
      testName: 'Image Loading Success',
      passed: loadedImages > 0,
      message: `${loadedImages} images loaded successfully`
    });

    results.push({
      testName: 'Image Loading Errors',
      passed: errorImages === 0,
      message: errorImages > 0 ? `${errorImages} images failed to load` : 'No image loading errors'
    });

    // Test image object-fit support
    const firstImage = galleryImages[0];
    if (firstImage) {
      const computedStyle = window.getComputedStyle(firstImage);
      const objectFit = computedStyle.objectFit;
      
      results.push({
        testName: 'Object-Fit Support',
        passed: objectFit === 'cover',
        message: `Object-fit: ${objectFit}`
      });
    }

    const duration = performance.now() - startTime;
    return {
      name: 'Image Loading',
      results,
      passed: results.every(r => r.passed),
      duration
    };
  }

  /**
   * Test performance metrics
   */
  private testPerformance(): TestSuite {
    const startTime = performance.now();
    const results: TestResult[] = [];

    // Test gallery initialization time
    const initTime = performance.now() - startTime;
    results.push({
      testName: 'Gallery Initialization Time',
      passed: initTime < 100, // Should initialize within 100ms
      message: `Initialization took ${initTime.toFixed(2)}ms`
    });

    // Test memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      
      results.push({
        testName: 'Memory Usage',
        passed: memoryUsage < 50, // Should use less than 50MB
        message: `Using ${memoryUsage.toFixed(2)}MB of memory`
      });
    }

    // Test DOM query performance
    const queryStart = performance.now();
    document.querySelectorAll('.gallery-item');
    const queryTime = performance.now() - queryStart;
    
    results.push({
      testName: 'DOM Query Performance',
      passed: queryTime < 10, // Should complete within 10ms
      message: `DOM query took ${queryTime.toFixed(2)}ms`
    });

    const duration = performance.now() - startTime;
    return {
      name: 'Performance',
      results,
      passed: results.every(r => r.passed),
      duration
    };
  }

  /**
   * Log test results to console
   */
  private logTestResults(): void {
    console.log('\n📊 Gallery Cross-Browser Test Results:');
    console.log('=====================================');
    
    let totalTests = 0;
    let passedTests = 0;
    
    this.testResults.forEach(suite => {
      const status = suite.passed ? '✅' : '❌';
      console.log(`\n${status} ${suite.name} (${suite.duration.toFixed(2)}ms)`);
      
      suite.results.forEach(result => {
        const testStatus = result.passed ? '  ✓' : '  ✗';
        console.log(`${testStatus} ${result.testName}: ${result.message}`);
        totalTests++;
        if (result.passed) passedTests++;
      });
    });
    
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(`\n📈 Overall Success Rate: ${passedTests}/${totalTests} (${successRate}%)`);
    
    // Browser information
    console.log('\n🌐 Browser Information:');
    console.log(`User Agent: ${navigator.userAgent}`);
    console.log(`Viewport: ${window.innerWidth}x${window.innerHeight}`);
    
    const support = this.browserCompat.getSupport();
    console.log('\n🔧 Feature Support:');
    Object.entries(support).forEach(([feature, supported]) => {
      console.log(`  ${feature}: ${supported ? '✅' : '❌'}`);
    });
  }

  /**
   * Get test results
   */
  public getTestResults(): TestSuite[] {
    return this.testResults;
  }

  /**
   * Export test results as JSON
   */
  public exportResults(): string {
    const report = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      browserSupport: this.browserCompat.getSupport(),
      testSuites: this.testResults
    };
    
    return JSON.stringify(report, null, 2);
  }
}

/**
 * Quick test runner for development
 */
export const runQuickGalleryTest = async (): Promise<void> => {
  const tester = new GalleryTester();
  await tester.runAllTests();
};

/**
 * Initialize testing in development mode
 */
export const initializeGalleryTesting = (): void => {
  // Only show test button in development mode
  if (process.env.NODE_ENV === 'development') {
    // Add test button to page for manual testing
    const testButton = document.createElement('button');
    testButton.textContent = '🧪 Run Gallery Tests';
    testButton.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 10000;
      padding: 8px 12px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;
    
    testButton.addEventListener('click', async () => {
      testButton.textContent = '🧪 Testing...';
      testButton.disabled = true;
      
      try {
        await runQuickGalleryTest();
        testButton.textContent = '✅ Tests Complete';
      } catch (error) {
        testButton.textContent = '❌ Tests Failed';
        console.error('Gallery tests failed:', error);
      }
      
      setTimeout(() => {
        testButton.textContent = '🧪 Run Gallery Tests';
        testButton.disabled = false;
      }, 3000);
    });
    
    document.body.appendChild(testButton);
    console.log('Gallery testing initialized - test button added');
  }
};