import React, { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onHomeClick?: () => void;
  onGalleryClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  cartItemCount = 0, 
  onCartClick,
  onHomeClick,
  onGalleryClick,
  onAboutClick,
  onContactClick
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationLinks = [
    { href: '/', label: 'Home', onClick: onHomeClick },
    { href: '/gallery', label: 'Gallery', onClick: onGalleryClick },
    { href: '/about', label: 'About', onClick: onAboutClick },
    { href: '/contact', label: 'Contact', onClick: onContactClick },
  ];

  return (
    <header className="bg-cream border-b border-warm-gray sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={onHomeClick}
              className="flex items-center space-x-3 text-2xl md:text-3xl font-serif font-semibold text-brown hover:text-brown-dark transition-colors duration-200"
              aria-label="AuraByShenoi Home"
            >
              <img 
                src="/logo.png" 
                alt="AuraByShenoi Logo" 
                className="h-8 w-8 md:h-10 md:w-10 object-contain"
                onError={(e) => {
                  // Hide logo if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span>AuraByShenoi</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation">
            {navigationLinks.map((link) => (
              link.onClick ? (
                <button
                  key={link.href}
                  onClick={link.onClick}
                  className="text-text-dark hover:text-sage-green font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream rounded-sm px-2 py-1"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-text-dark hover:text-sage-green font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream rounded-sm px-2 py-1"
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          {/* Cart and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-text-dark hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream rounded-md"
              aria-label={`Shopping cart with ${cartItemCount} items`}
            >
              <ShoppingBag className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brown text-cream text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-text-dark hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream rounded-md"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-warm-gray">
            <nav className="py-4 space-y-2" role="navigation">
              {navigationLinks.map((link) => (
                link.onClick ? (
                  <button
                    key={link.href}
                    onClick={() => {
                      link.onClick!();
                      closeMobileMenu();
                    }}
                    className="block w-full text-left px-4 py-2 text-text-dark hover:text-sage-green hover:bg-off-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream rounded-md mx-2"
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="block px-4 py-2 text-text-dark hover:text-sage-green hover:bg-off-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream rounded-md mx-2"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;