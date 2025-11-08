/**
 * Unit tests for useResponsiveMasonryConfig hook
 * Tests responsive behavior, configuration management, and window resize handling
 */

import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import useResponsiveMasonryConfig, { 
  BREAKPOINTS,
  UseResponsiveMasonryConfigOptions 
} from '../useResponsiveMasonryConfig';

// Mock the theme configuration
vi.mock('../../config/reactBitsTheme', () => ({
  defaultMasonryConfig: {
    layout: {
      variantDistribution: {
        small: 40,
        medium: 40,
        large: 20
      }
    },
    animations: {
      staggerDelay: 100
    }
  }
}));

// Mock window object
const mockWindow = {
  innerWidth: 1200,
  innerHeight: 800,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  matchMedia: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }))
};

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1200,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 800,
});

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: mockWindow.addEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: mockWindow.removeEventListener,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: mockWindow.matchMedia,
});

describe('useResponsiveMasonryConfig Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.innerWidth = 1200;
    window.innerHeight = 800;
  });

  describe('Basic Functionality', () => {
    it('returns initial configuration for desktop', () => {
      const { result } = renderHook(() => useResponsiveMasonryConfig());

      expect(result.current.config).toEqual({
        columns: 3,
        gap: 20,
        cardVariants: ['small', 'medium', 'large'],
        variantDistribution: { small: 40, medium: 40, large: 20 },
        animationDelay: 100,
        cardHeights: { small: 250, medium: 320, large: 400 }
      });

      expect(result.current.currentBreakpoint).toBe('desktop');
      expect(result.current.windowWidth).toBe(1200);
      expect(result.current.windowHeight).toBe(800);
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
    });

    it('provides utility functions', () => {
      const { result } = renderHook(() => useResponsiveMasonryConfig());

      expect(result.current.getColumnCount()).toBe(3);
      expect(result.current.getGapSize()).toBe(20);
      expect(result.current.getCardVariants()).toEqual(['small', 'medium', 'large']);
      expect(result.current.getAnimationDelay()).toBe(100);
      expect(result.current.isBreakpoint('desktop')).toBe(true);
      expect(result.current.isBreakpoint('mobile')).toBe(false);
    });
  });

  describe('Breakpoint Detection', () => {
    it('detects mobile breakpoint correctly', () => {
      window.innerWidth = 400;
      
      const { result } = renderHook(() => useResponsiveMasonryConfig());

      expect(result.current.currentBreakpoint).toBe('mobile');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it('detects tablet breakpoint correctly', () => {
      window.innerWidth = 800; // 768 <= width < 1024 = tablet
      
      const { result } = renderHook(() => useResponsiveMasonryConfig());

      expect(result.current.currentBreakpoint).toBe('tablet');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it('detects desktop breakpoint correctly', () => {
      window.innerWidth = 1100; // >= 1024 = desktop
      
      const { result } = renderHook(() => useResponsiveMasonryConfig());

      expect(result.current.currentBreakpoint).toBe('desktop');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });

    it('handles edge cases at breakpoint boundaries', () => {
      // Exactly at mobile breakpoint
      window.innerWidth = BREAKPOINTS.mobile;
      let { result } = renderHook(() => useResponsiveMasonryConfig());
      expect(result.current.currentBreakpoint).toBe('mobile');

      // Exactly at tablet breakpoint
      window.innerWidth = BREAKPOINTS.tablet;
      ({ result } = renderHook(() => useResponsiveMasonryConfig()));
      expect(result.current.currentBreakpoint).toBe('tablet');

      // Exactly at desktop breakpoint
      window.innerWidth = BREAKPOINTS.desktop;
      ({ result } = renderHook(() => useResponsiveMasonryConfig()));
      expect(result.current.currentBreakpoint).toBe('desktop');
    });
  });

  describe('Responsive Configuration', () => {
    it('applies mobile configuration correctly', () => {
      window.innerWidth = 400;
      
      const { result } = renderHook(() => useResponsiveMasonryConfig());

      expect(result.current.config).toEqual({
        columns: 1,
        gap: 15,
        cardVariants: ['small', 'medium'],
        variantDistribution: { small: 60, medium: 40, large: 0 },
        animationDelay: 80,
        cardHeights: { small: 200, medium: 250, large: 300 }
      });
    });

    it('applies tablet configuration correctly', () => {
      window.innerWidth = 800; // 768 <= width < 1024 = tablet
      
      const { result } = renderHook(() => useResponsiveMasonryConfig());

      expect(result.current.config).toEqual({
        columns: 2,
        gap: 18,
        cardVariants: ['small', 'medium', 'large'],
        variantDistribution: { small: 50, medium: 35, large: 15 },
        animationDelay: 90,
        cardHeights: { small: 220, medium: 280, large: 350 }
      });
    });

    it('applies desktop configuration correctly', () => {
      window.innerWidth = 1100; // >= 1024 = desktop
      
      const { result } = renderHook(() => useResponsiveMasonryConfig());

      expect(result.current.config).toEqual({
        columns: 3,
        gap: 20,
        cardVariants: ['small', 'medium', 'large'],
        variantDistribution: { small: 40, medium: 40, large: 20 },
        animationDelay: 100,
        cardHeights: { small: 250, medium: 320, large: 400 }
      });
    });

    it('uses 4 columns for large desktop screens', () => {
      window.innerWidth = 1300;
      
      const { result } = renderHook(() => useResponsiveMasonryConfig());

      expect(result.current.config.columns).toBe(4);
    });
  });

  describe('Custom Configuration Overrides', () => {
    it('applies mobile configuration override', () => {
      window.innerWidth = 400;
      
      const options: UseResponsiveMasonryConfigOptions = {
        mobileConfig: {
          columns: 2,
          gap: 10,
          cardVariants: ['small']
        }
      };

      const { result } = renderHook(() => useResponsiveMasonryConfig(options));

      expect(result.current.config.columns).toBe(2);
      expect(result.current.config.gap).toBe(10);
      expect(result.current.config.cardVariants).toEqual(['small']);
    });

    it('applies tablet configuration override', () => {
      window.innerWidth = 800; // 768 <= width < 1024 = tablet
      
      const options: UseResponsiveMasonryConfigOptions = {
        tabletConfig: {
          columns: 3,
          gap: 25,
          animationDelay: 150
        }
      };

      const { result } = renderHook(() => useResponsiveMasonryConfig(options));

      expect(result.current.config.columns).toBe(3);
      expect(result.current.config.gap).toBe(25);
      expect(result.current.config.animationDelay).toBe(150);
    });

    it('applies desktop configuration override', () => {
      window.innerWidth = 1100; // >= 1024 = desktop
      
      const options: UseResponsiveMasonryConfigOptions = {
        desktopConfig: {
          columns: 5,
          cardVariants: ['large'],
          variantDistribution: { small: 0, medium: 0, large: 100 }
        }
      };

      const { result } = renderHook(() => useResponsiveMasonryConfig(options));

      expect(result.current.config.columns).toBe(5);
      expect(result.current.config.cardVariants).toEqual(['large']);
      expect(result.current.config.variantDistribution).toEqual({ small: 0, medium: 0, large: 100 });
    });

    it('applies custom breakpoints', () => {
      const options: UseResponsiveMasonryConfigOptions = {
        customBreakpoints: {
          mobile: 600,
          tablet: 900,
          desktop: 1400
        }
      };

      // Test with width that would be tablet in default but mobile in custom
      window.innerWidth = 700;
      
      const { result } = renderHook(() => useResponsiveMasonryConfig(options));

      expect(result.current.currentBreakpoint).toBe('mobile');
    });
  });

  describe('Reduced Motion Support', () => {
    it('disables animations when reduced motion is preferred', () => {
      mockWindow.matchMedia.mockReturnValue({
        matches: true, // prefers-reduced-motion: reduce
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      });

      const { result } = renderHook(() => useResponsiveMasonryConfig({
        respectReducedMotion: true
      }));

      expect(result.current.config.animationDelay).toBe(0);
    });

    it('keeps animations when reduced motion is not preferred', () => {
      mockWindow.matchMedia.mockReturnValue({
        matches: false, // prefers-reduced-motion: no-preference
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      });

      const { result } = renderHook(() => useResponsiveMasonryConfig({
        respectReducedMotion: true
      }));

      expect(result.current.config.animationDelay).toBeGreaterThan(0);
    });

    it('ignores reduced motion when respectReducedMotion is false', () => {
      mockWindow.matchMedia.mockReturnValue({
        matches: true, // prefers-reduced-motion: reduce
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      });

      const { result } = renderHook(() => useResponsiveMasonryConfig({
        respectReducedMotion: false
      }));

      expect(result.current.config.animationDelay).toBeGreaterThan(0);
    });
  });

  describe('Window Resize Handling', () => {
    it('registers resize event listener', () => {
      renderHook(() => useResponsiveMasonryConfig());

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('registers orientation change event listener', () => {
      renderHook(() => useResponsiveMasonryConfig());

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    });

    it('cleans up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useResponsiveMasonryConfig());

      unmount();

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    });

    it('updates configuration when window resizes', () => {
      const { result } = renderHook(() => useResponsiveMasonryConfig({
        resizeDebounce: 0 // Disable debounce for testing
      }));

      // Initial state - desktop
      expect(result.current.currentBreakpoint).toBe('desktop');
      expect(result.current.config.columns).toBe(3);

      // Simulate resize to mobile
      act(() => {
        window.innerWidth = 400;
        window.innerHeight = 600;
        
        // Find and call the resize handler
        const resizeHandler = mockWindow.addEventListener.mock.calls
          .find(call => call[0] === 'resize')?.[1];
        if (resizeHandler) {
          resizeHandler();
        }
      });

      expect(result.current.currentBreakpoint).toBe('mobile');
      expect(result.current.config.columns).toBe(1);
      expect(result.current.windowWidth).toBe(400);
      expect(result.current.windowHeight).toBe(600);
    });

    it('debounces resize events', () => {
      vi.useFakeTimers();
      
      const { result } = renderHook(() => useResponsiveMasonryConfig({
        resizeDebounce: 150
      }));

      const resizeHandler = mockWindow.addEventListener.mock.calls
        .find(call => call[0] === 'resize')?.[1];

      // Trigger multiple resize events quickly
      act(() => {
        window.innerWidth = 500;
        resizeHandler?.();
        window.innerWidth = 600;
        resizeHandler?.();
        window.innerWidth = 700;
        resizeHandler?.();
      });

      // Should not update immediately
      expect(result.current.windowWidth).toBe(1200);

      // Fast-forward past debounce delay
      act(() => {
        vi.advanceTimersByTime(150);
      });

      // Should update to final value
      expect(result.current.windowWidth).toBe(700);

      vi.useRealTimers();
    });
  });

  describe('Reduced Motion Preference Changes', () => {
    it('listens for reduced motion preference changes', () => {
      const mockMediaQuery = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      };

      mockWindow.matchMedia.mockReturnValue(mockMediaQuery);

      renderHook(() => useResponsiveMasonryConfig({
        respectReducedMotion: true
      }));

      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('updates configuration when reduced motion preference changes', () => {
      const mockMediaQuery = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      };

      mockWindow.matchMedia.mockReturnValue(mockMediaQuery);

      const { result } = renderHook(() => useResponsiveMasonryConfig({
        respectReducedMotion: true
      }));

      // Initial state - animations enabled
      expect(result.current.config.animationDelay).toBeGreaterThan(0);

      // Simulate preference change to reduced motion
      act(() => {
        mockMediaQuery.matches = true;
        const changeHandler = mockMediaQuery.addEventListener.mock.calls
          .find(call => call[0] === 'change')?.[1];
        if (changeHandler) {
          changeHandler();
        }
      });

      expect(result.current.config.animationDelay).toBe(0);
    });

    it('cleans up media query listener on unmount', () => {
      const mockMediaQuery = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      };

      mockWindow.matchMedia.mockReturnValue(mockMediaQuery);

      const { unmount } = renderHook(() => useResponsiveMasonryConfig({
        respectReducedMotion: true
      }));

      unmount();

      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined window object gracefully', () => {
      // Mock server-side rendering scenario
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const { result } = renderHook(() => useResponsiveMasonryConfig());

      // Should use default values
      expect(result.current.windowWidth).toBe(1200);
      expect(result.current.windowHeight).toBe(800);
      expect(result.current.currentBreakpoint).toBe('desktop');

      // Restore window
      global.window = originalWindow;
    });

    it('handles very small screen sizes', () => {
      window.innerWidth = 100;
      window.innerHeight = 200;
      
      const { result } = renderHook(() => useResponsiveMasonryConfig());

      expect(result.current.currentBreakpoint).toBe('mobile');
      expect(result.current.config.columns).toBe(1);
    });

    it('handles very large screen sizes', () => {
      window.innerWidth = 5000;
      window.innerHeight = 3000;
      
      const { result } = renderHook(() => useResponsiveMasonryConfig());

      expect(result.current.currentBreakpoint).toBe('desktop');
      expect(result.current.config.columns).toBe(4); // Large desktop gets 4 columns
    });

    it('handles zero debounce delay', () => {
      const { result } = renderHook(() => useResponsiveMasonryConfig({
        resizeDebounce: 0
      }));

      // Should still work without debouncing
      expect(result.current.config).toBeDefined();
    });

    it('handles missing matchMedia support', () => {
      const originalMatchMedia = window.matchMedia;
      // @ts-ignore
      delete window.matchMedia;

      const { result } = renderHook(() => useResponsiveMasonryConfig({
        respectReducedMotion: true
      }));

      // Should not crash and should assume no reduced motion preference
      expect(result.current.config.animationDelay).toBeGreaterThan(0);

      // Restore matchMedia
      window.matchMedia = originalMatchMedia;
    });
  });
});