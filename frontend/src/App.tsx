
import { useState, useEffect, Suspense, lazy } from 'react';
import { PerformanceDebugger } from './components';
import { AuthProvider } from './contexts/AuthContext';
import { getPageFromPath, getPathFromPage, type PageType } from './utils/navigationHelpers';

// Lazy load components for code splitting
const Gallery = lazy(() => import('./components/Gallery'));
const About = lazy(() => import('./components/About'));
const Homepage = lazy(() => import('./components/Homepage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const AdminApp = lazy(() => import('./components/AdminApp').then(module => ({ default: module.AdminApp })));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute').then(module => ({ default: module.ProtectedRoute })));

// Main App component
const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [artworkInquiry, setArtworkInquiry] = useState<any>(null);
  
  // Initialize page state from URL on mount
  useEffect(() => {
    const path = window.location.pathname;
    const page = getPageFromPath(path);
    setCurrentPage(page);
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const page = event.state?.page || getPageFromPath(window.location.pathname);
      setCurrentPage(page);
      
      // Clear artwork inquiry when navigating away from contact page
      if (page !== 'contact') {
        setArtworkInquiry(null);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check if History API is supported
  const isBrowserHistorySupported = typeof window !== 'undefined' && 'pushState' in window.history;

  // Navigation function that updates both state and URL
  const navigateToPage = (page: PageType) => {
    setCurrentPage(page);
    
    // Use History API if supported, otherwise fallback to state-only navigation
    if (isBrowserHistorySupported) {
      const path = getPathFromPage(page);
      window.history.pushState({ page }, '', path);
    } else {
      // Fallback: Log warning for unsupported browsers
      console.warn('Browser history API not supported. Navigation will work but browser back/forward buttons may not function correctly.');
    }
  };
  
  const handleHomePage = () => {
    navigateToPage('home');
  };

  const handleGalleryPage = () => {
    navigateToPage('gallery');
  };

  const handleAboutPage = () => {
    navigateToPage('about');
  };

  const handleContactPage = () => {
    setArtworkInquiry(null); // Clear artwork inquiry for general contact
    navigateToPage('contact');
  };

  const handleArtworkInquiry = (painting: any) => {
    setArtworkInquiry(painting);
    navigateToPage('contact');
  };

  const handleAdminAccess = () => {
    navigateToPage('admin');
  };

  const handleBackFromAdmin = () => {
    navigateToPage('home');
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
        <Homepage 
          onGalleryClick={handleGalleryPage} 
          onAboutClick={handleAboutPage}
          onContactClick={handleContactPage}
        />
      ) : currentPage === 'gallery' ? (
        <Gallery 
          onAdminAccess={handleAdminAccess} 
          onAboutClick={handleAboutPage}
          onHomeClick={handleHomePage}
          onContactClick={handleContactPage}
          onArtworkInquiry={handleArtworkInquiry}
        />
      ) : currentPage === 'about' ? (
        <About 
          onGalleryClick={handleGalleryPage}
          onHomeClick={handleHomePage}
          onContactClick={handleContactPage}
        />
      ) : currentPage === 'contact' ? (
        <ContactPage
          onHomeClick={handleHomePage}
          onGalleryClick={handleGalleryPage}
          onAboutClick={handleAboutPage}
          artworkReference={artworkInquiry}
        />
      ) : currentPage === 'privacy' ? (
        <PrivacyPolicy
          onHomeClick={handleHomePage}
          onGalleryClick={handleGalleryPage}
          onAboutClick={handleAboutPage}
          onContactClick={handleContactPage}
        />
      ) : currentPage === 'terms' ? (
        <TermsOfService
          onHomeClick={handleHomePage}
          onGalleryClick={handleGalleryPage}
          onAboutClick={handleAboutPage}
          onContactClick={handleContactPage}
        />
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
      <AppContent />
    </AuthProvider>
  );
}

export default App