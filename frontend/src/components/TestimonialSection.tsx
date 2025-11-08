import React, { useEffect, useState } from 'react';
import { Testimonial } from '../types/testimonial';
import TestimonialCarousel from './TestimonialCarousel';

interface TestimonialSectionProps {
  className?: string;
}

const TestimonialSection: React.FC<TestimonialSectionProps> = ({ className = '' }) => {
  // Dummy testimonials data for design preview
  const dummyTestimonials: Testimonial[] = [
    {
      _id: '1',
      customerName: 'Sarah Johnson',
      customerPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
      testimonialText: 'The artwork I received exceeded all my expectations. The colors are so vibrant and the detail is incredible. It has become the centerpiece of my living room.',
      rating: 5,
      isActive: true,
      displayOrder: 1,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      _id: '2',
      customerName: 'Michael Chen',
      customerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      testimonialText: 'Working with this artist was a wonderful experience. The piece arrived perfectly packaged and the quality is museum-worthy. Highly recommended!',
      rating: 5,
      isActive: true,
      displayOrder: 2,
      createdAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    },
    {
      _id: '3',
      customerName: 'Emily Rodriguez',
      customerPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
      testimonialText: 'I have been collecting art for years, and this piece is truly special. The way light plays across the canvas is mesmerizing. A beautiful addition to my collection.',
      rating: 5,
      isActive: true,
      displayOrder: 3,
      createdAt: '2024-02-01T09:15:00Z',
      updatedAt: '2024-02-01T09:15:00Z'
    },
    {
      _id: '4',
      customerName: 'David Thompson',
      customerPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
      testimonialText: 'The attention to detail in this artwork is remarkable. Every brushstroke tells a story. It brings such peace and beauty to our home.',
      rating: 5,
      isActive: true,
      displayOrder: 4,
      createdAt: '2024-02-10T16:45:00Z',
      updatedAt: '2024-02-10T16:45:00Z'
    },
    {
      _id: '5',
      customerName: 'Lisa Park',
      customerPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
      testimonialText: 'From the moment I saw this artwork online, I knew I had to have it. The colors perfectly complement my decor and it never fails to spark conversation.',
      rating: 5,
      isActive: true,
      displayOrder: 5,
      createdAt: '2024-02-15T11:20:00Z',
      updatedAt: '2024-02-15T11:20:00Z'
    }
  ];

  const [testimonials, setTestimonials] = useState<Testimonial[]>(dummyTestimonials);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Commented out API call for now - will use dummy data
  // useEffect(() => {
  //   const fetchTestimonials = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await fetch('/api/testimonials');
        
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch testimonials');
  //       }
        
  //       const data = await response.json();
        
  //       if (data.success && data.data.testimonials) {
  //         setTestimonials(data.data.testimonials);
  //       } else {
  //         throw new Error('Invalid testimonials data');
  //       }
  //     } catch (err) {
  //       console.error('Error fetching testimonials:', err);
  //       setError(err instanceof Error ? err.message : 'Failed to load testimonials');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchTestimonials();
  // }, []);

  if (loading) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-brown mb-8 text-center">
            What Our Customers Say
          </h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-green"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !testimonials || testimonials.length === 0) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-brown mb-8 text-center">
            What Our Customers Say
          </h2>
          <div className="text-center text-text-light">
            {error ? (
              <p>Unable to load testimonials at this time.</p>
            ) : (
              <p>No testimonials available yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-12 bg-off-white ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-brown mb-4">
            What Our Customers Say
          </h2>
          <p className="text-text-light text-lg max-w-2xl mx-auto">
            Hear from art lovers who have found their perfect piece and experienced 
            the joy of bringing beautiful artwork into their homes.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Gradient overlays for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-off-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-off-white to-transparent z-10 pointer-events-none"></div>
          
          <TestimonialCarousel 
            testimonials={testimonials}
            animationSpeed={25} // Slow scrolling speed
            className="py-4"
          />
        </div>

        {/* Optional: Testimonial count indicator */}
        {testimonials.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-sm text-text-light">
              Featuring {testimonials.length} happy customer{testimonials.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialSection;