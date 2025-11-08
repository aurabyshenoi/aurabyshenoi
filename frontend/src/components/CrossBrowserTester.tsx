/**
 * CrossBrowserTester Component
 * Comprehensive testing component for React Bits Masonry Gallery cross-browser compatibility
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  runCrossBrowserTests, 
  logCrossBrowserTestResults,
  applyBrowserSpecificStyles,
  type CompatibilityReport 
} from '../utils/browserCompatibility';
import { 
  testMasonryGalleryPerformance, 
  logPerformanceResults,
  analyzeBundleSize,
  testDevicePerformance,
  MasonryPerformanceMonitor,
  type PerformanceReport 
} from '../utils/performanceMonitor';

interface CrossBrowserTesterProps {
  galleryElement?: HTMLElement | null;
  imageUrls?: string[];
  onTestComplete?: (results: TestResults) => void;
  autoRun?: boolean;
  showUI?: boolean;
}

interface TestResults {
  crossBrowserResults: Awaited<ReturnType<typeof runCrossBrowserTests>>;
  performanceResults: PerformanceReport;
  bundleAnalysis: ReturnType<typeof analyzeBundleSize>;
  deviceAnalysis: Awaited<ReturnType<typeof testDevicePerformance>>;
  overallScore: number;
  recommendations: string[];
}

const CrossBrowserTester: React.FC<CrossBrowserTesterProps> = ({
  galleryElement,
  imageUrls = [],
  onTestComplete,
  autoRun = false,
  showUI = true
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const testContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Apply browser-specific styles on mount
    applyBrowserSpecificStyles();
    
    if (autoRun) {
      runTests();
    }
  }, [autoRun]);

  const runTests = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setCurrentTest('Initializing tests...');

    try {
      // Step 1: Cross-browser compatibility tests
      setCurrentTest('Running cross-browser compatibility tests...');
      setProgress(20);
      const crossBrowserResults = await runCrossBrowserTests();
      logCrossBrowserTestResults(crossBrowserResults);

      // Step 2: Performance tests
      setCurrentTest('Testing performance metrics...');
      setProgress(40);
      const performanceResults = await testMasonryGalleryPerformance(
        galleryElement || testContainerRef.current!,
        imageUrls
      );
      logPerformanceResults(performanceResults);

      // Step 3: Bundle analysis
      setCurrentTest('Analyzing bundle size...');
      setProgress(60);
      const bundleAnalysis = analyzeBundleSize();

      // Step 4: Device performance analysis
      setCurrentTest('Analyzing device performance...');
      setProgress(80);
      const deviceAnalysis = await testDevicePerformance();

      // Step 5: Calculate overall score and recommendations
      setCurrentTest('Generating recommendations...');
      setProgress(90);
      
      const overallScore = calculateOverallScore(
        crossBrowserResults,
        performanceResults,
        bundleAnalysis,
        deviceAnalysis
      );

      const recommendations = generateRecommendations(
        crossBrowserResults,
        performanceResults,
        bundleAnalysis,
        deviceAnalysis
      );

      const finalResults: TestResults = {
        crossBrowserResults,
        performanceResults,
        bundleAnalysis,
        deviceAnalysis,
        overallScore,
        recommendations
      };

      setResults(finalResults);
      setProgress(100);
      setCurrentTest('Tests completed!');

      // Log comprehensive results
      logComprehensiveResults(finalResults);

      if (onTestComplete) {
        onTestComplete(finalResults);
      }

    } catch (error) {
      console.error('Cross-browser testing failed:', error);
      setCurrentTest(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const calculateOverallScore = (
    crossBrowser: Awaited<ReturnType<typeof runCrossBrowserTests>>,
    performance: PerformanceReport,
    bundle: ReturnType<typeof analyzeBundleSize>,
    device: Awaited<ReturnType<typeof testDevicePerformance>>
  ): number => {
    let score = 0;
    
    // Cross-browser compatibility (40% weight)
    if (crossBrowser.overallSuccess) {
      score += 40;
    } else {
      // Partial credit based on individual test results
      if (crossBrowser.compatibilityReport.browser.isSupported) score += 15;
      if (crossBrowser.compatibilityReport.masonrySupport) score += 10;
      if (crossBrowser.layoutTest.success) score += 10;
      if (crossBrowser.animationTest.success) score += 5;
    }
    
    // Performance (35% weight)
    score += (performance.score / 100) * 35;
    
    // Bundle optimization (15% weight)
    if (bundle.estimatedSize < 100) {
      score += 15;
    } else if (bundle.estimatedSize < 200) {
      score += 10;
    } else {
      score += 5;
    }
    
    // Device compatibility (10% weight)
    if (device.performance === 'high') {
      score += 10;
    } else if (device.performance === 'medium') {
      score += 7;
    } else {
      score += 4;
    }
    
    return Math.round(Math.max(0, Math.min(100, score)));
  };

  const generateRecommendations = (
    crossBrowser: Awaited<ReturnType<typeof runCrossBrowserTests>>,
    performance: PerformanceReport,
    bundle: ReturnType<typeof analyzeBundleSize>,
    device: Awaited<ReturnType<typeof testDevicePerformance>>
  ): string[] => {
    const recommendations: string[] = [];
    
    // Cross-browser recommendations
    if (crossBrowser.compatibilityReport.warnings.length > 0) {
      recommendations.push('Address browser compatibility warnings');
    }
    
    if (!crossBrowser.layoutTest.success) {
      recommendations.push('Fix masonry layout rendering issues');
    }
    
    if (!crossBrowser.animationTest.success) {
      recommendations.push('Optimize animations for better cross-browser support');
    }
    
    // Performance recommendations
    recommendations.push(...performance.recommendations);
    
    // Bundle recommendations
    recommendations.push(...bundle.recommendations);
    
    // Device recommendations
    recommendations.push(...device.recommendations);
    
    // Remove duplicates
    return [...new Set(recommendations)];
  };

  const logComprehensiveResults = (results: TestResults) => {
    console.group('🎯 Comprehensive Cross-Browser & Performance Test Results');
    
    console.log(`Overall Score: ${results.overallScore}/100`);
    
    console.group('📊 Test Summary');
    console.log(`Browser Compatibility: ${results.crossBrowserResults.overallSuccess ? '✅' : '❌'}`);
    console.log(`Performance Score: ${results.performanceResults.score}/100`);
    console.log(`Bundle Size: ${results.bundleAnalysis.estimatedSize}KB`);
    console.log(`Device Performance: ${results.deviceAnalysis.performance}`);
    console.groupEnd();
    
    if (results.recommendations.length > 0) {
      console.group('💡 Priority Recommendations');
      results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  };

  if (!showUI) {
    return (
      <div ref={testContainerRef} style={{ display: 'none' }}>
        {/* Hidden test container for programmatic testing */}
      </div>
    );
  }

  return (
    <div className="cross-browser-tester p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Cross-Browser & Performance Tester
        </h2>
        <p className="text-gray-600">
          Comprehensive testing for React Bits Masonry Gallery compatibility and performance
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isRunning
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>

      {isRunning && (
        <div className="mb-6">
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{currentTest}</span>
              <span>{progress}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-blue-600">
                {results.overallScore}/100
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      results.overallScore >= 80
                        ? 'bg-green-500'
                        : results.overallScore >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${results.overallScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Browser Compatibility */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Browser Compatibility</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Browser</p>
                <p className="font-semibold">
                  {results.crossBrowserResults.compatibilityReport.browser.name}{' '}
                  {results.crossBrowserResults.compatibilityReport.browser.version}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`font-semibold ${
                  results.crossBrowserResults.overallSuccess ? 'text-green-600' : 'text-red-600'
                }`}>
                  {results.crossBrowserResults.overallSuccess ? 'Fully Compatible' : 'Issues Detected'}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Frame Rate</p>
                <p className="font-semibold">{results.performanceResults.metrics.animationFrameRate.toFixed(1)} FPS</p>
              </div>
              <div>
                <p className="text-gray-600">Memory Usage</p>
                <p className="font-semibold">{results.performanceResults.metrics.memoryUsage.toFixed(1)} MB</p>
              </div>
              <div>
                <p className="text-gray-600">Load Time</p>
                <p className="font-semibold">{results.performanceResults.metrics.imageLoadTime.toFixed(0)}ms</p>
              </div>
              <div>
                <p className="text-gray-600">Interaction</p>
                <p className="font-semibold">{results.performanceResults.metrics.interactionLatency.toFixed(0)}ms</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-yellow-800">Recommendations</h3>
              <ul className="space-y-2">
                {results.recommendations.slice(0, 5).map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span className="text-yellow-800">{rec}</span>
                  </li>
                ))}
              </ul>
              {results.recommendations.length > 5 && (
                <p className="text-sm text-yellow-700 mt-2">
                  +{results.recommendations.length - 5} more recommendations (see console for details)
                </p>
              )}
            </div>
          )}

          {/* Device Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Device Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Device Type</p>
                <p className="font-semibold capitalize">{results.deviceAnalysis.deviceType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Performance Level</p>
                <p className={`font-semibold capitalize ${
                  results.deviceAnalysis.performance === 'high'
                    ? 'text-green-600'
                    : results.deviceAnalysis.performance === 'medium'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {results.deviceAnalysis.performance}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden test container */}
      <div ref={testContainerRef} style={{ display: 'none' }}>
        <div className="masonry-gallery-container">
          <div className="masonry-column">
            <div className="artwork-bound-card variant-medium" style={{ height: '200px' }}>
              <img src="/placeholder-painting.svg" alt="Test" className="artwork-image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrossBrowserTester;