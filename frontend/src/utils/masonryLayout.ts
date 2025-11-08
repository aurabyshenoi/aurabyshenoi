/**
 * Masonry Layout Calculation Utilities
 * Advanced algorithms for distributing cards across columns with optimal visual balance
 */

import { Painting } from '../types/painting';
import { CardVariant } from '../types/react-bits';

export interface MasonryColumn {
  items: (Painting & { variant: CardVariant })[];
  height: number;
}

export interface MasonryLayoutOptions {
  columnCount: number;
  cardVariants: CardVariant[];
  gap: number;
  balanceThreshold?: number; // Maximum height difference between columns
  variantDistribution?: {
    small: number;
    medium: number;
    large: number;
  };
}

/**
 * Get card height based on variant
 */
export const getCardHeight = (variant: CardVariant): number => {
  switch (variant) {
    case 'small': return 250;
    case 'medium': return 320;
    case 'large': return 400;
    default: return 300;
  }
};

/**
 * Get responsive card heights for different screen sizes
 */
export const getResponsiveCardHeight = (variant: CardVariant, screenWidth: number): number => {
  const baseHeight = getCardHeight(variant);
  
  if (screenWidth < 480) {
    // Mobile: reduce heights by 20%
    return Math.floor(baseHeight * 0.8);
  } else if (screenWidth < 768) {
    // Tablet: reduce heights by 10%
    return Math.floor(baseHeight * 0.9);
  }
  
  return baseHeight;
};

/**
 * Assign card variants based on distribution preferences
 */
export const assignCardVariants = (
  artworks: Painting[],
  cardVariants: CardVariant[],
  distribution?: { small: number; medium: number; large: number }
): CardVariant[] => {
  if (!distribution) {
    // Simple cycling through variants
    return artworks.map((_, index) => cardVariants[index % cardVariants.length]);
  }

  const variants: CardVariant[] = [];
  const totalCount = artworks.length;
  
  // Calculate counts for each variant based on distribution percentages
  const smallCount = Math.floor((distribution.small / 100) * totalCount);
  const mediumCount = Math.floor((distribution.medium / 100) * totalCount);
  const largeCount = totalCount - smallCount - mediumCount; // Remaining goes to large
  
  // Create array with distributed variants
  const distributedVariants: CardVariant[] = [
    ...Array(smallCount).fill('small'),
    ...Array(mediumCount).fill('medium'),
    ...Array(largeCount).fill('large')
  ];
  
  // Shuffle for random distribution
  return shuffleArray(distributedVariants);
};

/**
 * Basic masonry layout calculation - distributes items to shortest column
 */
export const calculateBasicMasonryLayout = (
  artworks: Painting[],
  options: MasonryLayoutOptions
): MasonryColumn[] => {
  const { columnCount, cardVariants, gap } = options;
  
  const columns: MasonryColumn[] = Array.from({ length: columnCount }, () => ({
    items: [],
    height: 0
  }));

  artworks.forEach((artwork, index) => {
    // Find column with minimum height
    const shortestColumnIndex = columns.reduce((minIndex, column, currentIndex) => 
      column.height < columns[minIndex].height ? currentIndex : minIndex, 0
    );
    
    // Assign variant
    const variant = cardVariants[index % cardVariants.length];
    const cardHeight = getCardHeight(variant);
    
    // Add artwork with variant to the shortest column
    columns[shortestColumnIndex].items.push({ ...artwork, variant });
    columns[shortestColumnIndex].height += cardHeight + gap;
  });

  return columns;
};

/**
 * Advanced masonry layout calculation with better balance
 */
export const calculateBalancedMasonryLayout = (
  artworks: Painting[],
  options: MasonryLayoutOptions
): MasonryColumn[] => {
  const { columnCount, cardVariants, gap, balanceThreshold = 100, variantDistribution } = options;
  
  // Assign variants with distribution
  const assignedVariants = assignCardVariants(artworks, cardVariants, variantDistribution);
  
  const columns: MasonryColumn[] = Array.from({ length: columnCount }, () => ({
    items: [],
    height: 0
  }));

  artworks.forEach((artwork, index) => {
    const variant = assignedVariants[index];
    const cardHeight = getCardHeight(variant);
    
    // Find the best column considering balance
    const bestColumnIndex = findBestColumn(columns, cardHeight + gap, balanceThreshold);
    
    // Add artwork with variant to the best column
    columns[bestColumnIndex].items.push({ ...artwork, variant });
    columns[bestColumnIndex].height += cardHeight + gap;
  });

  return columns;
};

/**
 * Find the best column to place the next item for optimal balance
 */
const findBestColumn = (
  columns: MasonryColumn[],
  itemHeight: number,
  balanceThreshold: number
): number => {
  // First, try to find the shortest column
  const shortestColumnIndex = columns.reduce((minIndex, column, currentIndex) => 
    column.height < columns[minIndex].height ? currentIndex : minIndex, 0
  );
  
  const shortestHeight = columns[shortestColumnIndex].height;
  const newHeight = shortestHeight + itemHeight;
  
  // Check if adding to shortest column would create too much imbalance
  const maxHeightAfterAdd = Math.max(...columns.map((col, idx) => 
    idx === shortestColumnIndex ? newHeight : col.height
  ));
  
  const minHeightAfterAdd = Math.min(...columns.map((col, idx) => 
    idx === shortestColumnIndex ? newHeight : col.height
  ));
  
  // If balance is acceptable, use shortest column
  if (maxHeightAfterAdd - minHeightAfterAdd <= balanceThreshold) {
    return shortestColumnIndex;
  }
  
  // Otherwise, find a column that maintains better balance
  let bestIndex = shortestColumnIndex;
  let bestBalance = maxHeightAfterAdd - minHeightAfterAdd;
  
  columns.forEach((column, index) => {
    const testHeight = column.height + itemHeight;
    const testMaxHeight = Math.max(...columns.map((col, idx) => 
      idx === index ? testHeight : col.height
    ));
    const testMinHeight = Math.min(...columns.map((col, idx) => 
      idx === index ? testHeight : col.height
    ));
    const testBalance = testMaxHeight - testMinHeight;
    
    if (testBalance < bestBalance) {
      bestBalance = testBalance;
      bestIndex = index;
    }
  });
  
  return bestIndex;
};

/**
 * Calculate responsive masonry layout based on screen size
 */
export const calculateResponsiveMasonryLayout = (
  artworks: Painting[],
  screenWidth: number,
  baseOptions: Omit<MasonryLayoutOptions, 'columnCount'>
): MasonryColumn[] => {
  // Determine column count based on screen size
  let columnCount: number;
  if (screenWidth < 480) {
    columnCount = 1;
  } else if (screenWidth < 768) {
    columnCount = 2;
  } else {
    columnCount = 3;
  }
  
  const options: MasonryLayoutOptions = {
    ...baseOptions,
    columnCount
  };
  
  return calculateBalancedMasonryLayout(artworks, options);
};

/**
 * Utility function to shuffle an array (Fisher-Yates algorithm)
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Get layout statistics for debugging and optimization
 */
export const getMasonryLayoutStats = (columns: MasonryColumn[]) => {
  const heights = columns.map(col => col.height);
  const maxHeight = Math.max(...heights);
  const minHeight = Math.min(...heights);
  const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length;
  const heightDifference = maxHeight - minHeight;
  
  return {
    columnCount: columns.length,
    heights,
    maxHeight,
    minHeight,
    avgHeight,
    heightDifference,
    balance: heightDifference / avgHeight, // Lower is better
    itemCounts: columns.map(col => col.items.length)
  };
};

/**
 * Optimize existing layout by redistributing items if needed
 */
export const optimizeMasonryLayout = (
  columns: MasonryColumn[],
  maxImbalance: number = 100
): MasonryColumn[] => {
  const stats = getMasonryLayoutStats(columns);
  
  // If layout is already balanced, return as-is
  if (stats.heightDifference <= maxImbalance) {
    return columns;
  }
  
  // Simple optimization: move items from tallest to shortest column
  const optimized = columns.map(col => ({ ...col, items: [...col.items] }));
  
  while (true) {
    const currentStats = getMasonryLayoutStats(optimized);
    if (currentStats.heightDifference <= maxImbalance) {
      break;
    }
    
    // Find tallest and shortest columns
    const tallestIndex = optimized.reduce((maxIndex, col, index) => 
      col.height > optimized[maxIndex].height ? index : maxIndex, 0
    );
    
    const shortestIndex = optimized.reduce((minIndex, col, index) => 
      col.height < optimized[minIndex].height ? index : minIndex, 0
    );
    
    // Move last item from tallest to shortest if it improves balance
    const tallestColumn = optimized[tallestIndex];
    const shortestColumn = optimized[shortestIndex];
    
    if (tallestColumn.items.length > 0) {
      const itemToMove = tallestColumn.items[tallestColumn.items.length - 1];
      const itemHeight = getCardHeight(itemToMove.variant);
      
      // Check if move improves balance
      const newTallestHeight = tallestColumn.height - itemHeight;
      const newShortestHeight = shortestColumn.height + itemHeight;
      
      if (Math.abs(newTallestHeight - newShortestHeight) < currentStats.heightDifference) {
        // Make the move
        tallestColumn.items.pop();
        tallestColumn.height = newTallestHeight;
        shortestColumn.items.push(itemToMove);
        shortestColumn.height = newShortestHeight;
      } else {
        // No improvement possible, break
        break;
      }
    } else {
      break;
    }
  }
  
  return optimized;
};