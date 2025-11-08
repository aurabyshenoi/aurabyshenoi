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
    // Disable animations - make all cards visible immediately for stable layout
    setVisibleCards(new Set(Array.from({ length: totalCards }, (_, i) => i)));
    return;
  }, [totalCards]);

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

  // Get animation delay for a specific card - disabled for stable layout
  const getAnimationDelay = useCallback((index: number): number => {
    return 0;
  }, []);

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