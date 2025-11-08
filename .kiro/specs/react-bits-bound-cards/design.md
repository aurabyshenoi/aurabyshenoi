# React Bits Bound Cards Masonry Gallery Design Document

## Overview

This design document outlines the implementation of a masonry gallery using React Bits bound cards for the featured artwork section. The design replaces the current custom collage-style gallery with a modern, dynamic masonry layout that leverages React Bits components for consistent styling and animations while maintaining existing modal functionality. The masonry layout will create an organic, Pinterest-like arrangement where cards can have varying heights based on content.

## Architecture

### Component Structure
```
Featured Artwork Section
├── Section Header ("Featured Artwork")
├── Masonry Gallery Container
│   ├── React Bits Bound Card 1 (dynamic height)
│   ├── React Bits Bound Card 2 (dynamic height)
│   ├── React Bits Bound Card 3 (dynamic height)
│   ├── React Bits Bound Card 4 (dynamic height)
│   ├── React Bits Bound Card 5 (dynamic height)
│   └── React Bits Bound Card 6 (dynamic height)
├── Gallery Controls (optional filter/sort controls)
└── Existing Modal Viewer (preserved)
```

### Technology Stack
- **React Bits**: UI component library for bound cards
- **React**: Component framework
- **CSS Grid/Flexbox**: For masonry layout positioning
- **React Masonry CSS**: Library for responsive masonry layout
- **TypeScript**: Type safety for component props and state
- **Existing Modal System**: Preserved modal viewer functionality

## Components and Interfaces

### MasonryGallery Component
**Purpose**: Main container component that arranges React Bits bound cards in a masonry layout

**Props Interface**:
```typescript
interface MasonryGalleryProps {
  artworks: ArtworkData[];
  columns?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  gap?: number;
  onCardClick: (artwork: ArtworkData, index: number) => void;
  cardVariants?: ('small' | 'medium' | 'large')[];
  animationDelay?: number;
}
```

**Component Structure**:
```tsx
const MasonryGallery: React.FC<MasonryGalleryProps> = ({
  artworks,
  columns = { desktop: 3, tablet: 2, mobile: 1 },
  gap = 20,
  onCardClick,
  cardVariants = ['small', 'medium', 'large'],
  animationDelay = 100
}) => {
  // Implementation
};
```

### BoundArtworkCard Component
**Purpose**: Wrapper around React Bits bound card component customized for artwork display in masonry layout

**Props Interface**:
```typescript
interface BoundArtworkCardProps {
  artwork: ArtworkData;
  variant: 'small' | 'medium' | 'large';
  onClick: (artwork: ArtworkData) => void;
  animationDelay?: number;
  index: number;
}
```

**React Bits Integration**:
```tsx
import { BoundCard } from 'react-bits';

const BoundArtworkCard: React.FC<BoundArtworkCardProps> = ({
  artwork,
  variant,
  onClick,
  animationDelay = 0,
  index
}) => {
  const getCardHeight = (variant: string) => {
    switch (variant) {
      case 'small': return 250;
      case 'medium': return 320;
      case 'large': return 400;
      default: return 300;
    }
  };

  return (
    <BoundCard
      className={`artwork-bound-card variant-${variant}`}
      style={{
        height: getCardHeight(variant),
        animationDelay: `${animationDelay * index}ms`
      }}
      onClick={() => onClick(artwork)}
      variant="elevated"
      interactive
      bound={{
        strength: 0.4,
        damping: 0.7
      }}
    >
      {/* Card content */}
    </BoundCard>
  );
};
```

### Masonry Layout System
**Layout Foundation**:
```typescript
interface MasonryColumn {
  items: ArtworkData[];
  height: number;
}

const calculateMasonryLayout = (
  artworks: ArtworkData[],
  columnCount: number,
  cardVariants: string[]
): MasonryColumn[] => {
  const columns: MasonryColumn[] = Array.from({ length: columnCount }, () => ({
    items: [],
    height: 0
  }));

  artworks.forEach((artwork, index) => {
    // Find column with minimum height
    const shortestColumn = columns.reduce((min, col, idx) => 
      col.height < columns[min].height ? idx : min, 0
    );
    
    // Assign variant based on index or random selection
    const variant = cardVariants[index % cardVariants.length];
    const cardHeight = getCardHeight(variant);
    
    columns[shortestColumn].items.push({ ...artwork, variant });
    columns[shortestColumn].height += cardHeight + 20; // gap
  });

  return columns;
};

const getCardHeight = (variant: string): number => {
  switch (variant) {
    case 'small': return 250;
    case 'medium': return 320;
    case 'large': return 400;
    default: return 300;
  }
};
```

## Data Models

### Artwork Data Structure
```typescript
interface ArtworkData {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  artist?: string;
  medium?: string;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
  price?: number;
  description?: string;
}
```

### Gallery Configuration
```typescript
interface MasonryGalleryConfig {
  layout: {
    columns: {
      desktop: number;
      tablet: number;
      mobile: number;
    };
    gap: number;
    cardVariants: ('small' | 'medium' | 'large')[];
    variantDistribution: {
      small: number;    // percentage
      medium: number;   // percentage
      large: number;    // percentage
    };
  };
  animations: {
    staggerDelay: number;
    hoverScale: number;
    boundStrength: number;
    boundDamping: number;
  };
  interactions: {
    lazyLoad: boolean;
    infiniteScroll: boolean;
    filterEnabled: boolean;
    sortEnabled: boolean;
  };
}
```

### React Bits Bound Card Configuration
```typescript
interface BoundCardConfig {
  variant: 'flat' | 'elevated' | 'outlined';
  interactive: boolean;
  bound: {
    strength: number; // 0-1, controls bound effect intensity
    damping: number;  // 0-1, controls bounce damping
    stiffness: number; // Spring stiffness
  };
  hover: {
    scale: number;
    elevation: number;
    transition: string;
  };
}
```

## Error Handling

### React Bits Library Loading
- **Fallback Component**: Provide fallback card component if React Bits fails to load
- **Graceful Degradation**: Fall back to standard div-based cards with similar styling
- **Error Boundaries**: Wrap circular gallery in error boundary to prevent app crashes

### Masonry Layout Calculations
- **Empty Arrays**: Handle edge cases when no artworks are provided
- **Column Distribution**: Ensure balanced height distribution across columns
- **Responsive Breakpoints**: Recalculate layout when screen size changes
- **Dynamic Heights**: Handle varying card heights gracefully

### Animation Performance
- **Reduced Motion**: Respect user's reduced motion preferences
- **Performance Monitoring**: Monitor frame rates during animations
- **Fallback Animations**: Provide CSS-only animations if JavaScript animations fail

## Testing Strategy

### Unit Testing
- Masonry layout calculations with various artwork counts and column configurations
- React Bits bound card prop passing and event handling
- Responsive column count and card variant calculations
- Modal integration with masonry gallery clicks

### Integration Testing
- React Bits library integration and component rendering
- Masonry layout responsiveness and reflow animations
- Modal viewer opening from bound card clicks
- Keyboard navigation and accessibility features

### Visual Testing
- Cross-browser compatibility for CSS Grid/Flexbox and React Bits components
- Responsive masonry layout across mobile, tablet, and desktop
- Animation performance and smoothness during layout changes
- Bound card hover effects and staggered animations

### Accessibility Testing
- Keyboard navigation through masonry gallery
- Screen reader compatibility with React Bits components
- Focus management during gallery interactions
- ARIA labels and semantic markup for dynamic layout

## Implementation Notes

### CSS Masonry Layout
```css
.masonry-gallery-container {
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.artwork-bound-card {
  width: 100%;
  transition: transform 0.3s ease;
  cursor: pointer;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

.artwork-bound-card.variant-small {
  height: 250px;
}

.artwork-bound-card.variant-medium {
  height: 320px;
}

.artwork-bound-card.variant-large {
  height: 400px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .masonry-gallery-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .masonry-column {
    gap: 15px;
  }
  
  .artwork-bound-card.variant-small {
    height: 200px;
  }
  
  .artwork-bound-card.variant-medium {
    height: 250px;
  }
  
  .artwork-bound-card.variant-large {
    height: 300px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .masonry-gallery-container {
    gap: 15px;
  }
  
  .masonry-column {
    gap: 15px;
  }
}
```

### React Bits Bound Card Styling
```css
.artwork-bound-card .react-bits-bound-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.artwork-bound-card:hover .react-bits-bound-card {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.artwork-image {
  width: 100%;
  height: 70%;
  object-fit: cover;
}

.artwork-info {
  padding: 12px;
  height: 30%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.artwork-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artwork-medium {
  font-size: 12px;
  color: #666;
  text-align: center;
}
```

### Staggered Animation System
```typescript
const useMasonryAnimations = (
  artworks: ArtworkData[],
  staggerDelay: number = 100
) => {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.1 }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  const registerCard = (element: HTMLElement | null, index: number) => {
    if (element && observerRef.current) {
      element.setAttribute('data-index', index.toString());
      observerRef.current.observe(element);
    }
  };

  const getAnimationDelay = (index: number) => {
    return visibleCards.has(index) ? index * staggerDelay : 0;
  };

  return {
    registerCard,
    getAnimationDelay,
    visibleCards
  };
};
```

### Modal Integration
```typescript
const handleCardClick = (artwork: ArtworkData, index: number) => {
  // Preserve existing modal functionality
  setSelectedArtwork(artwork);
  setSelectedIndex(index);
  setIsModalOpen(true);
  
  // Optional: Highlight the clicked card
  setActiveCardIndex(index);
  
  // Smooth scroll to card position when modal closes
  const scrollToCard = () => {
    const cardElement = document.querySelector(`[data-card-index="${index}"]`);
    if (cardElement) {
      cardElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };
  
  // Store scroll callback for modal close
  setScrollCallback(() => scrollToCard);
};
```

### Responsive Configuration
```typescript
const useResponsiveMasonryConfig = () => {
  const [config, setConfig] = useState<MasonryGalleryConfig>();

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth;
      
      if (width < 480) {
        setConfig({
          columns: 1,
          gap: 15,
          cardVariants: ['small', 'medium'] // Fewer large cards on mobile
        });
      } else if (width < 768) {
        setConfig({
          columns: 2,
          gap: 15,
          cardVariants: ['small', 'medium', 'large']
        });
      } else if (width < 1024) {
        setConfig({
          columns: 2,
          gap: 20,
          cardVariants: ['small', 'medium', 'large']
        });
      } else {
        setConfig({
          columns: 3,
          gap: 20,
          cardVariants: ['small', 'medium', 'large']
        });
      }
    };

    updateConfig();
    window.addEventListener('resize', updateConfig);
    return () => window.removeEventListener('resize', updateConfig);
  }, []);

  return config;
};
```

## React Bits Integration Details

### Installation and Setup
```bash
npm install react-bits
# or
yarn add react-bits
```

### Component Import and Usage
```typescript
import { BoundCard, BoundCardProps } from 'react-bits';

// Custom bound card configuration for artwork display
const artworkBoundConfig: Partial<BoundCardProps> = {
  variant: 'elevated',
  interactive: true,
  bound: {
    strength: 0.4,
    damping: 0.7,
    stiffness: 300
  },
  className: 'artwork-bound-card'
};
```

### Performance Considerations
- **Lazy Loading**: Implement lazy loading for artwork images in bound cards
- **Animation Optimization**: Use `transform` and `opacity` for smooth animations
- **Memory Management**: Properly cleanup event listeners and intervals
- **Bundle Size**: Import only necessary React Bits components to minimize bundle size