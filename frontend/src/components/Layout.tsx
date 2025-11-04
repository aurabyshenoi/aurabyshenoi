import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  cartItemCount?: number;
  onCartClick?: () => void;
  onHomeClick?: () => void;
  onGalleryClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  cartItemCount = 0, 
  onCartClick,
  onHomeClick,
  onGalleryClick,
  onAboutClick,
  onContactClick,
  className = '' 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-sage-green text-cream px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-sage-green-dark"
      >
        Skip to main content
      </a>

      {/* Header */}
      <Header 
        cartItemCount={cartItemCount} 
        onCartClick={onCartClick}
        onHomeClick={onHomeClick}
        onGalleryClick={onGalleryClick}
        onAboutClick={onAboutClick}
        onContactClick={onContactClick}
      />

      {/* Main Content */}
      <main 
        id="main-content"
        className={`flex-1 ${className}`}
        role="main"
      >
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;