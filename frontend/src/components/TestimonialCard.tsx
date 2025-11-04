import React from 'react';
import { Testimonial } from '../types/testimonial';
import { OptimizedImage, useResponsiveImageUrls } from './OptimizedImage';

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, className = '' }) => {
  const imageUrls = useResponsiveImageUrls(testimonial.customerPhoto);

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 md:p-8 flex-shrink-0 w-80 md:w-96 ${className}`}>
      {/* Customer Photo - Centered */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-warm-gray">
          <OptimizedImage
            src={imageUrls.medium}
            lowQualitySrc={imageUrls.thumbnail}
            alt={`${testimonial.customerName} photo`}
            className="w-full h-full object-cover"
            placeholderClassName="w-full h-full"
            loading="lazy"
            sizes="(max-width: 768px) 64px, 80px"
          />
        </div>
      </div>

      {/* Testimonial Text - Large Quote Styling */}
      <div className="text-center">
        <div className="relative mb-4">
          {/* Opening Quote */}
          <div className="absolute -top-2 -left-2 text-4xl text-sage-green-light font-serif leading-none">
            "
          </div>
          
          {/* Testimonial Text */}
          <p className="text-text-dark text-lg md:text-xl leading-relaxed font-light italic px-4">
            {testimonial.testimonialText}
          </p>
          
          {/* Closing Quote */}
          <div className="absolute -bottom-4 -right-2 text-4xl text-sage-green-light font-serif leading-none">
            "
          </div>
        </div>

        {/* Customer Name */}
        <div className="mt-6 pt-4 border-t border-warm-gray">
          <p className="font-semibold text-brown text-lg">
            {testimonial.customerName}
          </p>
          
          {/* Rating Stars (if provided) */}
          {testimonial.rating && (
            <div className="flex justify-center mt-2">
              {[...Array(5)].map((_, index) => (
                <svg
                  key={index}
                  className={`w-4 h-4 ${
                    index < testimonial.rating! 
                      ? 'text-sage-green' 
                      : 'text-warm-gray'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;