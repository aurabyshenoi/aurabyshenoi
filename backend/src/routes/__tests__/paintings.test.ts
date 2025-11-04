import request from 'supertest';
import express from 'express';
import paintingsRoutes from '../paintings';
import { Painting } from '../../models';

const app = express();
app.use(express.json());
app.use('/api/paintings', paintingsRoutes);

describe('Paintings API', () => {
  const mockPaintingData = {
    title: 'Test Painting',
    description: 'A beautiful test painting',
    dimensions: { width: 24, height: 36, unit: 'inches' },
    medium: 'Oil on canvas',
    price: 500,
    category: 'landscape',
    images: {
      thumbnail: 'test-thumb.jpg',
      fullSize: ['test-full-1.jpg', 'test-full-2.jpg']
    },
    isAvailable: true
  };

  const mockPaintingData2 = {
    title: 'Another Painting',
    description: 'Another beautiful painting',
    dimensions: { width: 18, height: 24, unit: 'inches' },
    medium: 'Acrylic on canvas',
    price: 300,
    category: 'portrait',
    images: {
      thumbnail: 'test-thumb-2.jpg',
      fullSize: ['test-full-3.jpg']
    },
    isAvailable: true
  };

  beforeEach(async () => {
    // Clear any existing paintings
    await Painting.deleteMany({});
  });

  describe('GET /api/paintings', () => {
    test('should return empty array when no paintings exist', async () => {
      const response = await request(app)
        .get('/api/paintings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paintings).toEqual([]);
      expect(response.body.data.pagination.totalCount).toBe(0);
    });

    test('should return all available paintings', async () => {
      // Create test paintings
      const painting1 = await Painting.create(mockPaintingData);
      const painting2 = await Painting.create(mockPaintingData2);

      const response = await request(app)
        .get('/api/paintings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paintings).toHaveLength(2);
      expect(response.body.data.pagination.totalCount).toBe(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(1);

      // Check that paintings have Cloudinary URLs
      const returnedPainting = response.body.data.paintings[0];
      expect(returnedPainting.images.thumbnail).toContain('cloudinary.com');
      expect(returnedPainting.images.fullSize[0]).toContain('cloudinary.com');
    });

    test('should not return unavailable paintings', async () => {
      // Create available and unavailable paintings
      await Painting.create(mockPaintingData);
      await Painting.create({ ...mockPaintingData2, isAvailable: false });

      const response = await request(app)
        .get('/api/paintings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paintings).toHaveLength(1);
      expect(response.body.data.paintings[0].title).toBe('Test Painting');
    });

    test('should filter by category', async () => {
      await Painting.create(mockPaintingData);
      await Painting.create(mockPaintingData2);

      const response = await request(app)
        .get('/api/paintings?category=landscape')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paintings).toHaveLength(1);
      expect(response.body.data.paintings[0].category).toBe('landscape');
      expect(response.body.data.filters.category).toBe('landscape');
    });

    test('should filter by price range', async () => {
      await Painting.create(mockPaintingData); // price: 500
      await Painting.create(mockPaintingData2); // price: 300

      const response = await request(app)
        .get('/api/paintings?minPrice=400&maxPrice=600')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paintings).toHaveLength(1);
      expect(response.body.data.paintings[0].price).toBe(500);
      expect(response.body.data.filters.minPrice).toBe(400);
      expect(response.body.data.filters.maxPrice).toBe(600);
    });

    test('should handle pagination', async () => {
      // Create multiple paintings
      for (let i = 0; i < 5; i++) {
        await Painting.create({
          ...mockPaintingData,
          title: `Painting ${i + 1}`,
          price: 100 * (i + 1)
        });
      }

      const response = await request(app)
        .get('/api/paintings?page=2&limit=2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paintings).toHaveLength(2);
      expect(response.body.data.pagination.currentPage).toBe(2);
      expect(response.body.data.pagination.totalPages).toBe(3);
      expect(response.body.data.pagination.totalCount).toBe(5);
      expect(response.body.data.pagination.hasNextPage).toBe(true);
      expect(response.body.data.pagination.hasPrevPage).toBe(true);
    });

    test('should sort paintings by price ascending', async () => {
      await Painting.create({ ...mockPaintingData, price: 500 });
      await Painting.create({ ...mockPaintingData2, price: 300 });

      const response = await request(app)
        .get('/api/paintings?sortBy=price&sortOrder=asc')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paintings).toHaveLength(2);
      expect(response.body.data.paintings[0].price).toBe(300);
      expect(response.body.data.paintings[1].price).toBe(500);
    });

    test('should handle text search', async () => {
      await Painting.create({ ...mockPaintingData, title: 'Beautiful Landscape' });
      await Painting.create({ ...mockPaintingData2, title: 'Portrait Study' });

      const response = await request(app)
        .get('/api/paintings?search=landscape')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paintings).toHaveLength(1);
      expect(response.body.data.paintings[0].title).toBe('Beautiful Landscape');
      expect(response.body.data.filters.search).toBe('landscape');
    });

    test('should handle invalid pagination parameters', async () => {
      await Painting.create(mockPaintingData);

      const response = await request(app)
        .get('/api/paintings?page=-1&limit=0')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });

    test('should limit maximum items per page', async () => {
      await Painting.create(mockPaintingData);

      const response = await request(app)
        .get('/api/paintings?limit=100')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.limit).toBe(50); // Max limit is 50
    });
  });

  describe('GET /api/paintings/:id', () => {
    test('should return specific painting by ID', async () => {
      const painting = await Painting.create(mockPaintingData);

      const response = await request(app)
        .get(`/api/paintings/${painting._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.painting.title).toBe('Test Painting');
      expect(response.body.data.painting.price).toBe(500);
      expect(response.body.data.painting.images.thumbnail).toContain('cloudinary.com');
    });

    test('should return 404 for non-existent painting', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/paintings/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Painting not found');
    });

    test('should return 404 for unavailable painting', async () => {
      const painting = await Painting.create({ ...mockPaintingData, isAvailable: false });

      const response = await request(app)
        .get(`/api/paintings/${painting._id}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Painting not available');
    });

    test('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/paintings/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid painting ID format');
    });
  });

  describe('GET /api/paintings/categories/list', () => {
    test('should return empty array when no paintings exist', async () => {
      const response = await request(app)
        .get('/api/paintings/categories/list')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toEqual([]);
    });

    test('should return unique categories from available paintings', async () => {
      await Painting.create({ ...mockPaintingData, category: 'landscape' });
      await Painting.create({ ...mockPaintingData2, category: 'portrait' });
      await Painting.create({ ...mockPaintingData, category: 'landscape', title: 'Another Landscape' });

      const response = await request(app)
        .get('/api/paintings/categories/list')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toHaveLength(2);
      expect(response.body.data.categories).toContain('landscape');
      expect(response.body.data.categories).toContain('portrait');
    });

    test('should not include categories from unavailable paintings', async () => {
      await Painting.create({ ...mockPaintingData, category: 'landscape' });
      await Painting.create({ ...mockPaintingData2, category: 'portrait', isAvailable: false });

      const response = await request(app)
        .get('/api/paintings/categories/list')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toHaveLength(1);
      expect(response.body.data.categories).toContain('landscape');
      expect(response.body.data.categories).not.toContain('portrait');
    });

    test('should return categories in alphabetical order', async () => {
      await Painting.create({ ...mockPaintingData, category: 'zebra' });
      await Painting.create({ ...mockPaintingData2, category: 'abstract' });
      await Painting.create({ ...mockPaintingData, category: 'portrait', title: 'Test Portrait' });

      const response = await request(app)
        .get('/api/paintings/categories/list')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toEqual(['abstract', 'portrait', 'zebra']);
    });
  });

  describe('Error handling', () => {
    test('should handle database errors gracefully', async () => {
      // Mock Painting.find to throw an error
      const originalFind = Painting.find;
      Painting.find = jest.fn().mockImplementation(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .get('/api/paintings')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Failed to fetch paintings');

      // Restore original method
      Painting.find = originalFind;
    });
  });
});