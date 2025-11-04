
import { useState, Suspense, lazy } from 'react';
import { ShoppingCart, PerformanceDebugger } from './components';
import { CartProvider, useCart } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';

// Lazy load components for code splitting
const Gallery = lazy(() => import('./components/Gallery'));
const About = lazy(() => import('./components/About'));
const Homepage = lazy(() => import('./components/Homepage'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const AdminApp = lazy(() => import('./components/AdminApp'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

// Main App component that needs to be inside CartProvider to access cart
const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'gallery' | 'about' | 'contact' | 'checkout' | 'admin'>('home');
  const { cart, toggleCart } = useCart();
  
  const handleCheckout = () => {
    setCurrentPage('checkout');
  };
  
  const handleHomePage = () => {
    setCurrentPage('home');
  };

  const handleGalleryPage = () => {
    setCurrentPage('gallery');
  };
  
  const handleBackToGallery = () => {
    setCurrentPage('gallery');
  };

  const handleAboutPage = () => {
    setCurrentPage('about');
  };

  const handleContactPage = () => {
    setCurrentPage('contact');
  };

  const handleAdminAccess = () => {
    setCurrentPage('admin');
  };

  const handleBackFromAdmin = () => {
    setCurrentPage('home');
  };
  
  // Loading fallback component
  const LoadingFallback = () => (
    <div className="min-h-screen bg-off-white flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-green"></div>
        <p className="text-text-light">Loading...</p>
      </div>
    </div>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      {currentPage === 'home' ? (
        <>
          <Homepage 
            onCartClick={toggleCart} 
            onGalleryClick={handleGalleryPage} 
            onAboutClick={handleAboutPage}
            onContactClick={handleContactPage}
          />
          <ShoppingCart onCheckout={handleCheckout} />
        </>
      ) : currentPage === 'gallery' ? (
        <>
          <Gallery 
            onAdminAccess={handleAdminAccess} 
            onAboutClick={handleAboutPage}
            onHomeClick={handleHomePage}
            onContactClick={handleContactPage}
          />
          <ShoppingCart onCheckout={handleCheckout} />
        </>
      ) : currentPage === 'about' ? (
        <>
          <About 
            onCartClick={toggleCart} 
            onGalleryClick={handleGalleryPage}
            onHomeClick={handleHomePage}
            onContactClick={handleContactPage}
          />
          <ShoppingCart onCheckout={handleCheckout} />
        </>
      ) : currentPage === 'contact' ? (
        <>
          <ContactPage
            onHomeClick={handleHomePage}
            onGalleryClick={handleGalleryPage}
            onAboutClick={handleAboutPage}
            onCartClick={toggleCart}
            cartItemCount={cart.totalItems}
          />
          <ShoppingCart onCheckout={handleCheckout} />
        </>
      ) : currentPage === 'checkout' ? (
        <CheckoutPage onBack={handleBackToGallery} />
      ) : (
        <ProtectedRoute>
          <AdminApp />
          <button
            onClick={handleBackFromAdmin}
            className="fixed bottom-4 right-4 bg-sage-green text-white px-4 py-2 rounded-md hover:bg-sage-green-dark"
          >
            Back to Home
          </button>
        </ProtectedRoute>
      )}
      <PerformanceDebugger />
    </Suspense>
  );
};

// Main App wrapper
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App