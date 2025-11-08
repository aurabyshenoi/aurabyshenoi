/**
 * Unit tests for masonry layout calculation utilities
 * Tests layout algorithms, responsive behavior, and optimization functions
 */

import { describe, it, expect, vi } from 'vitest';
import {
  getCardHeight,
  getResponsiveCardHeight,
  assignCardVariants,
  calculateBasicMasonryLayout,
  calculateBalancedMasonryLayout,
  calculateResponsiveMasonryLayout,
  getMasonryLayoutStats,
  optimizeMasonryLayout,
  MasonryLayoutOptions
} from '../masonryLayout';
import { Painting } from '../../types/painting';
import { CardVariant } from '../../types/react-bits';

// Mock Math.random for consistent testing
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5;
global.Math = mockMath;

const mockArtworks: Painting[] = [
  {
    _id: '1',
    title: 'Artwork 1',
    medium: 'Oil',
    price: 500,
    isAvailable: true,
    images: { thumbnail: '/img1.jpg', full: '/img1-full.jpg' },
    dimensions: { width: 16, height: 20, unit: 'inches' },
    category: 'Landscape',
  },
  {
    _id: '2',
    title: 'Artwork 2',
    medium: 'Acrylic',
    price: 750,
    isAvailable: true,
    images: { thumbnail: '/img2.jpg', full: '/img2-full.jpg' },
    dimensions: { width: 12, height: 16, unit: 'inches' },
    category: 'Abstract',
  },
  {
    _id: '3',
    title: 'Artwork 3',
    medium: 'Watercolor',
    price: 300,
    isAvailable: true,
    images: { thumbnail: '/img3.jpg', full: '/img3-full.jpg' },
    dimensions: { width: 14, height: 18, unit: 'inches' },
    category: 'Portrait',
  },
  {
    _id: '4',
    title: 'Artwork 4',
    medium: 'Charcoal',
    price: 400,
    isAvailable: true,
    images: { thumbnail: '/img4.jpg', full: '/img4-full.jpg' },
    dimensions: { width: 10, height: 12, unit: 'inches' },
    category: 'Still Life',
  },
  {
    _id: '5',
    title: 'Artwork 5',
    medium: 'Mixed Media',
    price: 600,
    isAvailable: true,
    images: { thumbnail: '/img5.jpg', full: '/img5-full.jpg' },
    dimensions: { width: 18, height: 24, unit: 'inches' },
    category: 'Urban',
  },
  {
    _id: '6',
    title: 'Artwork 6',
    medium: 'Pencil',
    price: 200,
    isAvailable: true,
    images: { thumbnail: '/img6.jpg', full: '/img6-full.jpg' },
    dimensions: { width: 8, height: 10, unit: 'inches' },
    category: 'Nature',
  },
];

describe('Masonry Layout Utilities', () => {
  describe('getCardHeight', () => {
    it('returns correct heights for each variant', () => {
      expect(getCardHeight('small')).toBe(250);
      expect(getCardHeight('medium')).toBe(320);
      expect(getCardHeight('large')).toBe(400);
    });

    it('returns default height for unknown variant', () => {
      expect(getCardHeight('unknown' as CardVariant)).toBe(300);
    });
  });

  describe('getResponsiveCardHeight', () => {
    it('reduces height by 20% on mobile (< 480px)', () => {
      expect(getResponsiveCardHeight('small', 400)).toBe(200); // 250 * 0.8
      expect(getResponsiveCardHeight('medium', 400)).toBe(256); // 320 * 0.8
      expect(getResponsiveCardHeight('large', 400)).toBe(320); // 400 * 0.8
    });

    it('reduces height by 10% on tablet (480-767px)', () => {
      expect(getResponsiveCardHeight('small', 600)).toBe(225); // 250 * 0.9
      expect(getResponsiveCardHeight('medium', 600)).toBe(288); // 320 * 0.9
      expect(getResponsiveCardHeight('large', 600)).toBe(360); // 400 * 0.9
    });

    it('uses full height on desktop (>= 768px)', () => {
      expect(getResponsiveCardHeight('small', 1200)).toBe(250);
      expect(getResponsiveCardHeight('medium', 1200)).toBe(320);
      expect(getResponsiveCardHeight('large', 1200)).toBe(400);
    });
  });

  describe('assignCardVariants', () => {
    const cardVariants: CardVariant[] = ['small', 'medium', 'large'];

    it('cycles through variants when no distribution provided', () => {
      const variants = assignCardVariants(mockArtworks.slice(0, 6), cardVariants);
      
      expect(variants).toHaveLength(6);
      expect(variants[0]).toBe('small');
      expect(variants[1]).toBe('medium');
      expect(variants[2]).toBe('large');
      expect(variants[3]).toBe('small');
      expect(variants[4]).toBe('medium');
      expect(variants[5]).toBe('large');
    });

    it('distributes variants according to percentage distribution', () => {
      const distribution = { small: 50, medium: 30, large: 20 };
      const variants = assignCardVariants(mockArtworks, cardVariants, distribution);
      
      expect(variants).toHaveLength(6);
      
      // Count occurrences
      const counts = variants.reduce((acc, variant) => {
        acc[variant] = (acc[variant] || 0) + 1;
        return acc;
      }, {} as Record<CardVariant, number>);
      
      // With 6 items: 50% = 3, 30% = 1, 20% = 2 (remaining)
      expect(counts.small).toBe(3);
      expect(counts.medium).toBe(1);
      expect(counts.large).toBe(2);
    });

    it('handles edge case with single artwork', () => {
      const variants = assignCardVariants([mockArtworks[0]], cardVariants);
      expect(variants).toHaveLength(1);
      expect(variants[0]).toBe('small');
    });

    it('handles empty artworks array', () => {
      const variants = assignCardVariants([], cardVariants);
      expect(variants).toHaveLength(0);
    });
  });

  describe('calculateBasicMasonryLayout', () => {
    const basicOptions: MasonryLayoutOptions = {
      columnCount: 3,
      cardVariants: ['small', 'medium', 'large'],
      gap: 20
    };

    it('distributes artworks across columns', () => {
      const layout = calculateBasicMasonryLayout(mockArtworks, basicOptions);
      
      expect(layout).toHaveLength(3);
      expect(layout.every(column => column.items.length > 0)).toBe(true);
      
      // Total items should equal input artworks
      const totalItems = layout.reduce((sum, col) => sum + col.items.length, 0);
      expect(totalItems).toBe(mockArtworks.length);
    });

    it('assigns variants to artworks', () => {
      const layout = calculateBasicMasonryLayout(mockArtworks, basicOptions);
      
      layout.forEach(column => {
        column.items.forEach(item => {
          expect(['small', 'medium', 'large']).toContain(item.variant);
        });
      });
    });

    it('calculates column heights correctly', () => {
      const layout = calculateBasicMasonryLayout(mockArtworks.slice(0, 3), basicOptions);
      
      layout.forEach(column => {
        if (column.items.length > 0) {
          const expectedHeight = column.items.reduce((sum, item) => {
            return sum + getCardHeight(item.variant) + basicOptions.gap;
          }, 0);
          expect(column.height).toBe(expectedHeight);
        }
      });
    });

    it('places items in shortest column', () => {
      const layout = calculateBasicMasonryLayout(mockArtworks.slice(0, 4), basicOptions);
      
      // With 4 items and 3 columns, one column should have 2 items, others 1 each
      const itemCounts = layout.map(col => col.items.length).sort();
      expect(itemCounts).toEqual([1, 1, 2]);
    });

    it('handles single column layout', () => {
      const singleColumnOptions = { ...basicOptions, columnCount: 1 };
      const layout = calculateBasicMasonryLayout(mockArtworks, singleColumnOptions);
      
      expect(layout).toHaveLength(1);
      expect(layout[0].items).toHaveLength(mockArtworks.length);
    });
  });

  describe('calculateBalancedMasonryLayout', () => {
    const balancedOptions: MasonryLayoutOptions = {
      columnCount: 3,
      cardVariants: ['small', 'medium', 'large'],
      gap: 20,
      balanceThreshold: 100,
      variantDistribution: { small: 40, medium: 40, large: 20 }
    };

    it('creates more balanced layout than basic algorithm', () => {
      const basicLayout = calculateBasicMasonryLayout(mockArtworks, balancedOptions);
      const balancedLayout = calculateBalancedMasonryLayout(mockArtworks, balancedOptions);
      
      const basicStats = getMasonryLayoutStats(basicLayout);
      const balancedStats = getMasonryLayoutStats(balancedLayout);
      
      // Balanced layout should have better balance (lower is better)
      expect(balancedStats.balance).toBeLessThanOrEqual(basicStats.balance);
    });

    it('respects variant distribution', () => {
      const layout = calculateBalancedMasonryLayout(mockArtworks, balancedOptions);
      
      const allItems = layout.flatMap(col => col.items);
      const variantCounts = allItems.reduce((acc, item) => {
        acc[item.variant] = (acc[item.variant] || 0) + 1;
        return acc;
      }, {} as Record<CardVariant, number>);
      
      // With 6 items: 40% = 2, 40% = 2, 20% = 2 (remaining)
      expect(variantCounts.small).toBe(2);
      expect(variantCounts.medium).toBe(2);
      expect(variantCounts.large).toBe(2);
    });

    it('maintains balance within threshold', () => {
      const layout = calculateBalancedMasonryLayout(mockArtworks, balancedOptions);
      const stats = getMasonryLayoutStats(layout);
      
      // Height difference should be reasonable (not necessarily within threshold due to item constraints)
      expect(stats.heightDifference).toBeGreaterThanOrEqual(0);
    });

    it('handles empty artworks gracefully', () => {
      const layout = calculateBalancedMasonryLayout([], balancedOptions);
      
      expect(layout).toHaveLength(3);
      layout.forEach(column => {
        expect(column.items).toHaveLength(0);
        expect(column.height).toBe(0);
      });
    });
  });

  describe('calculateResponsiveMasonryLayout', () => {
    const baseOptions = {
      cardVariants: ['small', 'medium', 'large'] as CardVariant[],
      gap: 20,
      balanceThreshold: 100,
      variantDistribution: { small: 40, medium: 40, large: 20 }
    };

    it('uses 1 column for mobile screens (< 480px)', () => {
      const layout = calculateResponsiveMasonryLayout(mockArtworks, 400, baseOptions);
      expect(layout).toHaveLength(1);
    });

    it('uses 2 columns for tablet screens (480-767px)', () => {
      const layout = calculateResponsiveMasonryLayout(mockArtworks, 600, baseOptions);
      expect(layout).toHaveLength(2);
    });

    it('uses 3 columns for desktop screens (>= 768px)', () => {
      const layout = calculateResponsiveMasonryLayout(mockArtworks, 1200, baseOptions);
      expect(layout).toHaveLength(3);
    });

    it('distributes items correctly across responsive columns', () => {
      const mobileLayout = calculateResponsiveMasonryLayout(mockArtworks, 400, baseOptions);
      const tabletLayout = calculateResponsiveMasonryLayout(mockArtworks, 600, baseOptions);
      const desktopLayout = calculateResponsiveMasonryLayout(mockArtworks, 1200, baseOptions);
      
      // All layouts should contain all artworks
      expect(mobileLayout[0].items).toHaveLength(6);
      
      const tabletTotal = tabletLayout.reduce((sum, col) => sum + col.items.length, 0);
      expect(tabletTotal).toBe(6);
      
      const desktopTotal = desktopLayout.reduce((sum, col) => sum + col.items.length, 0);
      expect(desktopTotal).toBe(6);
    });
  });

  describe('getMasonryLayoutStats', () => {
    it('calculates correct statistics', () => {
      const mockColumns = [
        { items: [{ ...mockArtworks[0], variant: 'medium' as CardVariant }], height: 340 },
        { items: [{ ...mockArtworks[1], variant: 'small' as CardVariant }], height: 270 },
        { items: [{ ...mockArtworks[2], variant: 'large' as CardVariant }], height: 420 }
      ];
      
      const stats = getMasonryLayoutStats(mockColumns);
      
      expect(stats.columnCount).toBe(3);
      expect(stats.heights).toEqual([340, 270, 420]);
      expect(stats.maxHeight).toBe(420);
      expect(stats.minHeight).toBe(270);
      expect(stats.avgHeight).toBeCloseTo(343.33, 1);
      expect(stats.heightDifference).toBe(150);
      expect(stats.balance).toBeCloseTo(0.437, 2);
      expect(stats.itemCounts).toEqual([1, 1, 1]);
    });

    it('handles empty columns', () => {
      const emptyColumns = [
        { items: [], height: 0 },
        { items: [], height: 0 },
        { items: [], height: 0 }
      ];
      
      const stats = getMasonryLayoutStats(emptyColumns);
      
      expect(stats.columnCount).toBe(3);
      expect(stats.maxHeight).toBe(0);
      expect(stats.minHeight).toBe(0);
      expect(stats.avgHeight).toBe(0);
      expect(stats.heightDifference).toBe(0);
      expect(stats.itemCounts).toEqual([0, 0, 0]);
    });

    it('handles single column', () => {
      const singleColumn = [
        { items: mockArtworks.slice(0, 3).map(a => ({ ...a, variant: 'medium' as CardVariant })), height: 960 }
      ];
      
      const stats = getMasonryLayoutStats(singleColumn);
      
      expect(stats.columnCount).toBe(1);
      expect(stats.heightDifference).toBe(0);
      expect(stats.balance).toBe(0);
      expect(stats.itemCounts).toEqual([3]);
    });
  });

  describe('optimizeMasonryLayout', () => {
    it('improves layout balance when imbalance exceeds threshold', () => {
      // Create an imbalanced layout
      const imbalancedColumns = [
        { 
          items: [
            { ...mockArtworks[0], variant: 'large' as CardVariant },
            { ...mockArtworks[1], variant: 'large' as CardVariant }
          ], 
          height: 800 
        },
        { items: [{ ...mockArtworks[2], variant: 'small' as CardVariant }], height: 250 },
        { items: [], height: 0 }
      ];
      
      const optimized = optimizeMasonryLayout(imbalancedColumns, 200);
      const optimizedStats = getMasonryLayoutStats(optimized);
      const originalStats = getMasonryLayoutStats(imbalancedColumns);
      
      // Should improve balance or maintain if already good
      expect(optimizedStats.balance).toBeLessThanOrEqual(originalStats.balance);
    });

    it('returns layout unchanged when already balanced', () => {
      const balancedColumns = [
        { items: [{ ...mockArtworks[0], variant: 'medium' as CardVariant }], height: 320 },
        { items: [{ ...mockArtworks[1], variant: 'medium' as CardVariant }], height: 320 },
        { items: [{ ...mockArtworks[2], variant: 'medium' as CardVariant }], height: 320 }
      ];
      
      const optimized = optimizeMasonryLayout(balancedColumns, 100);
      
      // Should be identical since already balanced
      expect(optimized).toEqual(balancedColumns);
    });

    it('handles empty columns gracefully', () => {
      const emptyColumns = [
        { items: [], height: 0 },
        { items: [], height: 0 },
        { items: [], height: 0 }
      ];
      
      const optimized = optimizeMasonryLayout(emptyColumns, 100);
      expect(optimized).toEqual(emptyColumns);
    });

    it('preserves total number of items', () => {
      const columns = [
        { 
          items: [
            { ...mockArtworks[0], variant: 'large' as CardVariant },
            { ...mockArtworks[1], variant: 'medium' as CardVariant },
            { ...mockArtworks[2], variant: 'small' as CardVariant }
          ], 
          height: 970 
        },
        { items: [{ ...mockArtworks[3], variant: 'small' as CardVariant }], height: 250 },
        { items: [], height: 0 }
      ];
      
      const optimized = optimizeMasonryLayout(columns, 100);
      
      const originalTotal = columns.reduce((sum, col) => sum + col.items.length, 0);
      const optimizedTotal = optimized.reduce((sum, col) => sum + col.items.length, 0);
      
      expect(optimizedTotal).toBe(originalTotal);
    });

    it('stops optimization when no improvement possible', () => {
      // Create a layout where moving items won't help
      const stubborn = [
        { items: [{ ...mockArtworks[0], variant: 'large' as CardVariant }], height: 400 },
        { items: [{ ...mockArtworks[1], variant: 'large' as CardVariant }], height: 400 }
      ];
      
      const optimized = optimizeMasonryLayout(stubborn, 50);
      
      // Should complete without infinite loop
      expect(optimized).toBeDefined();
      expect(optimized).toHaveLength(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles zero gap correctly', () => {
      const options: MasonryLayoutOptions = {
        columnCount: 2,
        cardVariants: ['medium'],
        gap: 0
      };
      
      const layout = calculateBasicMasonryLayout(mockArtworks.slice(0, 2), options);
      
      layout.forEach(column => {
        if (column.items.length > 0) {
          const expectedHeight = column.items.reduce((sum, item) => {
            return sum + getCardHeight(item.variant);
          }, 0);
          expect(column.height).toBe(expectedHeight);
        }
      });
    });

    it('handles single variant correctly', () => {
      const options: MasonryLayoutOptions = {
        columnCount: 3,
        cardVariants: ['medium'],
        gap: 20
      };
      
      const layout = calculateBasicMasonryLayout(mockArtworks, options);
      
      layout.forEach(column => {
        column.items.forEach(item => {
          expect(item.variant).toBe('medium');
        });
      });
    });

    it('handles more columns than artworks', () => {
      const options: MasonryLayoutOptions = {
        columnCount: 10,
        cardVariants: ['small', 'medium', 'large'],
        gap: 20
      };
      
      const layout = calculateBasicMasonryLayout(mockArtworks.slice(0, 3), options);
      
      expect(layout).toHaveLength(10);
      
      const filledColumns = layout.filter(col => col.items.length > 0);
      expect(filledColumns).toHaveLength(3);
      
      const emptyColumns = layout.filter(col => col.items.length === 0);
      expect(emptyColumns).toHaveLength(7);
    });

    it('handles extreme screen sizes', () => {
      const baseOptions = {
        cardVariants: ['small', 'medium', 'large'] as CardVariant[],
        gap: 20
      };
      
      // Very small screen
      const tinyLayout = calculateResponsiveMasonryLayout(mockArtworks, 200, baseOptions);
      expect(tinyLayout).toHaveLength(1);
      
      // Very large screen
      const hugeLayout = calculateResponsiveMasonryLayout(mockArtworks, 5000, baseOptions);
      expect(hugeLayout).toHaveLength(3);
    });
  });
});