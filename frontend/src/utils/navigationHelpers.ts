// Type definition for page types
export type PageType = 'home' | 'gallery' | 'about' | 'contact' | 'admin' | 'privacy' | 'terms';

/**
 * Convert URL path to page state
 * @param path - The URL pathname
 * @returns The corresponding page type
 */
export const getPageFromPath = (path: string): PageType => {
  // Remove trailing slash and normalize
  const normalizedPath = path.replace(/\/$/, '') || '/';
  
  if (normalizedPath === '/' || normalizedPath === '/home') return 'home';
  if (normalizedPath === '/gallery') return 'gallery';
  if (normalizedPath === '/about') return 'about';
  if (normalizedPath === '/contact') return 'contact';
  if (normalizedPath === '/admin') return 'admin';
  if (normalizedPath === '/privacy') return 'privacy';
  if (normalizedPath === '/terms') return 'terms';
  
  // Default to home for unknown paths
  return 'home';
};

/**
 * Convert page state to URL path
 * @param page - The page type
 * @returns The corresponding URL path
 */
export const getPathFromPage = (page: PageType): string => {
  const pathMap: Record<PageType, string> = {
    home: '/',
    gallery: '/gallery',
    about: '/about',
    contact: '/contact',
    admin: '/admin',
    privacy: '/privacy',
    terms: '/terms'
  };
  
  return pathMap[page] || '/';
};
