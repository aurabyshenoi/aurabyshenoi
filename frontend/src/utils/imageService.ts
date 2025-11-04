// Image upload service for Cloudinary integration with caching

export interface UploadedImage {
  originalName: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  thumbnailUrl: string;
  mediumUrl: string;
  largeUrl: string;
}

// Image cache for optimized loading
class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private preloadQueue = new Set<string>();
  private maxCacheSize = 50; // Limit cache size to prevent memory issues

  preload(src: string): Promise<HTMLImageElement> {
    if (this.cache.has(src)) {
      return Promise.resolve(this.cache.get(src)!);
    }

    if (this.preloadQueue.has(src)) {
      // Already preloading, return a promise that resolves when done
      return new Promise((resolve, reject) => {
        const checkCache = () => {
          if (this.cache.has(src)) {
            resolve(this.cache.get(src)!);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    this.preloadQueue.add(src);

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.preloadQueue.delete(src);
        
        // Manage cache size
        if (this.cache.size >= this.maxCacheSize) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }
        
        this.cache.set(src, img);
        resolve(img);
      };
      
      img.onerror = () => {
        this.preloadQueue.delete(src);
        reject(new Error(`Failed to preload image: ${src}`));
      };
      
      img.src = src;
    });
  }

  get(src: string): HTMLImageElement | null {
    return this.cache.get(src) || null;
  }

  clear(): void {
    this.cache.clear();
    this.preloadQueue.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const imageCache = new ImageCache();

export interface ImageUploadResponse {
  success: boolean;
  data?: {
    images: UploadedImage[];
  };
  message?: string;
  error?: any;
}

// Upload images to backend which handles Cloudinary upload
export const uploadImages = async (files: File[]): Promise<ImageUploadResponse> => {
  try {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await fetch('/api/admin/images/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    return result;
  } catch (error: any) {
    console.error('Error uploading images:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload images',
      error,
    };
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const encodedPublicId = encodeURIComponent(publicId);
    
    const response = await fetch(`/api/admin/images/${encodedPublicId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Delete failed');
    }

    return result;
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete image',
    };
  }
};

// Generate optimized URLs for existing images
export const generateOptimizedUrls = async (
  publicIds: string[],
  options: Record<string, any> = {}
): Promise<{
  success: boolean;
  data?: {
    optimizedUrls: Array<{
      publicId: string;
      thumbnailUrl: string;
      mediumUrl: string;
      largeUrl: string;
      originalUrl: string;
    }>;
  };
  message?: string;
}> => {
  try {
    const response = await fetch('/api/admin/images/optimize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicIds, options }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Optimization failed');
    }

    return result;
  } catch (error: any) {
    console.error('Error generating optimized URLs:', error);
    return {
      success: false,
      message: error.message || 'Failed to generate optimized URLs',
    };
  }
};

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedFormats.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Supported formats: JPEG, PNG, WebP, GIF' 
    };
  }

  return { valid: true };
};

// Extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
      return null;
    }

    // Get the part after 'upload', skip transformations if any
    let publicIdPart = urlParts[urlParts.length - 1];
    
    // Remove file extension
    const lastDotIndex = publicIdPart.lastIndexOf('.');
    if (lastDotIndex > 0) {
      publicIdPart = publicIdPart.substring(0, lastDotIndex);
    }

    // Handle folder structure (e.g., "paintings/image_id")
    const folderStartIndex = uploadIndex + 1;
    const pathParts = urlParts.slice(folderStartIndex, -1);
    
    if (pathParts.length > 0) {
      return [...pathParts, publicIdPart].join('/');
    }

    return publicIdPart;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

// Enhanced image optimization utilities
export const generateOptimizedImageUrl = (
  baseUrl: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  } = {}
): string => {
  if (!baseUrl.includes('cloudinary.com')) {
    return baseUrl;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    crop = 'fill'
  } = options;

  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  
  // Add progressive loading for JPEG
  if (format === 'auto' || format === 'jpg') {
    transformations.push('fl_progressive');
  }

  const parts = baseUrl.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
  }

  return baseUrl;
};

// Generate responsive image srcset
export const generateResponsiveSrcSet = (baseUrl: string): string => {
  if (!baseUrl.includes('cloudinary.com')) {
    return baseUrl;
  }

  const breakpoints = [400, 600, 800, 1200, 1600];
  const srcSet = breakpoints.map(width => {
    const optimizedUrl = generateOptimizedImageUrl(baseUrl, { 
      width, 
      quality: width <= 600 ? 70 : 80 
    });
    return `${optimizedUrl} ${width}w`;
  }).join(', ');

  return srcSet;
};

// Preload critical images
export const preloadCriticalImages = async (imageUrls: string[]): Promise<void> => {
  const preloadPromises = imageUrls.slice(0, 6).map(url => {
    // Preload optimized versions
    const thumbnailUrl = generateOptimizedImageUrl(url, { width: 400, quality: 70 });
    return imageCache.preload(thumbnailUrl);
  });

  try {
    await Promise.allSettled(preloadPromises);
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
};

// Lazy load images with intersection observer
export const createLazyImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void
): IntersectionObserver => {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.1,
    }
  );
};