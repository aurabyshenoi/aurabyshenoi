/**
 * Performance Testing Script for React Bits Masonry Gallery
 * Comprehensive performance testing and optimization validation
 */

import { 
  runCrossBrowserTests, 
  logCrossBrowserTestResults,
  applyBrowserSpecificStyles 
} from '../utils/browserCompatibility';
import { 
  testMasonryGalleryPerformance, 
  logPerformanceResults,
  testDevicePerformance,
  MasonryPerformanceMonitor 
} from '../utils/performanceMonitor';
import { 
  generateComprehensiveBundleReport, 
  logBundleAnalysis 
} from '../utils/bundleAnalyzer';
import { 
  getPerformanceConfig,
  performanceBudgets 
} from '../config/performanceConfig';

export interface PerformanceTestSuite {
  crossBrowserTests: boolean;
  performanceMetrics: boolean;
  bundleAnalysis: boolean;
  deviceAnalysis: boolean;
  loadTesting: boolean;
  accessibilityTests: boolean;
}

export interface PerformanceTestResults {
  crossBrowser: Awaited<ReturnType<typeof runCrossBrowserTests>> | null;
  performance: Awaited<ReturnType<typeof testMasonryGalleryPerformance>> | null;
  bundle: ReturnType<typeof generateComprehensiveBundleReport> | null;
  device: Awaited<ReturnType<typeof testDevicePerformance>> | null;
  loadTest: LoadTestResults | null;
  accessibility: AccessibilityTestResults | null;
  overallScore: number;
  recommendations: string[];
  criticalIssues: string[];
}

export interface LoadTestResults {
  initialLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  success: boolean;
  issues: string[];
}

export interface AccessibilityTestResults {
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  colorContrast: boolean;
  focusManagement: boolean;
  ariaLabels: boolean;
  issues: string[];
  score: number;
}

/**
 * Run comprehensive performance test suite
 */
export const runPerformanceTestSuite = async (
  testSuite: Partial<PerformanceTestSuite> = {},
  galleryElement?: HTMLElement
): Promise<PerformanceTestResults> => {
  const {
    crossBrowserTests = true,
    performanceMetrics = true,
    bundleAnalysis = true,
    deviceAnalysis = true,
    loadTesting = true,
    accessibilityTests = true,
  } = testSuite;

  console.log('🚀 Starting comprehensive performance test suite...');
  
  const results: PerformanceTestResults = {
    crossBrowser: null,
    performance: null,
    bundle: null,
    device: null,
    loadTest: null,
    accessibility: null,
    overallScore: 0,
    recommendations: [],
    criticalIssues: [],
  };

  try {
    // Apply browser-specific optimizations
    applyBrowserSpecificStyles();

    // 1. Cross-browser compatibility tests
    if (crossBrowserTests) {
      console.log('🌐 Running cross-browser compatibility tests...');
      results.crossBrowser = await runCrossBrowserTests();
      logCrossBrowserTestResults(results.crossBrowser);
    }

    // 2. Performance metrics testing
    if (performanceMetrics && galleryElement) {
      console.log('⚡ Testing performance metrics...');
      results.performance = await testMasonryGalleryPerformance(galleryElement, []);
      logPerformanceResults(results.performance);
    }

    // 3. Bundle analysis
    if (bundleAnalysis) {
      console.log('📦 Analyzing bundle composition...');
      results.bundle = generateComprehensiveBundleReport();
      logBundleAnalysis(results.bundle);
    }

    // 4. Device analysis
    if (deviceAnalysis) {
      console.log('📱 Analyzing device capabilities...');
      results.device = await testDevicePerformance();
    }

    // 5. Load testing
    if (loadTesting) {
      console.log('🔄 Running load performance tests...');
      results.loadTest = await runLoadTests();
    }

    // 6. Accessibility testing
    if (accessibilityTests && galleryElement) {
      console.log('♿ Testing accessibility compliance...');
      results.accessibility = await runAccessibilityTests(galleryElement);
    }

    // Calculate overall score and generate recommendations
    const analysis = analyzeTestResults(results);
    results.overallScore = analysis.overallScore;
    results.recommendations = analysis.recommendations;
    results.criticalIssues = analysis.criticalIssues;

    // Log final results
    logFinalResults(results);

    return results;

  } catch (error) {
    console.error('❌ Performance test suite failed:', error);
    results.criticalIssues.push(`Test suite execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return results;
  }
};

/**
 * Run load performance tests
 */
const runLoadTests = async (): Promise<LoadTestResults> => {
  const results: LoadTestResults = {
    initialLoadTime: 0,
    timeToInteractive: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    success: true,
    issues: [],
  };

  try {
    // Use Performance API if available
    if ('performance' in window && performance.getEntriesByType) {
      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        results.initialLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        results.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
      }

      // Get paint timing
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        results.firstContentfulPaint = fcp.startTime;
      }

      // Get LCP if available
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              results.largestContentfulPaint = lastEntry.startTime;
            }
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Wait a bit for LCP to be captured
          await new Promise(resolve => setTimeout(resolve, 1000));
          observer.disconnect();
        } catch (error) {
          console.warn('LCP measurement failed:', error);
        }
      }
    }

    // Validate against performance budgets
    if (results.firstContentfulPaint > performanceBudgets.firstContentfulPaint) {
      results.issues.push(`First Contentful Paint (${results.firstContentfulPaint.toFixed(0)}ms) exceeds budget (${performanceBudgets.firstContentfulPaint}ms)`);
      results.success = false;
    }

    if (results.largestContentfulPaint > performanceBudgets.largestContentfulPaint) {
      results.issues.push(`Largest Contentful Paint (${results.largestContentfulPaint.toFixed(0)}ms) exceeds budget (${performanceBudgets.largestContentfulPaint}ms)`);
      results.success = false;
    }

    if (results.cumulativeLayoutShift > performanceBudgets.cumulativeLayoutShift) {
      results.issues.push(`Cumulative Layout Shift (${results.cumulativeLayoutShift.toFixed(3)}) exceeds budget (${performanceBudgets.cumulativeLayoutShift})`);
      results.success = false;
    }

  } catch (error) {
    results.issues.push(`Load testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    results.success = false;
  }

  return results;
};

/**
 * Run accessibility tests
 */
const runAccessibilityTests = async (galleryElement: HTMLElement): Promise<AccessibilityTestResults> => {
  const results: AccessibilityTestResults = {
    keyboardNavigation: false,
    screenReaderSupport: false,
    colorContrast: false,
    focusManagement: false,
    ariaLabels: false,
    issues: [],
    score: 0,
  };

  try {
    // Test keyboard navigation
    const focusableElements = galleryElement.querySelectorAll('[tabindex], button, [role="button"]');
    results.keyboardNavigation = focusableElements.length > 0;
    if (!results.keyboardNavigation) {
      results.issues.push('No focusable elements found for keyboard navigation');
    }

    // Test ARIA labels
    const ariaLabels = galleryElement.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
    results.ariaLabels = ariaLabels.length > 0;
    if (!results.ariaLabels) {
      results.issues.push('Missing ARIA labels for accessibility');
    }

    // Test screen reader support
    const semanticElements = galleryElement.querySelectorAll('[role], section, article, nav, main, aside');
    results.screenReaderSupport = semanticElements.length > 0;
    if (!results.screenReaderSupport) {
      results.issues.push('Limited semantic markup for screen readers');
    }

    // Test focus management
    const focusableCards = galleryElement.querySelectorAll('.artwork-bound-card[tabindex="0"]');
    results.focusManagement = focusableCards.length > 0;
    if (!results.focusManagement) {
      results.issues.push('Cards are not properly focusable');
    }

    // Basic color contrast check (simplified)
    const computedStyle = window.getComputedStyle(galleryElement);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    results.colorContrast = backgroundColor !== color; // Very basic check
    if (!results.colorContrast) {
      results.issues.push('Potential color contrast issues detected');
    }

    // Calculate accessibility score
    const checks = [
      results.keyboardNavigation,
      results.screenReaderSupport,
      results.colorContrast,
      results.focusManagement,
      results.ariaLabels,
    ];
    results.score = (checks.filter(Boolean).length / checks.length) * 100;

  } catch (error) {
    results.issues.push(`Accessibility testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return results;
};

/**
 * Analyze test results and generate recommendations
 */
const analyzeTestResults = (results: PerformanceTestResults): {
  overallScore: number;
  recommendations: string[];
  criticalIssues: string[];
} => {
  const recommendations: string[] = [];
  const criticalIssues: string[] = [];
  let totalScore = 0;
  let scoreCount = 0;

  // Cross-browser compatibility (25% weight)
  if (results.crossBrowser) {
    const crossBrowserScore = results.crossBrowser.overallSuccess ? 100 : 50;
    totalScore += crossBrowserScore * 0.25;
    scoreCount++;

    if (!results.crossBrowser.overallSuccess) {
      criticalIssues.push('Cross-browser compatibility issues detected');
      recommendations.push('Address browser compatibility warnings');
    }
  }

  // Performance metrics (30% weight)
  if (results.performance) {
    totalScore += results.performance.score * 0.30;
    scoreCount++;

    if (results.performance.score < 70) {
      criticalIssues.push('Performance metrics below acceptable threshold');
    }
    recommendations.push(...results.performance.recommendations);
  }

  // Bundle analysis (20% weight)
  if (results.bundle) {
    const bundleScore = results.bundle.summary.totalSize < 500 * 1024 ? 100 : 
                      results.bundle.summary.totalSize < 1024 * 1024 ? 70 : 40;
    totalScore += bundleScore * 0.20;
    scoreCount++;

    if (bundleScore < 70) {
      criticalIssues.push('Bundle size exceeds recommended limits');
    }
    recommendations.push(...results.bundle.recommendations);
  }

  // Load testing (15% weight)
  if (results.loadTest) {
    const loadScore = results.loadTest.success ? 100 : 50;
    totalScore += loadScore * 0.15;
    scoreCount++;

    if (!results.loadTest.success) {
      criticalIssues.push('Load performance issues detected');
      recommendations.push('Optimize loading performance');
    }
  }

  // Accessibility (10% weight)
  if (results.accessibility) {
    totalScore += results.accessibility.score * 0.10;
    scoreCount++;

    if (results.accessibility.score < 80) {
      criticalIssues.push('Accessibility compliance issues');
      recommendations.push('Improve accessibility compliance');
    }
  }

  const overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

  // Add general recommendations based on overall score
  if (overallScore < 70) {
    recommendations.unshift('Overall performance needs significant improvement');
  } else if (overallScore < 85) {
    recommendations.unshift('Good performance with room for optimization');
  }

  return {
    overallScore,
    recommendations: [...new Set(recommendations)], // Remove duplicates
    criticalIssues: [...new Set(criticalIssues)], // Remove duplicates
  };
};

/**
 * Log final test results
 */
const logFinalResults = (results: PerformanceTestResults) => {
  console.group('🎯 Final Performance Test Results');
  
  console.log(`Overall Score: ${results.overallScore}/100`);
  
  if (results.criticalIssues.length > 0) {
    console.group('🚨 Critical Issues');
    results.criticalIssues.forEach(issue => console.error(`• ${issue}`));
    console.groupEnd();
  }
  
  if (results.recommendations.length > 0) {
    console.group('💡 Recommendations');
    results.recommendations.slice(0, 10).forEach(rec => console.log(`• ${rec}`));
    if (results.recommendations.length > 10) {
      console.log(`... and ${results.recommendations.length - 10} more recommendations`);
    }
    console.groupEnd();
  }
  
  // Individual test results summary
  console.group('📊 Test Results Summary');
  if (results.crossBrowser) {
    console.log(`Cross-Browser: ${results.crossBrowser.overallSuccess ? '✅' : '❌'}`);
  }
  if (results.performance) {
    console.log(`Performance: ${results.performance.score}/100`);
  }
  if (results.bundle) {
    console.log(`Bundle Size: ${(results.bundle.summary.totalSize / 1024).toFixed(1)} KB`);
  }
  if (results.loadTest) {
    console.log(`Load Performance: ${results.loadTest.success ? '✅' : '❌'}`);
  }
  if (results.accessibility) {
    console.log(`Accessibility: ${results.accessibility.score.toFixed(0)}/100`);
  }
  console.groupEnd();
  
  console.groupEnd();
};

/**
 * Run performance tests for production deployment
 */
export const runProductionPerformanceTests = async (galleryElement?: HTMLElement) => {
  console.log('🏭 Running production performance validation...');
  
  const results = await runPerformanceTestSuite({
    crossBrowserTests: true,
    performanceMetrics: true,
    bundleAnalysis: true,
    deviceAnalysis: true,
    loadTesting: true,
    accessibilityTests: true,
  }, galleryElement);
  
  // Validate against production criteria
  const productionCriteria = {
    minimumScore: 80,
    maxBundleSize: 500 * 1024, // 500KB
    maxLoadTime: 3000, // 3 seconds
    requiredAccessibilityScore: 90,
  };
  
  const isProductionReady = 
    results.overallScore >= productionCriteria.minimumScore &&
    (results.bundle?.summary.totalSize || 0) <= productionCriteria.maxBundleSize &&
    (results.loadTest?.initialLoadTime || 0) <= productionCriteria.maxLoadTime &&
    (results.accessibility?.score || 0) >= productionCriteria.requiredAccessibilityScore;
  
  console.log(`\n🎯 Production Ready: ${isProductionReady ? '✅' : '❌'}`);
  
  if (!isProductionReady) {
    console.group('🚨 Production Blockers');
    if (results.overallScore < productionCriteria.minimumScore) {
      console.error(`Overall score (${results.overallScore}) below minimum (${productionCriteria.minimumScore})`);
    }
    if ((results.bundle?.summary.totalSize || 0) > productionCriteria.maxBundleSize) {
      console.error(`Bundle size (${((results.bundle?.summary.totalSize || 0) / 1024).toFixed(1)}KB) exceeds limit (${productionCriteria.maxBundleSize / 1024}KB)`);
    }
    if ((results.loadTest?.initialLoadTime || 0) > productionCriteria.maxLoadTime) {
      console.error(`Load time (${results.loadTest?.initialLoadTime}ms) exceeds limit (${productionCriteria.maxLoadTime}ms)`);
    }
    if ((results.accessibility?.score || 0) < productionCriteria.requiredAccessibilityScore) {
      console.error(`Accessibility score (${results.accessibility?.score}) below requirement (${productionCriteria.requiredAccessibilityScore})`);
    }
    console.groupEnd();
  }
  
  return {
    ...results,
    isProductionReady,
    productionCriteria,
  };
};

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).runPerformanceTests = runPerformanceTestSuite;
  (window as any).runProductionTests = runProductionPerformanceTests;
}