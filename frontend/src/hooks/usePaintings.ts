import { useState, useEffect, useMemo } from 'react';
import { Painting, PaintingFilters } from '../types/painting';
import { measureApiCall } from '../utils/performanceMonitor';

// Mock data for development - this will be replaced with API calls
const mockPaintings: Painting[] = [
  {
    _id: '1',
    title: 'Sunset Over Mountains',
    description: 'A breathtaking view of golden hour light cascading over mountain peaks, capturing the serene beauty of nature in warm, vibrant colors.',
    dimensions: { width: 24, height: 18, unit: 'inches' },
    medium: 'Oil on Canvas',
    price: 850,
    category: 'landscape',
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      fullSize: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=900&fit=crop'
      ]
    },
    isAvailable: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: '2',
    title: 'Ocean Waves',
    description: 'Dynamic brushstrokes capture the power and movement of ocean waves crashing against rocky shores.',
    dimensions: { width: 30, height: 24, unit: 'inches' },
    medium: 'Acrylic on Canvas',
    price: 1200,
    category: 'seascape',
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop',
      fullSize: [
        'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop'
      ]
    },
    isAvailable: true,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    _id: '3',
    title: 'Forest Path',
    description: 'A peaceful woodland scene with dappled sunlight filtering through ancient trees, inviting the viewer to wander down the winding path.',
    dimensions: { width: 16, height: 20, unit: 'inches' },
    medium: 'Watercolor',
    price: 450,
    category: 'landscape',
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
      fullSize: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=900&fit=crop'
      ]
    },
    isAvailable: true,
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-05T09:15:00Z'
  },
  {
    _id: '4',
    title: 'City Lights',
    description: 'An urban nightscape showcasing the vibrant energy of city life through bold colors and dynamic composition.',
    dimensions: { width: 36, height: 24, unit: 'inches' },
    medium: 'Mixed Media',
    price: 1800,
    category: 'urban',
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=400&fit=crop',
      fullSize: [
        'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop'
      ]
    },
    isAvailable: false,
    createdAt: '2024-01-01T16:45:00Z',
    updatedAt: '2024-01-01T16:45:00Z'
  },
  {
    _id: '5',
    title: 'Wildflower Meadow',
    description: 'A celebration of spring with vibrant wildflowers dancing in a gentle breeze across an open meadow.',
    dimensions: { width: 20, height: 16, unit: 'inches' },
    medium: 'Oil on Canvas',
    price: 650,
    category: 'nature',
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop',
      fullSize: [
        'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=900&fit=crop'
      ]
    },
    isAvailable: true,
    createdAt: '2023-12-28T11:20:00Z',
    updatedAt: '2023-12-28T11:20:00Z'
  },
  {
    _id: '6',
    title: 'Abstract Harmony',
    description: 'An exploration of color, form, and emotion through abstract expressionism, creating a sense of balance and movement.',
    dimensions: { width: 48, height: 36, unit: 'inches' },
    medium: 'Acrylic on Canvas',
    price: 2200,
    category: 'abstract',
    images: {
      thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
      fullSize: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop'
      ]
    },
    isAvailable: true,
    createdAt: '2023-12-20T13:10:00Z',
    updatedAt: '2023-12-20T13:10:00Z'
  }
];

export const usePaintings = () => {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaintingFilters>({});

  // Simulate API call with performance monitoring
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        setLoading(true);
        
        // Measure API call performance
        await measureApiCall('fetch-paintings', async () => {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          setPaintings(mockPaintings);
        });
        
        setError(null);
      } catch (err) {
        setError('Failed to load paintings');
      } finally {
        setLoading(false);
      }
    };

    fetchPaintings();
  }, []);

  // Filter paintings based on current filters
  const filteredPaintings = useMemo(() => {
    return paintings.filter(painting => {
      // Category filter
      if (filters.category && painting.category !== filters.category) {
        return false;
      }

      // Price range filter
      if (filters.minPrice !== undefined && painting.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && painting.price > filters.maxPrice) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          painting.title,
          painting.description,
          painting.medium,
          painting.category
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [paintings, filters]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(paintings.map(p => p.category))];
    return uniqueCategories.sort();
  }, [paintings]);

  // Get price range
  const priceRange = useMemo(() => {
    if (paintings.length === 0) {
      return { min: 0, max: 1000 };
    }
    
    const prices = paintings.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [paintings]);

  return {
    paintings: filteredPaintings,
    allPaintings: paintings,
    loading,
    error,
    filters,
    setFilters,
    categories,
    priceRange
  };
};