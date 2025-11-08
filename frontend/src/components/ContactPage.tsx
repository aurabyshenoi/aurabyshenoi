import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import ContactFormSubmit from './ContactFormSubmit';
import ContactSuccess from './ContactSuccess';
import { Painting } from '../types/painting';

interface ContactPageProps {
  onHomeClick: () => void;
  onGalleryClick: () => void;
  onAboutClick: () => void;
  artworkReference?: Painting;
}

// Removed ContactFormData and FormErrors interfaces as they're now handled by ContactFormSubmit

const ContactPage: React.FC<ContactPageProps> = ({
  onHomeClick,
  onGalleryClick,
  onAboutClick,
  artworkReference
}) => {
  const [showSuccessPage, setShowSuccessPage] = useState(false);

  // Handle successful form submission by showing success page
  const handleFormSubmitSuccess = () => {
    setShowSuccessPage(true);
  };

  // Handle form submission errors (optional - ContactFormSubmit handles its own errors)
  const handleFormSubmitError = (error: string) => {
    console.error('Contact form submission error:', error);
  };

  // Handle returning from success page to contact form
  const handleBackToContact = () => {
    setShowSuccessPage(false);
  };

  // Show success page if form was submitted successfully
  if (showSuccessPage) {
    return (
      <ContactSuccess
        onHomeClick={onHomeClick}
        onGalleryClick={onGalleryClick}
        onAboutClick={onAboutClick}
        onContactClick={handleBackToContact}
      />
    );
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <Header
        onHomeClick={onHomeClick}
        onGalleryClick={onGalleryClick}
        onAboutClick={onAboutClick}
        onContactClick={() => {}}
      />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onHomeClick}
              className="flex items-center space-x-2 text-text-light hover:text-brown transition-colors duration-200 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
            
            <h1 className="text-4xl font-serif text-brown mb-4">
              {artworkReference ? `Inquire About "${artworkReference.title}"` : 'Contact Us: Drop in your query and we will reach out to you'}
            </h1>
            <p className="text-lg text-text-light">
              {artworkReference 
                ? `Interested in this artwork? Send us a message and we'll get back to you with more details.`
                : 'Have a question about our artwork or want to make a general inquiry? We\'d love to hear from you.'
              }
            </p>
            
            {artworkReference && (
              <div className="bg-sage-green bg-opacity-10 rounded-lg p-4 border border-sage-green border-opacity-20 mt-4">
                <div className="flex items-start space-x-4">
                  <img 
                    src={artworkReference.images.thumbnail} 
                    alt={artworkReference.title}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-serif text-lg text-brown">{artworkReference.title}</h3>
                    <p className="text-text-light text-sm">{artworkReference.medium}</p>
                    <p className="text-text-light text-xs">
                      {artworkReference.dimensions.width}" × {artworkReference.dimensions.height}" {artworkReference.dimensions.unit}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form - Now using FormSubmit integration */}
            <ContactFormSubmit
              onSubmitSuccess={handleFormSubmitSuccess}
              onSubmitError={handleFormSubmitError}
              artworkReference={artworkReference}
            />

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="bg-cream rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-serif text-brown mb-4">Contact Information</h2>
                <p className="text-text-dark mb-6">
                  We're here to help with any questions about our artwork, commissions, or general inquiries. 
                  Fill out the form and we'll get back to you as soon as possible.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-text-dark mb-2">Response Time</h3>
                    <p className="text-text-light">We typically respond within 24-48 hours</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-text-dark mb-2">Direct Contact</h3>
                    <p className="text-text-light mb-2">For urgent inquiries, you can also email us directly:</p>
                    <a 
                      href="mailto:aurabyshenoi@gmail.com"
                      className="text-brown hover:text-brown-dark transition-colors duration-200 font-medium"
                    >
                      aurabyshenoi@gmail.com
                    </a>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-text-dark mb-2">What to Include</h3>
                    <ul className="text-text-light space-y-1">
                      <li>• Specific questions about artwork</li>
                      <li>• Commission inquiries</li>
                      <li>• General information requests</li>
                      <li>• Collaboration opportunities</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-sage-green bg-opacity-10 rounded-lg p-6 border border-sage-green border-opacity-20">
                <h3 className="text-xl font-serif text-brown mb-3">Looking for Something Specific?</h3>
                <p className="text-text-dark mb-4">
                  If you're interested in a particular painting, you can also express interest directly from our gallery.
                </p>
                <button
                  onClick={onGalleryClick}
                  className="bg-sage-green text-white px-6 py-2 rounded-md font-medium hover:bg-sage-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream"
                >
                  Browse Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;