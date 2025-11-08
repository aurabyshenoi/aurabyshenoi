# Design Document

## Overview

This design outlines the approach to replace dummy Unsplash images with actual local artwork images in the gallery system. The solution involves updating the mock data in the usePaintings hook to reference local image files while maintaining the existing component architecture.

## Architecture

The change will be isolated to the data layer without affecting the component structure:

- **Data Layer**: Update mockPaintings array in usePaintings hook
- **Component Layer**: No changes needed - existing Gallery, PaintingGrid, and PaintingModal components will work unchanged
- **Image Serving**: Leverage Vite's public directory serving for local images

## Components and Interfaces

### Affected Components
- `usePaintings.ts`: Contains the mock data that needs updating
- No component interface changes required

### Image Structure
Maintain existing image object structure:
```typescript
images: {
  thumbnail: string,  // Local path for thumbnail
  fullSize: string[]  // Array of local paths for full-size images
}
```

## Data Models

### Image Path Format
- Thumbnail: `/img{n}.jpeg` (same as full size for simplicity)
- Full Size: `['/img{n}.jpeg']` (single image per painting)

### Painting Mapping
Map the 12 available images (img1.jpeg - img12.jpeg) to the 6 existing mock paintings:
- Use img1.jpeg through img6.jpeg for the 6 paintings
- Reserve img7.jpeg through img12.jpeg for future paintings

## Error Handling

### Image Loading
- Existing OptimizedImage component handles loading states
- Fallback to placeholder-painting.svg if local images fail to load
- No additional error handling needed as local images are more reliable than external URLs

### Missing Images
- Ensure all referenced image files exist in public directory
- Use consistent naming convention

## Testing Strategy

### Manual Testing
- Verify all 6 paintings display correct local images
- Test image loading performance compared to external URLs
- Confirm thumbnail and full-size images work in modal view
- Test responsive behavior across different screen sizes

### Validation
- Check browser network tab to confirm no external image requests
- Verify faster loading times with local images
- Ensure no broken image placeholders appear