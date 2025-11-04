// API utility functions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Creates a full API URL from a relative path
 */
export const createApiUrl = (path: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

/**
 * Enhanced fetch function that automatically prepends the API base URL
 */
export const apiFetch = async (path: string, options?: RequestInit): Promise<Response> => {
  const url = createApiUrl(path);
  return fetch(url, options);
};

/**
 * API fetch with automatic JSON parsing and error handling
 */
export const apiRequest = async <T = any>(path: string, options?: RequestInit): Promise<T> => {
  const response = await apiFetch(path, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  return response.json();
};