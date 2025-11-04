import React, { useEffect, useState, useRef } from 'react';
import { Testimonial } from '../types/testimonial';
import TestimonialCard from './TestimonialCard';

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  className?: string;
  animationSpeed?: number; // pixels per second
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ 
  testimonials, 
  className = '',
  animationSpeed = 30 // Default 30 pixels per second for slow scrolling
}) => {
  const [isAnimating, setIsAnimating] = useState(true);
  const [duplicatedTestimonials, setDuplicatedTestimonials] = useState<Testimonial[]>([]);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [isManuallyScrolling, setIsManuallyScrolling] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Duplicate testimonials to create seamless loop
    // We need enough duplicates to ensure smooth continuous scrolling
    const duplicates = Math.max(3, Math.ceil(window.innerWidth / 400)); // Estimate based on card width
    const duplicatedArray = [];
    
    for (let i = 0; i < duplicates; i++) {
      duplicatedArray.push(...testimonials);
    }
    
    setDuplicatedTestimonials(duplicatedArray);
  }, [testimonials]);

  // Auto-scroll animation
  useEffect(() => {
    if (!isAnimating || isManuallyScrolling || duplicatedTestimonials.length === 0) return;

    const cardWidth = 400; // Approximate card width including margin
    const totalWidth = duplicatedTestimonials.length * cardWidth;
    const resetPoint = testimonials.length * cardWidth;

    const animate = () => {
      setCurrentTranslateX(prev => {
        const newValue = prev - animationSpeed / 60; // 60fps
        return newValue <= -resetPoint ? 0 : newValue;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, isManuallyScrolling, duplicatedTestimonials.length, testimonials.length, animationSpeed]);

  // Pause animation on hover
  const handleMouseEnter = () => setIsAnimating(false);
  const handleMouseLeave = () => {
    if (!isManuallyScrolling) {
      setIsAnimating(true);
    }
  };

  // Manual navigation functions
  const scrollLeft = () => {
    if (!carouselRef.current) return;
    
    setIsManuallyScrolling(true);
    setIsAnimating(false);
    
    const cardWidth = 400;
    const resetPoint = testimonials.length * cardWidth;
    
    // First, move to the new position with animation
    setCurrentTranslateX(prev => prev + cardWidth);
    
    // After the animation completes, check if we need to reset position
    setTimeout(() => {
      setCurrentTranslateX(prev => {
        if (prev > 0) {
          // Temporarily disable transitions for seamless reset
          if (carouselRef.current) {
            carouselRef.current.style.transition = 'none';
          }
          // Reset to the equivalent position at the end
          const newPos = -resetPoint + cardWidth;
          
          // Re-enable transitions after a brief moment
          setTimeout(() => {
            if (carouselRef.current) {
              carouselRef.current.style.transition = 'transform 500ms ease-in-out';
            }
          }, 50);
          
          return newPos;
        }
        return prev;
      });
    }, 500); // Wait for transition to complete
    
    // Resume auto-scroll after 3 seconds
    setTimeout(() => {
      setIsManuallyScrolling(false);
      setIsAnimating(true);
    }, 3000);
  };

  const scrollRight = () => {
    if (!carouselRef.current) return;
    
    setIsManuallyScrolling(true);
    setIsAnimating(false);
    
    const cardWidth = 400;
    const resetPoint = testimonials.length * cardWidth;
    
    // First, move to the new position with animation
    setCurrentTranslateX(prev => prev - cardWidth);
    
    // After the animation completes, check if we need to reset position
    setTimeout(() => {
      setCurrentTranslateX(prev => {
        if (prev <= -resetPoint) {
          // Temporarily disable transitions for seamless reset
          if (carouselRef.current) {
            carouselRef.current.style.transition = 'none';
          }
          
          // Re-enable transitions after a brief moment
          setTimeout(() => {
            if (carouselRef.current) {
              carouselRef.current.style.transition = 'transform 500ms ease-in-out';
            }
          }, 50);
          
          return 0;
        }
        return prev;
      });
    }, 500); // Wait for transition to complete
    
    // Resume auto-scroll after 3 seconds
    setTimeout(() => {
      setIsManuallyScrolling(false);
      setIsAnimating(true);
    }, 3000);
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const cardWidth = 400; // Approximate card width including margin
  const totalWidth = duplicatedTestimonials.length * cardWidth;

  return (
    <div className={`relative ${className}`}>
      {/* Navigation Arrows */}
      <button
        onClick={scrollLeft}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl rounded-full p-3 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2"
        aria-label="Previous testimonial"
      >
        <svg 
          className="w-6 h-6 text-brown group-hover:text-sage-green transition-colors duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={scrollRight}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl rounded-full p-3 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2"
        aria-label="Next testimonial"
      >
        <svg 
          className="w-6 h-6 text-brown group-hover:text-sage-green transition-colors duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Carousel Container */}
      <div 
        className="overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={carouselRef}
          className="flex space-x-6 transition-transform duration-500 ease-in-out"
          style={{
            width: `${totalWidth}px`,
            transform: `translateX(${currentTranslateX}px)`
          }}
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={`${testimonial._id}-${index}`}
              testimonial={testimonial}
              className="flex-shrink-0"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;