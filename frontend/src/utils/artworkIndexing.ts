/**
 * Utility functions for assigning and managing artwork index numbers
 */

import { Painting } from '../types/painting';

/**
 * Assigns sequential index numbers to an array of paintings
 * @param paintings - Array of paintings to index
 * @returns Array of paintings with index property assigned starting from 1
 */
export function assignIndices(paintings: Painting[]): Painting[] {
  return paintings.map((painting, index) => ({
    ...painting,
    index: index + 1
  }));
}

/**
 * Formats artwork reference string for inquiry form
 * @param painting - Painting object with optional index
 * @returns Formatted reference string in format "Artwork #[index] - [title]" or just "Artwork #[index]" if no title
 */
export function formatArtworkReference(painting: Painting): string {
  const title = painting.title?.trim();
  
  // If painting has an index
  if (painting.index !== undefined && painting.index > 0) {
    // If there's a title, include it
    if (title) {
      return `Artwork #${painting.index} - ${title}`;
    }
    // If no title, just return the index
    return `Artwork #${painting.index}`;
  }
  
  // Fallback to title only if no index (or "Untitled" if no title either)
  return title || 'Untitled';
}
