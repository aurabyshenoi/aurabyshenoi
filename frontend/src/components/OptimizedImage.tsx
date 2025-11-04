import React, { useState, useRef, useEffect } from 'react';
import { generateSrcSet, getOptimizedImageUrl } from '../utils/imagePreloader';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  fallbackSrc?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  // Progressive loading options
  lowQualitySrc?: string;
  showPlaceholder?: boolean;
  placeholderColor?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholderClassName = '',
  fallbackSrc = '/placeholder-painting.svg',
  sizes,
  loading = 'lazy',
  onLoad,
  onError,
  lowQualitySrc,
  showPlaceholder = true,
  placeholderColor = '#f3f4f6',
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [hasLoadedHighRes, setHasLoadedHighRes] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Progressive loading: load high-res image after low-res is loaded
  useEffect(() => {
    if (!isInView || !lowQualitySrc || hasLoadedHighRes) return;

    const highResImage = new Image();
    highResImage.onload = () => {
      setCurrentSrc(src);
      setHasLoadedHighRes(true);
    };
    highResImage.onerror = () => {
      // If high-res fails, stick with low-res
      console.warn('Failed to load high-resolution image:', src);
    };
    highResImage.src = src;
  }, [isInView, lowQualitySrc, src, hasLoadedHighRes]);

  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleError = () => {
    setImageState('error');
    setCurrentSrc(fallbackSrc);
    onError?.();
  };

  const handleRetry = () => {
    setImageState('loading');
    setCurrentSrc(src);
  };

  // Placeholder component
  const Placeholder = () => (
    <div
      className={`flex items-center justify-center bg-gray-200 ${placeholderClassName}`}
      style={{ backgroundColor: placeholderColor }}
    >
      {imageState === 'loading' ? (
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-green"></div>
          <span className="text-xs text-gray-500">Loading...</span>
        </div>
      ) : imageState === 'error' ? (
        <div className="flex flex-col items-center space-y-2 p-4 text-center">
          <svg
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-xs text-gray-500">Failed to load image</span>
          <button
            onClick={handleRetry}
            className="text-xs text-sage-green hover:text-sage-green-dark underline"
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Show placeholder while loading or if showPlaceholder is true */}
      {(imageState === 'loading' || (showPlaceholder && imageState !== 'loaded')) && (
        <div className="absolute inset-0">
          <Placeholder />
        </div>
      )}

      {/* Main image */}
      {isInView && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          srcSet={generateSrcSet(src)}
          sizes={sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            filter: lowQualitySrc && !hasLoadedHighRes ? 'blur(2px)' : 'none',
            transition: 'filter 0.3s ease-in-out, opacity 0.3s ease-in-out',
          }}
        />
      )}

      {/* Progressive loading indicator */}
      {lowQualitySrc && !hasLoadedHighRes && imageState === 'loaded' && (
        <div className="absolute top-2 right-2">
          <div className="bg-black bg-opacity-50 rounded-full p-1">
            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for generating responsive image URLs
export const useResponsiveImageUrls = (baseUrl: string) => {
  const generateCloudinaryUrl = (width: number, quality: string = 'auto') => {
    // If it's already a Cloudinary URL, modify it
    if (baseUrl.includes('cloudinary.com')) {
      const parts = baseUrl.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/w_${width},q_${quality},f_auto/${parts[1]}`;
      }
    }
    return baseUrl;
  };

  return {
    thumbnail: generateCloudinaryUrl(400, '60'), // Low quality for progressive loading
    small: generateCloudinaryUrl(600),
    medium: generateCloudinaryUrl(800),
    large: generateCloudinaryUrl(1200),
    xlarge: generateCloudinaryUrl(1600),
    original: baseUrl,
  };
};