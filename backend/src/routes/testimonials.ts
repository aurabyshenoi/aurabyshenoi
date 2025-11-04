import express, { Request, Response } from 'express';
import { Testimonial } from '../models';

const router = express.Router();

// Simple in-memory cache for testimonials
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache helper functions
const getCachedData = (key: string): any | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any, ttlMs: number = 600000): void => { // 10 minutes default
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
};

// Clear cache periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > value.ttl) {
      cache.delete(key);
    }
  }
}, 60000); // Clean every minute

// Helper function to generate Cloudinary URLs for customer photos
const generateCloudinaryUrl = (publicId: string, transformation?: string): string => {
  const baseUrl = 'https://res.cloudinary.com';
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo';
  
  if (transformation) {
    return `${baseUrl}/${cloudName}/image/upload/${transformation}/${publicId}`;
  }
  return `${baseUrl}/${cloudName}/image/upload/${publicId}`;
};

// Helper function to transform testimonial data with Cloudinary URLs
const transformTestimonialData = (testimonial: any) => {
  return {
    ...testimonial.toObject(),
    customerPhoto: generateCloudinaryUrl(testimonial.customerPhoto, 'w_200,h_200,c_fill,q_auto,f_auto')
  };
};

// GET /api/testimonials - Get all active testimonials for public display
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check cache first
    const cacheKey = 'testimonials:active';
    const cachedTestimonials = getCachedData(cacheKey);
    if (cachedTestimonials) {
      return res.json(cachedTestimonials);
    }

    // Query active testimonials ordered by displayOrder
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('-__v') // Exclude version field
      .lean();

    // Transform testimonials with Cloudinary URLs
    const transformedTestimonials = testimonials.map(transformTestimonialData);

    const result = {
      success: true,
      data: {
        testimonials: transformedTestimonials
      }
    };

    // Cache the result for 10 minutes
    setCachedData(cacheKey, result, 600000);

    res.json(result);

  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;