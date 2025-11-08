/**
 * Custom hook for managing masonry gallery animations
 * Provides staggered entrance animations with intersection observer
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface AnimationConfig {
  staggerDelay: number;
  threshold: number;
  rootMargin: string;
}

interface UseMasonryAnimationsReturn {
  registerCard: (element: HTMLElement | null, index: number) => void;
  getAnimationDelay: (index: number) => number;
  visibleCards: Set<number>;
  isCardVisible: (index: number) => boolean;
}

const useMasonryAnimations = (
  totalCards: number,
  config: AnimationConfig = {
    staggerDelay: 100,
    threshold: 0.1,
    rootMargin: '50px'
  }
): UseMasonryAnimationsReturn => {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardElementsRef = useRef<Map<number, HTMLElement>>(new Map());

  // Initialize intersection observer
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // If user prefers reduced motion, make all cards visible immediately
      setVisibleCards(new Set(Array.from({ length: totalCards }, (_, i) => i)));
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-card-index') || '0');
            setVisibleCards(prev => new Set([...prev, index]));
            
            // Unobserve the element once it's visible to improve performance
            observerRef.current?.unobserve(entry.target);
            
            // Clean up will-change after animation completes
            const element = entry.target as HTMLElement;
            setTimeout(() => {
              element.classList.add('animation-complete');
            }, 600); // Match animation duration
          }
        });
      },
      {
        threshold: config.threshold,
        rootMargin: config.rootMargin
      }
    );

    // Observe any existing elements
    cardElementsRef.current.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
      // Clean up element references
      cardElementsRef.current.clear();
    };
  }, [totalCards, config.threshold, config.rootMargin]);

  // Register a card element for observation
  const registerCard = useCallback((element: HTMLElement | null, index: number) => {
    if (!element) return;

    // Set data attribute for identification
    element.setAttribute('data-card-index', index.toString());
    
    // Store element reference
    cardElementsRef.current.set(index, element);
    
    // Observe the element if observer is ready
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  // Get animation delay for a specific card
  const getAnimationDelay = useCallback((index: number): number => {
    return visibleCards.has(index) ? index * config.staggerDelay : 0;
  }, [visibleCards, config.staggerDelay]);

  // Check if a card is visible
  const isCardVisible = useCallback((index: number): boolean => {
    return visibleCards.has(index);
  }, [visibleCards]);

  return {
    registerCard,
    getAnimationDelay,
    visibleCards,
    isCardVisible
  };
};

export default useMasonryAnimations;