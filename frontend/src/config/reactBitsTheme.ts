/**
 * React Bits Theme Configuration
 * Centralized theme settings for consistent styling across bound components
 */

import { MasonryGalleryConfig } from '../types/react-bits';

export const reactBitsTheme = {
  // Color palette - matching site's existing design system
  colors: {
    primary: '#9CAF88',        // --color-sage-green
    primaryLight: '#B8C5A6',   // --color-sage-green-light
    primaryDark: '#7A8F6B',    // --color-sage-green-dark
    secondary: '#8B6F47',      // --color-brown
    secondaryLight: '#A68B6A', // --color-brown-light
    secondaryDark: '#6B5537',  // --color-brown-dark
    background: '#FAF8F5',     // --color-cream
    surface: '#F7F5F2',        // --color-off-white
    border: '#E8E6E1',         // --color-warm-gray
    text: {
      primary: '#3A3A3A',      // --color-text-dark
      secondary: '#6B6B6B',    // --color-text-light
      muted: '#8B8B8B'
    },
    shadow: {
      light: 'rgba(58, 58, 58, 0.08)',    // Based on text-dark with low opacity
      medium: 'rgba(58, 58, 58, 0.12)',   // Based on text-dark with medium opacity
      dark: 'rgba(58, 58, 58, 0.20)'      // Based on text-dark with higher opacity
    }
  },

  // Typography - matching site's font system
  typography: {
    fontFamily: {
      body: 'Inter, system-ui, sans-serif',      // Body text font
      heading: 'Playfair Display, serif'         // Heading font
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem'   // 24px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.6
    }
  },

  // Spacing - consistent with site's layout
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem'     // 48px
  },

  // Border radius - matching site's rounded corners
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px'    // Full rounded
  },

  // Shadows - using site's color palette for natural shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(58, 58, 58, 0.05)',
    md: '0 4px 6px -1px rgba(58, 58, 58, 0.08), 0 2px 4px -1px rgba(58, 58, 58, 0.04)',
    lg: '0 8px 16px -4px rgba(58, 58, 58, 0.12), 0 4px 8px -2px rgba(58, 58, 58, 0.06)',
    xl: '0 16px 32px -8px rgba(58, 58, 58, 0.15), 0 8px 16px -4px rgba(58, 58, 58, 0.08)',
    '2xl': '0 24px 48px -12px rgba(58, 58, 58, 0.18), 0 12px 24px -6px rgba(58, 58, 58, 0.10)'
  },

  // Animation settings
  animations: {
    duration: {
      fast: '0.15s',
      normal: '0.3s',
      slow: '0.5s'
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    },
    spring: {
      stiffness: 300,
      damping: 30,
      mass: 1
    }
  }
};

// Default masonry gallery configuration
export const defaultMasonryConfig: MasonryGalleryConfig = {
  layout: {
    columns: {
      desktop: 3,
      tablet: 2,
      mobile: 1
    },
    gap: 20,
    cardVariants: ['small', 'medium', 'large'],
    variantDistribution: {
      small: 40,    // 40%
      medium: 40,   // 40%
      large: 20     // 20%
    }
  },
  animations: {
    staggerDelay: 100,
    hoverScale: 1.05,
    boundStrength: 0.4,
    boundDamping: 0.7
  },
  interactions: {
    lazyLoad: true,
    infiniteScroll: false,
    filterEnabled: false,
    sortEnabled: false
  }
};

// Bound card presets - refined for artwork display with elegant, subtle animations
export const boundCardPresets = {
  subtle: {
    strength: 0.15,    // Very gentle movement
    damping: 0.85,     // High damping for smooth, controlled motion
    stiffness: 450     // Higher stiffness for responsive feel
  },
  normal: {
    strength: 0.25,    // Moderate movement
    damping: 0.8,      // Good balance of responsiveness and control
    stiffness: 380     // Balanced stiffness
  },
  strong: {
    strength: 0.4,     // More pronounced movement
    damping: 0.7,      // Lower damping for more dynamic feel
    stiffness: 300     // Lower stiffness for more fluid motion
  },
  artwork: {
    strength: 0.2,     // Gentle, art-appropriate movement
    damping: 0.82,     // High damping for elegant motion
    stiffness: 400,    // Responsive but controlled
    mass: 0.8          // Lighter feel for artwork cards
  },
  gallery: {
    strength: 0.18,    // Very subtle for gallery browsing
    damping: 0.88,     // Maximum control for professional feel
    stiffness: 420,    // Quick response without overshoot
    mass: 0.7          // Light, airy feel
  }
};

// Hover effect configurations - elegant and refined for artwork presentation
export const hoverEffectPresets = {
  small: {
    scale: 1.02,       // Subtle scale for small cards
    elevation: 4,      // Gentle elevation
    transition: '0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Smooth easing
    shadowIntensity: 0.12,
    translateY: -2     // Slight upward movement
  },
  medium: {
    scale: 1.03,       // Moderate scale for medium cards
    elevation: 6,      // Moderate elevation
    transition: '0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    shadowIntensity: 0.15,
    translateY: -3     // Moderate upward movement
  },
  large: {
    scale: 1.025,      // Gentle scale for large cards (less dramatic due to size)
    elevation: 8,      // Higher elevation for impact
    transition: '0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    shadowIntensity: 0.18,
    translateY: -4     // More pronounced upward movement
  },
  gallery: {
    scale: 1.02,       // Consistent gentle scale for gallery view
    elevation: 5,      // Moderate elevation
    transition: '0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    shadowIntensity: 0.14,
    translateY: -2.5   // Subtle upward movement
  }
};

// Animation state configurations
export const animationStates = {
  entrance: {
    duration: '0.8s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    staggerDelay: 100
  },
  hover: {
    duration: '0.3s',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  focus: {
    duration: '0.2s',
    easing: 'ease-out'
  }
};

// Comprehensive React Bits component theme configuration
export const reactBitsComponentTheme = {
  // BoundCard specific theming
  boundCard: {
    base: {
      backgroundColor: reactBitsTheme.colors.surface,
      borderRadius: reactBitsTheme.borderRadius.lg,
      boxShadow: reactBitsTheme.shadows.md,
      border: `1px solid ${reactBitsTheme.colors.border}`,
      fontFamily: reactBitsTheme.typography.fontFamily.body,
      color: reactBitsTheme.colors.text.primary,
      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    variants: {
      elevated: {
        backgroundColor: reactBitsTheme.colors.background,
        boxShadow: reactBitsTheme.shadows.lg,
        border: 'none'
      },
      outlined: {
        backgroundColor: 'transparent',
        border: `2px solid ${reactBitsTheme.colors.border}`,
        boxShadow: 'none'
      },
      flat: {
        backgroundColor: reactBitsTheme.colors.surface,
        boxShadow: 'none',
        border: 'none'
      }
    },
    states: {
      hover: {
        boxShadow: reactBitsTheme.shadows.xl,
        borderColor: reactBitsTheme.colors.primary,
        transform: 'translateY(-2px)'
      },
      focus: {
        outline: `3px solid ${reactBitsTheme.colors.primary}`,
        outlineOffset: '2px'
      },
      active: {
        transform: 'translateY(0) scale(0.98)',
        boxShadow: reactBitsTheme.shadows.md
      }
    }
  },

  // Artwork-specific styling
  artwork: {
    card: {
      backgroundColor: reactBitsTheme.colors.background,
      borderRadius: reactBitsTheme.borderRadius.lg,
      overflow: 'hidden',
      boxShadow: reactBitsTheme.shadows.md,
      transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    image: {
      borderRadius: `${reactBitsTheme.borderRadius.lg} ${reactBitsTheme.borderRadius.lg} 0 0`,
      transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    info: {
      padding: reactBitsTheme.spacing.lg,
      backgroundColor: reactBitsTheme.colors.background,
      fontFamily: reactBitsTheme.typography.fontFamily.body
    },
    title: {
      fontFamily: reactBitsTheme.typography.fontFamily.heading,
      fontSize: reactBitsTheme.typography.fontSize.base,
      fontWeight: reactBitsTheme.typography.fontWeight.semibold,
      color: reactBitsTheme.colors.text.primary,
      lineHeight: reactBitsTheme.typography.lineHeight.tight
    },
    metadata: {
      fontSize: reactBitsTheme.typography.fontSize.sm,
      color: reactBitsTheme.colors.text.secondary,
      lineHeight: reactBitsTheme.typography.lineHeight.normal
    },
    price: {
      backgroundColor: `${reactBitsTheme.colors.background}f0`, // 94% opacity
      backdropFilter: 'blur(8px)',
      borderRadius: reactBitsTheme.borderRadius.full,
      padding: `${reactBitsTheme.spacing.xs} ${reactBitsTheme.spacing.md}`,
      fontSize: reactBitsTheme.typography.fontSize.xs,
      fontWeight: reactBitsTheme.typography.fontWeight.semibold,
      color: reactBitsTheme.colors.text.primary,
      boxShadow: reactBitsTheme.shadows.sm
    }
  },

  // Animation configurations
  animations: {
    entrance: {
      duration: '0.8s',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      staggerDelay: 120 // Slightly slower for more elegant feel
    },
    hover: {
      duration: '0.35s',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    focus: {
      duration: '0.2s',
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    },
    bound: {
      strength: 0.2,
      damping: 0.82,
      stiffness: 400,
      mass: 0.8
    }
  }
};

// CSS custom properties for React Bits integration
export const reactBitsCSSVariables = {
  '--rb-color-primary': reactBitsTheme.colors.primary,
  '--rb-color-primary-light': reactBitsTheme.colors.primaryLight,
  '--rb-color-primary-dark': reactBitsTheme.colors.primaryDark,
  '--rb-color-secondary': reactBitsTheme.colors.secondary,
  '--rb-color-background': reactBitsTheme.colors.background,
  '--rb-color-surface': reactBitsTheme.colors.surface,
  '--rb-color-border': reactBitsTheme.colors.border,
  '--rb-color-text-primary': reactBitsTheme.colors.text.primary,
  '--rb-color-text-secondary': reactBitsTheme.colors.text.secondary,
  '--rb-color-text-muted': reactBitsTheme.colors.text.muted,
  '--rb-font-family-body': reactBitsTheme.typography.fontFamily.body,
  '--rb-font-family-heading': reactBitsTheme.typography.fontFamily.heading,
  '--rb-border-radius-sm': reactBitsTheme.borderRadius.sm,
  '--rb-border-radius-md': reactBitsTheme.borderRadius.md,
  '--rb-border-radius-lg': reactBitsTheme.borderRadius.lg,
  '--rb-border-radius-xl': reactBitsTheme.borderRadius.xl,
  '--rb-shadow-sm': reactBitsTheme.shadows.sm,
  '--rb-shadow-md': reactBitsTheme.shadows.md,
  '--rb-shadow-lg': reactBitsTheme.shadows.lg,
  '--rb-shadow-xl': reactBitsTheme.shadows.xl,
  '--rb-spacing-xs': reactBitsTheme.spacing.xs,
  '--rb-spacing-sm': reactBitsTheme.spacing.sm,
  '--rb-spacing-md': reactBitsTheme.spacing.md,
  '--rb-spacing-lg': reactBitsTheme.spacing.lg,
  '--rb-spacing-xl': reactBitsTheme.spacing.xl
};

export default reactBitsTheme;