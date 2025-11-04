import React from 'react';
import { CheckCircle, ArrowLeft, Mail, Phone, Clock } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface ContactSuccessProps {
  onHomeClick: () => void;
  onGalleryClick: () => void;
  onAboutClick: () => void;
  onContactClick: () => void;
  onCartClick: () => void;
  cartItemCount?: number;
}

const ContactSuccess: React.FC<ContactSuccessProps> = ({
  onHomeClick,
  onGalleryClick,
  onAboutClick,
  onContactClick,
  onCartClick,
  cartItemCount = 0
}) => {
  return (
    <div className="min-h-screen bg-off-white flex flex-col">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={onCartClick}
        onHomeClick={onHomeClick}
        onGalleryClick={onGalleryClick}
        onAboutClick={onAboutClick}
        onContactClick={onContactClick}
      />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Back Navigation */}
          <div className="mb-8">
            <button
              onClick={onContactClick}
              className="flex items-center space-x-2 text-text-light hover:text-brown transition-colors duration-200 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Contact</span>
            </button>
          </div>

          {/* Success Message Card */}
          <div className="bg-cream rounded-lg p-8 shadow-sm text-center mb-8">
            <CheckCircle className="h-16 w-16 text-sage-green mx-auto mb-6" />
            <h1 className="text-3xl font-serif text-brown mb-4">Thank You!</h1>
            <p className="text-lg text-text-dark mb-6">
              Your message has been received successfully. We will reach out to you within 24-48 hours.
            </p>
            
            {/* What Happens Next Section */}
            <div className="bg-sage-green bg-opacity-10 rounded-lg p-6 border border-sage-green border-opacity-20 mb-6">
              <h2 className="text-xl font-serif text-brown mb-4 flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>What happens next?</span>
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="text-center md:text-left">
                  <div className="bg-sage-green text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto md:mx-0 mb-2 text-sm font-bold">
                    1
                  </div>
                  <h3 className="font-semibold text-text-dark mb-1">Review</h3>
                  <p className="text-sm text-text-light">We'll review your message within 24 hours</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="bg-sage-green text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto md:mx-0 mb-2 text-sm font-bold">
                    2
                  </div>
                  <h3 className="font-semibold text-text-dark mb-1">Response</h3>
                  <p className="text-sm text-text-light">You'll receive a personal response within 24-48 hours</p>
                </div>
                <div className="text-center md:text-left">
                  <div className="bg-sage-green text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto md:mx-0 mb-2 text-sm font-bold">
                    3
                  </div>
                  <h3 className="font-semibold text-text-dark mb-1">Follow-up</h3>
                  <p className="text-sm text-text-light">For urgent inquiries, feel free to email directly</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onHomeClick}
                className="bg-brown text-cream px-6 py-3 rounded-md font-medium hover:bg-brown-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 focus:ring-offset-cream"
              >
                Back to Home
              </button>
              <button
                onClick={onGalleryClick}
                className="bg-sage-green text-white px-6 py-3 rounded-md font-medium hover:bg-sage-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream"
              >
                View Gallery
              </button>
            </div>
          </div>

          {/* Direct Contact Information */}
          <div className="bg-cream rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-serif text-brown mb-4 text-center">Need Immediate Assistance?</h2>
            <p className="text-text-dark text-center mb-6">
              For urgent inquiries or if you prefer direct contact, you can reach us using the information below.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email Contact */}
              <div className="text-center">
                <div className="bg-sage-green bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-sage-green" />
                </div>
                <h3 className="font-semibold text-text-dark mb-2">Email Us Directly</h3>
                <p className="text-text-light mb-3">
                  Send us an email for detailed inquiries or artwork questions
                </p>
                <a 
                  href="mailto:aurabyshenoi@gmail.com"
                  className="inline-flex items-center space-x-2 text-brown hover:text-brown-dark transition-colors duration-200 font-medium"
                >
                  <Mail className="h-4 w-4" />
                  <span>aurabyshenoi@gmail.com</span>
                </a>
              </div>

              {/* Response Time */}
              <div className="text-center">
                <div className="bg-brown bg-opacity-10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-brown" />
                </div>
                <h3 className="font-semibold text-text-dark mb-2">Response Time</h3>
                <p className="text-text-light mb-3">
                  We typically respond to all inquiries within 24-48 hours
                </p>
                <div className="text-brown font-medium">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>24-48 Hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6 pt-6 border-t border-warm-gray">
              <div className="text-center">
                <h3 className="font-semibold text-text-dark mb-3">What to Include in Your Follow-up</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-sage-green bg-opacity-5 rounded-lg p-3">
                    <p className="text-text-dark font-medium mb-1">Artwork Inquiries</p>
                    <p className="text-text-light">Questions about specific paintings or commissions</p>
                  </div>
                  <div className="bg-sage-green bg-opacity-5 rounded-lg p-3">
                    <p className="text-text-dark font-medium mb-1">Purchase Details</p>
                    <p className="text-text-light">Pricing, availability, and shipping information</p>
                  </div>
                  <div className="bg-sage-green bg-opacity-5 rounded-lg p-3">
                    <p className="text-text-dark font-medium mb-1">Custom Work</p>
                    <p className="text-text-light">Commission requests and custom artwork</p>
                  </div>
                  <div className="bg-sage-green bg-opacity-5 rounded-lg p-3">
                    <p className="text-text-dark font-medium mb-1">General Questions</p>
                    <p className="text-text-light">Artist information and collaboration opportunities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactSuccess;