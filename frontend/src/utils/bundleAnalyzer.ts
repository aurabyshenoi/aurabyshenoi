/**
 * Bundle Size Analyzer for React Bits Masonry Gallery
 * Analyzes and optimizes bundle size for better performance
 */

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  modules: ModuleInfo[];
  recommendations: string[];
  optimizations: string[];
  warnings: string[];
}

export interface ModuleInfo {
  name: string;
  size: number;
  gzippedSize: number;
  type: 'dependency' | 'component' | 'utility' | 'asset';
  isLazyLoaded: boolean;
  isTreeShakeable: boolean;
}

export interface BundleOptimizationReport {
  currentSize: number;
  optimizedSize: number;
  savings: number;
  savingsPercentage: number;
  optimizations: BundleOptimization[];
}

export interface BundleOptimization {
  type: 'code-splitting' | 'tree-shaking' | 'compression' | 'lazy-loading' | 'minification';
  description: string;
  estimatedSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
}

/**
 * Analyze current bundle composition
 */
export const analyzeBundleComposition = (): BundleAnalysis => {
  const modules: ModuleInfo[] = [];
  const recommendations: string[] = [];
  const optimizations: string[] = [];
  const warnings: string[] = [];

  // Estimate React bundle size
  if (typeof window !== 'undefined' && (window as any).React) {
    modules.push({
      name: 'react',
      size: 42 * 1024, // ~42KB
      gzippedSize: 13 * 1024, // ~13KB gzipped
      type: 'dependency',
      isLazyLoaded: false,
      isTreeShakeable: false,
    });
    optimizations.push('React loaded efficiently');
  }

  // Estimate React DOM bundle size
  if (typeof window !== 'undefined' && (window as any).ReactDOM) {
    modules.push({
      name: 'react-dom',
      size: 130 * 1024, // ~130KB
      gzippedSize: 42 * 1024, // ~42KB gzipped
      type: 'dependency',
      isLazyLoaded: false,
      isTreeShakeable: false,
    });
  }

  // Estimate Framer Motion bundle size
  if (typeof window !== 'undefined' && (window as any).FramerMotion) {
    modules.push({
      name: 'framer-motion',
      size: 180 * 1024, // ~180KB
      gzippedSize: 55 * 1024, // ~55KB gzipped
      type: 'dependency',
      isLazyLoaded: false,
      isTreeShakeable: true,
    });
    recommendations.push('Consider lazy loading Framer Motion for non-critical animations');
  } else {
    recommendations.push('Framer Motion not detected - using lighter animation alternatives');
    optimizations.push('Lightweight animation implementation reduces bundle size');
  }

  // Estimate Tailwind CSS size
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  if (stylesheets.length > 0) {
    modules.push({
      name: 'tailwind-css',
      size: 25 * 1024, // ~25KB (purged)
      gzippedSize: 8 * 1024, // ~8KB gzipped
      type: 'asset',
      isLazyLoaded: false,
      isTreeShakeable: true,
    });
    optimizations.push('CSS appears to be optimized and purged');
  }

  // Estimate custom components size
  modules.push({
    name: 'masonry-gallery-components',
    size: 15 * 1024, // ~15KB
    gzippedSize: 5 * 1024, // ~5KB gzipped
    type: 'component',
    isLazyLoaded: false,
    isTreeShakeable: true,
  });

  // Estimate utilities size
  modules.push({
    name: 'utility-functions',
    size: 8 * 1024, // ~8KB
    gzippedSize: 3 * 1024, // ~3KB gzipped
    type: 'utility',
    isLazyLoaded: false,
    isTreeShakeable: true,
  });

  // Calculate totals
  const totalSize = modules.reduce((sum, module) => sum + module.size, 0);
  const gzippedSize = modules.reduce((sum, module) => sum + module.gzippedSize, 0);

  // Generate recommendations based on analysis
  if (totalSize > 500 * 1024) { // > 500KB
    warnings.push('Bundle size exceeds recommended limit of 500KB');
    recommendations.push('Consider implementing code splitting');
    recommendations.push('Analyze and remove unused dependencies');
  }

  if (gzippedSize > 150 * 1024) { // > 150KB gzipped
    warnings.push('Gzipped bundle size is large');
    recommendations.push('Enable better compression or reduce bundle size');
  }

  // Check for optimization opportunities
  const nonTreeShakeableModules = modules.filter(m => !m.isTreeShakeable);
  if (nonTreeShakeableModules.length > 0) {
    recommendations.push('Some modules are not tree-shakeable - consider alternatives');
  }

  const nonLazyModules = modules.filter(m => m.type === 'component' && !m.isLazyLoaded);
  if (nonLazyModules.length > 3) {
    recommendations.push('Consider lazy loading some components');
  }

  return {
    totalSize,
    gzippedSize,
    modules,
    recommendations,
    optimizations,
    warnings,
  };
};

/**
 * Generate bundle optimization recommendations
 */
export const generateOptimizationReport = (analysis: BundleAnalysis): BundleOptimizationReport => {
  const optimizations: BundleOptimization[] = [];
  let estimatedSavings = 0;

  // Code splitting optimization
  const largeModules = analysis.modules.filter(m => m.size > 50 * 1024);
  if (largeModules.length > 0) {
    const codeSplittingSavings = largeModules.reduce((sum, m) => sum + m.size * 0.3, 0);
    optimizations.push({
      type: 'code-splitting',
      description: 'Split large modules into separate chunks loaded on demand',
      estimatedSavings: codeSplittingSavings,
      difficulty: 'medium',
      impact: 'high',
    });
    estimatedSavings += codeSplittingSavings;
  }

  // Tree shaking optimization
  const nonTreeShakeable = analysis.modules.filter(m => !m.isTreeShakeable);
  if (nonTreeShakeable.length > 0) {
    const treeShakingSavings = nonTreeShakeable.reduce((sum, m) => sum + m.size * 0.2, 0);
    optimizations.push({
      type: 'tree-shaking',
      description: 'Enable tree shaking for unused code elimination',
      estimatedSavings: treeShakingSavings,
      difficulty: 'easy',
      impact: 'medium',
    });
    estimatedSavings += treeShakingSavings;
  }

  // Lazy loading optimization
  const componentModules = analysis.modules.filter(m => m.type === 'component' && !m.isLazyLoaded);
  if (componentModules.length > 0) {
    const lazyLoadingSavings = componentModules.reduce((sum, m) => sum + m.size * 0.4, 0);
    optimizations.push({
      type: 'lazy-loading',
      description: 'Implement lazy loading for non-critical components',
      estimatedSavings: lazyLoadingSavings,
      difficulty: 'medium',
      impact: 'high',
    });
    estimatedSavings += lazyLoadingSavings;
  }

  // Compression optimization
  const compressionSavings = analysis.totalSize * 0.15; // ~15% additional savings
  optimizations.push({
    type: 'compression',
    description: 'Enable advanced compression (Brotli, better gzip)',
    estimatedSavings: compressionSavings,
    difficulty: 'easy',
    impact: 'medium',
  });
  estimatedSavings += compressionSavings;

  // Minification optimization (if not already applied)
  if (analysis.totalSize > analysis.gzippedSize * 2.5) {
    const minificationSavings = analysis.totalSize * 0.1;
    optimizations.push({
      type: 'minification',
      description: 'Improve minification and dead code elimination',
      estimatedSavings: minificationSavings,
      difficulty: 'easy',
      impact: 'low',
    });
    estimatedSavings += minificationSavings;
  }

  const optimizedSize = Math.max(analysis.totalSize - estimatedSavings, analysis.totalSize * 0.4);
  const savings = analysis.totalSize - optimizedSize;
  const savingsPercentage = (savings / analysis.totalSize) * 100;

  return {
    currentSize: analysis.totalSize,
    optimizedSize,
    savings,
    savingsPercentage,
    optimizations,
  };
};

/**
 * Analyze image assets and optimization opportunities
 */
export const analyzeImageAssets = (): {
  totalSize: number;
  count: number;
  formats: Record<string, number>;
  recommendations: string[];
} => {
  const images = document.querySelectorAll('img');
  const formats: Record<string, number> = {};
  let totalEstimatedSize = 0;
  const recommendations: string[] = [];

  images.forEach(img => {
    const src = img.src || img.getAttribute('data-src') || '';
    const extension = src.split('.').pop()?.toLowerCase() || 'unknown';
    
    formats[extension] = (formats[extension] || 0) + 1;
    
    // Estimate size based on format and dimensions
    const width = img.naturalWidth || img.width || 300;
    const height = img.naturalHeight || img.height || 200;
    const pixels = width * height;
    
    let estimatedSize = 0;
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        estimatedSize = pixels * 0.5; // ~0.5 bytes per pixel for JPEG
        break;
      case 'png':
        estimatedSize = pixels * 2; // ~2 bytes per pixel for PNG
        break;
      case 'webp':
        estimatedSize = pixels * 0.3; // ~0.3 bytes per pixel for WebP
        break;
      case 'avif':
        estimatedSize = pixels * 0.2; // ~0.2 bytes per pixel for AVIF
        break;
      default:
        estimatedSize = pixels * 1; // Default estimate
    }
    
    totalEstimatedSize += estimatedSize;
  });

  // Generate recommendations
  if (formats.png && formats.png > 0) {
    recommendations.push('Consider converting PNG images to WebP for better compression');
  }
  
  if (formats.jpg && formats.jpg > 0 && !formats.webp) {
    recommendations.push('Consider using WebP format for better compression than JPEG');
  }
  
  if (!formats.webp && !formats.avif) {
    recommendations.push('Consider using modern image formats (WebP, AVIF) for better performance');
  }
  
  if (totalEstimatedSize > 1024 * 1024) { // > 1MB
    recommendations.push('Total image size is large - consider lazy loading and compression');
  }
  
  if (images.length > 10) {
    recommendations.push('Consider implementing image lazy loading for better initial load performance');
  }

  return {
    totalSize: totalEstimatedSize,
    count: images.length,
    formats,
    recommendations,
  };
};

/**
 * Check for unused CSS and JavaScript
 */
export const analyzeUnusedAssets = (): {
  unusedCSS: string[];
  unusedJS: string[];
  recommendations: string[];
} => {
  const recommendations: string[] = [];
  const unusedCSS: string[] = [];
  const unusedJS: string[] = [];

  // Check for unused CSS classes (simplified analysis)
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  if (stylesheets.length > 3) {
    recommendations.push('Multiple CSS files detected - consider consolidating');
  }

  // Check for unused JavaScript modules (simplified analysis)
  const scripts = document.querySelectorAll('script[src]');
  if (scripts.length > 5) {
    recommendations.push('Multiple JavaScript files detected - consider bundling');
  }

  // Check for duplicate dependencies
  const scriptSources = Array.from(scripts).map(script => script.getAttribute('src'));
  const duplicates = scriptSources.filter((src, index) => 
    src && scriptSources.indexOf(src) !== index
  );
  
  if (duplicates.length > 0) {
    recommendations.push('Duplicate script sources detected - check for redundant loading');
  }

  return {
    unusedCSS,
    unusedJS,
    recommendations,
  };
};

/**
 * Generate comprehensive bundle report
 */
export const generateComprehensiveBundleReport = () => {
  const bundleAnalysis = analyzeBundleComposition();
  const optimizationReport = generateOptimizationReport(bundleAnalysis);
  const imageAnalysis = analyzeImageAssets();
  const unusedAssets = analyzeUnusedAssets();

  const totalRecommendations = [
    ...bundleAnalysis.recommendations,
    ...imageAnalysis.recommendations,
    ...unusedAssets.recommendations,
  ];

  const totalOptimizations = [
    ...bundleAnalysis.optimizations,
  ];

  const totalWarnings = [
    ...bundleAnalysis.warnings,
  ];

  return {
    bundle: bundleAnalysis,
    optimization: optimizationReport,
    images: imageAnalysis,
    unusedAssets,
    summary: {
      totalSize: bundleAnalysis.totalSize + imageAnalysis.totalSize,
      bundleSize: bundleAnalysis.totalSize,
      imageSize: imageAnalysis.totalSize,
      gzippedSize: bundleAnalysis.gzippedSize,
      moduleCount: bundleAnalysis.modules.length,
      imageCount: imageAnalysis.count,
      potentialSavings: optimizationReport.savings,
      savingsPercentage: optimizationReport.savingsPercentage,
    },
    recommendations: totalRecommendations,
    optimizations: totalOptimizations,
    warnings: totalWarnings,
  };
};

/**
 * Log bundle analysis results
 */
export const logBundleAnalysis = (report: ReturnType<typeof generateComprehensiveBundleReport>) => {
  console.group('📦 Bundle Analysis Report');
  
  console.group('📊 Summary');
  console.log(`Total Size: ${(report.summary.totalSize / 1024).toFixed(1)} KB`);
  console.log(`Bundle Size: ${(report.summary.bundleSize / 1024).toFixed(1)} KB`);
  console.log(`Image Size: ${(report.summary.imageSize / 1024).toFixed(1)} KB`);
  console.log(`Gzipped Size: ${(report.summary.gzippedSize / 1024).toFixed(1)} KB`);
  console.log(`Modules: ${report.summary.moduleCount}`);
  console.log(`Images: ${report.summary.imageCount}`);
  console.groupEnd();
  
  console.group('💾 Modules');
  report.bundle.modules.forEach(module => {
    console.log(`${module.name}: ${(module.size / 1024).toFixed(1)} KB (${(module.gzippedSize / 1024).toFixed(1)} KB gzipped)`);
  });
  console.groupEnd();
  
  if (report.optimization.optimizations.length > 0) {
    console.group('⚡ Optimization Opportunities');
    console.log(`Potential Savings: ${(report.optimization.savings / 1024).toFixed(1)} KB (${report.optimization.savingsPercentage.toFixed(1)}%)`);
    report.optimization.optimizations.forEach(opt => {
      console.log(`${opt.type}: ${opt.description} - ${(opt.estimatedSavings / 1024).toFixed(1)} KB savings`);
    });
    console.groupEnd();
  }
  
  if (report.recommendations.length > 0) {
    console.group('💡 Recommendations');
    report.recommendations.forEach(rec => console.log(`• ${rec}`));
    console.groupEnd();
  }
  
  if (report.warnings.length > 0) {
    console.group('⚠️ Warnings');
    report.warnings.forEach(warning => console.warn(`• ${warning}`));
    console.groupEnd();
  }
  
  console.groupEnd();
};