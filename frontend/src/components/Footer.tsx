import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-off-white border-t border-warm-gray mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.png" 
                alt="AuraByShenoi Logo" 
                className="h-6 w-6 object-contain"
                onError={(e) => {
                  // Hide logo if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <h3 className="text-xl font-serif font-semibold text-brown">
                AuraByShenoi
              </h3>
            </div>
            <p className="text-text-light text-sm leading-relaxed">
              Discover unique paintings that capture the beauty of nature and emotion. 
              Each piece is carefully crafted with passion and attention to detail.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-serif font-medium text-text-dark">
              Contact Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-text-light">
                <Mail className="h-4 w-4 text-sage-green flex-shrink-0" />
                <a 
                  href="mailto:aurabyshenoi@gmail.com"
                  className="hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-off-white rounded-sm"
                >
                  aurabyshenoi@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-text-light">
                <Phone className="h-4 w-4 text-sage-green flex-shrink-0" />
                <a 
                  href="tel:+919113658874"
                  className="hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-off-white rounded-sm"
                >
                  +91 9113658874
                </a>
              </div>
              <div className="flex items-start space-x-3 text-text-light">
                <MapPin className="h-4 w-4 text-sage-green flex-shrink-0 mt-0.5" />
                <address className="not-italic">
                  Bangalore, Karnataka<br />
                  India
                </address>
              </div>
            </div>
          </div>

          {/* Quick Links and Social Media */}
          <div className="space-y-4">
            <h4 className="text-lg font-serif font-medium text-text-dark">
              Connect With Me
            </h4>
            
            {/* Quick Links */}
            <nav className="space-y-2" role="navigation" aria-label="Footer navigation">
              <button 
                onClick={() => window.history.pushState({ page: 'gallery' }, '', '/gallery') || window.dispatchEvent(new PopStateEvent('popstate', { state: { page: 'gallery' } }))}
                className="block text-text-light hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-off-white rounded-sm text-left w-full"
              >
                View Gallery
              </button>
              <button 
                onClick={() => window.history.pushState({ page: 'about' }, '', '/about') || window.dispatchEvent(new PopStateEvent('popstate', { state: { page: 'about' } }))}
                className="block text-text-light hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-off-white rounded-sm text-left w-full"
              >
                About the Artist
              </button>
              <button 
                onClick={() => window.history.pushState({ page: 'contact' }, '', '/contact') || window.dispatchEvent(new PopStateEvent('popstate', { state: { page: 'contact' } }))}
                className="block text-text-light hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-off-white rounded-sm text-left w-full"
              >
                Commission Work
              </button>
            </nav>

            {/* Connect with Me Icons */}
            <div className="flex space-x-4 pt-2">
              <a
                href="tel:+919113658874"
                className="text-text-light hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-off-white rounded-md p-1"
                aria-label="Call us"
              >
                <Phone className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/aurabyshenoi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-light hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-off-white rounded-md p-1"
                aria-label="Follow on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="mailto:aurabyshenoi@gmail.com"
                className="text-text-light hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-off-white rounded-md p-1"
                aria-label="Send us an email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-warm-gray mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-text-light text-sm">
            © {currentYear} AuraByShenoi. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <button 
              onClick={() => window.history.pushState({ page: 'privacy' }, '', '/privacy') || window.dispatchEvent(new PopStateEvent('popstate', { state: { page: 'privacy' } }))}
              className="text-text-light hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-off-white rounded-sm"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => window.history.pushState({ page: 'terms' }, '', '/terms') || window.dispatchEvent(new PopStateEvent('popstate', { state: { page: 'terms' } }))}
              className="text-text-light hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-off-white rounded-sm"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;