import express, { Request, Response } from 'express';
import { Painting } from '../models';

// Simple in-memory cache for frequently accessed data
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

const setCachedData = (key: string, data: any, ttlMs: number = 300000): void => { // 5 minutes default
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

const router = express.Router();

// Interface for query parameters
interface PaintingQuery {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Helper function to generate Cloudinary URLs
const generateCloudinaryUrl = (publicId: string, transformation?: string): string => {
  const baseUrl = 'https://res.cloudinary.com';
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'demo';
  
  if (transformation) {
    return `${baseUrl}/${cloudName}/image/upload/${transformation}/${publicId}`;
  }
  return `${baseUrl}/${cloudName}/image/upload/${publicId}`;
};

// Helper function to transform painting data with Cloudinary URLs
const transformPaintingData = (painting: any) => {
  return {
    ...painting.toObject(),
    images: {
      thumbnail: generateCloudinaryUrl(painting.images.thumbnail, 'w_400,h_400,c_fill,q_auto'),
      fullSize: painting.images.fullSize.map((img: string) => 
        generateCloudinaryUrl(img, 'w_1200,h_1200,c_fit,q_auto')
      )
    }
  };
};

// GET /api/paintings - Get all paintings with filtering and pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      page = '1',
      limit = '12',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    }: PaintingQuery = req.query;

    // Create cache key for this query
    const cacheKey = `paintings:${JSON.stringify(req.query)}`;
    
    // Check cache first (only for non-search queries to avoid stale results)
    if (!search) {
      const cachedResult = getCachedData(cacheKey);
      if (cachedResult) {
        return res.json(cachedResult);
      }
    }

    // Build filter object
    const filter: any = { isAvailable: true };

    // Category filter - use exact match for better index usage
    if (category) {
      filter.category = category; // Changed from regex to exact match for better performance
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        const min = parseFloat(minPrice);
        if (!isNaN(min)) {
          filter.price.$gte = min;
        }
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (!isNaN(max)) {
          filter.price.$lte = max;
        }
      }
    }

    // Text search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    const validSortFields = ['createdAt', 'price', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Optimize query by selecting only necessary fields
    const projection = {
      title: 1,
      description: 1,
      dimensions: 1,
      medium: 1,
      price: 1,
      category: 1,
      'images.thumbnail': 1,
      'images.fullSize': 1,
      isAvailable: 1,
      createdAt: 1,
      updatedAt: 1
    };

    // Execute optimized query with pagination
    const [paintings, totalCount] = await Promise.all([
      Painting.find(filter, projection)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean()
        .hint({ isAvailable: 1, createdAt: -1 }), // Use compound index hint
      Painting.countDocuments(filter)
    ]);

    // Transform paintings with Cloudinary URLs
    const transformedPaintings = paintings.map(transformPaintingData);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const result = {
      success: true,
      data: {
        paintings: transformedPaintings,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          category,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          search
        }
      }
    };

    // Cache the result (only for non-search queries)
    if (!search) {
      setCachedData(cacheKey, result, 300000); // Cache for 5 minutes
    }

    res.json(result);

  } catch (error) {
    console.error('Error fetching paintings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch paintings',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/paintings/:id - Get specific painting by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid painting ID format'
      });
    }

    // Check cache first
    const cacheKey = `painting:${id}`;
    const cachedPainting = getCachedData(cacheKey);
    if (cachedPainting) {
      return res.json(cachedPainting);
    }

    // Use lean() for better performance and select only necessary fields
    const painting = await Painting.findById(id)
      .select('-__v') // Exclude version field
      .lean();

    if (!painting) {
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    // Check if painting is available (unless it's an admin request)
    if (!painting.isAvailable) {
      return res.status(404).json({
        success: false,
        message: 'Painting not available'
      });
    }

    // Transform painting data with Cloudinary URLs
    const transformedPainting = transformPaintingData(painting);

    const result = {
      success: true,
      data: {
        painting: transformedPainting
      }
    };

    // Cache the result for 10 minutes
    setCachedData(cacheKey, result, 600000);

    res.json(result);

  } catch (error) {
    console.error('Error fetching painting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch painting',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/paintings/categories/list - Get all available categories
router.get('/categories/list', async (req: Request, res: Response) => {
  try {
    // Check cache first - categories don't change often
    const cacheKey = 'categories:list';
    const cachedCategories = getCachedData(cacheKey);
    if (cachedCategories) {
      return res.json(cachedCategories);
    }

    // Use aggregation pipeline for better performance
    const categories = await Painting.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: '$category' } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, category: '$_id' } }
    ]);
    
    const result = {
      success: true,
      data: {
        categories: categories.map(c => c.category)
      }
    };

    // Cache categories for 30 minutes since they don't change often
    setCachedData(cacheKey, result, 1800000);
    
    res.json(result);

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;