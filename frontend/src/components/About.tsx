import React from 'react';
import { Layout, TestimonialSection } from './index';
import { useCart } from '../contexts/CartContext';

interface AboutProps {
  onCartClick?: () => void;
  onGalleryClick?: () => void;
  onHomeClick?: () => void;
  onContactClick?: () => void;
}

const About: React.FC<AboutProps> = ({ onCartClick, onGalleryClick, onHomeClick, onContactClick }) => {
  const { cart } = useCart();

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    }
  };

  return (
    <Layout 
      cartItemCount={cart.totalItems} 
      onCartClick={handleCartClick}
      onHomeClick={onHomeClick}
      onGalleryClick={onGalleryClick}
      onAboutClick={() => {}}
      onContactClick={onContactClick}
    >
      <div className="min-h-screen bg-off-white">
        {/* Hero Section */}
        <div className="bg-cream border-b border-warm-gray">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-serif text-brown mb-6">
                About the Artist
              </h1>
              <p className="text-text-light text-lg max-w-3xl mx-auto">
                Discover the passion, inspiration, and artistic journey behind each unique creation
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Artist Photo and Biography Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
            {/* Artist Photo */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-96 bg-warm-gray rounded-lg shadow-lg overflow-hidden">
                  <img 
                    src="/artist-photo.jpeg" 
                    alt="Artist portrait in traditional attire with vibrant orange decorations and lush greenery in the background"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                  {/* Fallback placeholder (hidden by default) */}
                  <div className="w-full h-full bg-gradient-to-br from-sage-green-light to-sage-green flex items-center justify-center" style={{ display: 'none' }}>
                    <div className="text-center text-white">
                      <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      <p className="text-sm opacity-80">Artist Photo</p>
                    </div>
                  </div>
                </div>
                {/* Decorative frame */}
                <div className="absolute -inset-2 bg-brown/10 rounded-lg -z-10"></div>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-serif text-brown mb-4">
                  Meet the Artist
                </h2>
                <div className="space-y-4 text-text-dark leading-relaxed">
                  <p>
                    Welcome to my artistic world. I am a passionate painter who finds joy in creating 
                    beautiful artwork that captures the essence of life and nature.
                  </p>
                  <p>
                    As a physiotherapist by profession, I understand the healing power of art and creativity. 
                    My paintings reflect my love for vibrant colors and meaningful expressions.
                  </p>
                  <p>
                    When I'm not painting, you'll find me exploring my other passions - playing music, 
                    cooking delicious meals, and finding inspiration in everyday moments.
                  </p>
                </div>

                {/* Interests Section */}
                <div className="mt-8">
                  <h3 className="text-xl font-serif text-brown mb-4">My Interests</h3>
                  <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                    {/* Guitar */}
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-warm-gray hover:shadow-md transition-shadow">
                      <svg className="w-8 h-8 text-brown mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <span className="text-sm text-text-dark font-medium">Guitar</span>
                    </div>

                    {/* Keyboard */}
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-warm-gray hover:shadow-md transition-shadow">
                      <svg className="w-8 h-8 text-brown mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM4 17V7h16v10H4z"/>
                        <rect x="5" y="9" width="1.5" height="6" fill="white"/>
                        <rect x="7" y="9" width="1" height="4" fill="white"/>
                        <rect x="8.5" y="9" width="1.5" height="6" fill="white"/>
                        <rect x="10.5" y="9" width="1" height="4" fill="white"/>
                        <rect x="12" y="9" width="1.5" height="6" fill="white"/>
                        <rect x="14" y="9" width="1" height="4" fill="white"/>
                        <rect x="15.5" y="9" width="1.5" height="6" fill="white"/>
                        <rect x="17.5" y="9" width="1" height="4" fill="white"/>
                        <rect x="19" y="9" width="1.5" height="6" fill="white"/>
                      </svg>
                      <span className="text-sm text-text-dark font-medium">Keyboard</span>
                    </div>

                    {/* Physiotherapist */}
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-warm-gray hover:shadow-md transition-shadow">
                      <svg className="w-8 h-8 text-brown mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="text-sm text-text-dark font-medium">Physiotherapy</span>
                    </div>

                    {/* Painting */}
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-warm-gray hover:shadow-md transition-shadow">
                      <svg className="w-8 h-8 text-brown mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3v18M15 8l4-4 2 2-4 4-2-2zM15 8l2 2" />
                      </svg>
                      <span className="text-sm text-text-dark font-medium">Painting</span>
                    </div>

                    {/* Cooking */}
                    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-warm-gray hover:shadow-md transition-shadow">
                      <svg className="w-8 h-8 text-brown mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a4 4 0 100 8m0-8a4 4 0 110 8m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v4m6-6v-4m6 2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v4m-6-6v-4" />
                      </svg>
                      <span className="text-sm text-text-dark font-medium">Cooking</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Testimonials Section */}
          <div className="mb-16">
            <TestimonialSection />
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-sage-green-light/20 rounded-lg p-8 md:p-12">
              <h2 className="text-3xl font-serif text-brown mb-4">
                Explore My Work
              </h2>
              <p className="text-text-light mb-6 max-w-2xl mx-auto">
                I invite you to browse my gallery and discover the paintings that speak to you. 
                Each piece is available for purchase and comes with a certificate of authenticity.
              </p>
              <button 
                onClick={onGalleryClick}
                className="bg-sage-green text-white px-8 py-3 rounded-md font-medium hover:bg-sage-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2"
              >
                View Gallery
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;