import { useState, useEffect, useMemo } from 'react';
import { Painting, PaintingFilters } from '../types/painting';
import { measureApiCall } from '../utils/performanceMonitor';

// Mock data for development - this will be replaced with API calls
const mockPaintings: Painting[] = [
  {
    _id: '1',
    title: '',
    description: 'Pen Sketch',
    dimensions: { width: 24, height: 18, unit: 'inches' },
    medium: 'Pen Sketch',
    price: 850,
    category: 'Anime Sketches',
    images: {
      thumbnail: '/img1.jpeg',
      fullSize: ['/img1.jpeg']
    },
    isAvailable: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: '2',
    title: '',
    description: 'Pen Sketch',
    dimensions: { width: 30, height: 24, unit: 'inches' },
    medium: 'Pen Sketch',
    price: 1200,
    category: 'Penwork',
    images: {
      thumbnail: '/img2.jpeg',
      fullSize: ['/img2.jpeg']
    },
    isAvailable: true,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    _id: '3',
    title: '',
    description: 'Pen Sketch',
    dimensions: { width: 16, height: 20, unit: 'inches' },
    medium: 'Pen Sketch',
    price: 450,
    category: 'Anime Sketches',
    images: {
      thumbnail: '/img3.jpeg',
      fullSize: ['/img3.jpeg']
    },
    isAvailable: true,
    createdAt: '2024-01-05T09:15:00Z',
    updatedAt: '2024-01-05T09:15:00Z'
  },
  {
    _id: '4',
    title: '',
    description: 'Pencil Sketch',
    dimensions: { width: 36, height: 24, unit: 'inches' },
    medium: 'Pencil Sketch',
    price: 1800,
    category: 'Hyperrealistic Sketch',
    images: {
      thumbnail: '/img4.jpeg',
      fullSize: ['/img4.jpeg']
    },
    isAvailable: false,
    createdAt: '2024-01-01T16:45:00Z',
    updatedAt: '2024-01-01T16:45:00Z'
  },
  {
    _id: '5',
    title: '',
    description: 'Pen Sketch',
    dimensions: { width: 20, height: 16, unit: 'inches' },
    medium: 'Pen Sketch',
    price: 650,
    category: 'Anime Sketches',
    images: {
      thumbnail: '/img5.jpeg',
      fullSize: ['/img5.jpeg']
    },
    isAvailable: true,
    createdAt: '2023-12-28T11:20:00Z',
    updatedAt: '2023-12-28T11:20:00Z'
  },
  {
    _id: '6',
    title: '',
    description: 'Pen Sketch',
    dimensions: { width: 48, height: 36, unit: 'inches' },
    medium: 'Pen Sketch',
    price: 2200,
    category: 'Anime Sketches',
    images: {
      thumbnail: '/img6.jpeg',
      fullSize: ['/img6.jpeg']
    },
    isAvailable: true,
    createdAt: '2023-12-20T13:10:00Z',
    updatedAt: '2023-12-20T13:10:00Z'
  },
  {
    _id: '7',
    title: '',
    description: 'Acrylic Canvas Painting',
    dimensions: { width: 28, height: 22, unit: 'inches' },
    medium: 'Acrylic Canvas Painting',
    price: 950,
    category: 'Anime Painting',
    images: {
      thumbnail: '/img7.jpeg',
      fullSize: ['/img7.jpeg']
    },
    isAvailable: true,
    createdAt: '2023-12-15T08:30:00Z',
    updatedAt: '2023-12-15T08:30:00Z'
  },
  {
    _id: '8',
    title: '',
    description: 'Acrylic Canvas Painting',
    dimensions: { width: 32, height: 24, unit: 'inches' },
    medium: 'Acrylic Canvas Painting',
    price: 1350,
    category: 'Murals',
    images: {
      thumbnail: '/img8.jpeg',
      fullSize: ['/img8.jpeg']
    },
    isAvailable: true,
    createdAt: '2023-12-10T15:45:00Z',
    updatedAt: '2023-12-10T15:45:00Z'
  },
  {
    _id: '9',
    title: '',
    description: 'Acrylic Canvas Painting',
    dimensions: { width: 18, height: 24, unit: 'inches' },
    medium: 'Acrylic Canvas Painting',
    price: 520,
    category: 'Abstract Art',
    images: {
      thumbnail: '/img9.jpeg',
      fullSize: ['/img9.jpeg']
    },
    isAvailable: true,
    createdAt: '2023-12-05T12:20:00Z',
    updatedAt: '2023-12-05T12:20:00Z'
  },
  {
    _id: '10',
    title: '',
    description: 'Acrylic Canvas Painting',
    dimensions: { width: 40, height: 30, unit: 'inches' },
    medium: 'Acrylic Canvas Painting',
    price: 1650,
    category: 'Abstract Art',
    images: {
      thumbnail: '/img10.jpeg',
      fullSize: ['/img10.jpeg']
    },
    isAvailable: true,
    createdAt: '2023-11-30T14:15:00Z',
    updatedAt: '2023-11-30T14:15:00Z'
  },
  {
    _id: '11',
    title: '',
    description: 'Acrylic Canvas Painting',
    dimensions: { width: 36, height: 48, unit: 'inches' },
    medium: 'Acrylic Canvas Painting',
    price: 1950,
    category: 'Abstract Art',
    images: {
      thumbnail: '/img11.jpeg',
      fullSize: ['/img11.jpeg']
    },
    isAvailable: false,
    createdAt: '2023-11-25T10:00:00Z',
    updatedAt: '2023-11-25T10:00:00Z'
  },
  {
    _id: '12',
    title: '',
    description: 'Acrylic Canvas Painting',
    dimensions: { width: 26, height: 20, unit: 'inches' },
    medium: 'Acrylic Canvas Painting',
    price: 780,
    category: 'Murals',
    images: {
      thumbnail: '/img12.jpeg',
      fullSize: ['/img12.jpeg']
    },
    isAvailable: true,
    createdAt: '2023-11-20T16:30:00Z',
    updatedAt: '2023-11-20T16:30:00Z'
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