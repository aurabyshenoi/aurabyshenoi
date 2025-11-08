import React from 'react';
import { Layout } from './index';

interface PrivacyPolicyProps {
  onHomeClick?: () => void;
  onGalleryClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ 
  onHomeClick, 
  onGalleryClick, 
  onAboutClick, 
  onContactClick 
}) => {
  return (
    <Layout 
      onHomeClick={onHomeClick}
      onGalleryClick={onGalleryClick}
      onAboutClick={onAboutClick}
      onContactClick={onContactClick}
    >
      <div className="min-h-screen bg-off-white">
        {/* Header */}
        <div className="bg-cream border-b border-warm-gray">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-serif text-brown mb-6">
                Privacy Policy
              </h1>
              <p className="text-text-light text-lg">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Introduction</h2>
              <p className="text-text-dark leading-relaxed">
                At AuraByShenoi, we respect your privacy and are committed to protecting your personal information. 
                This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website 
                or interact with our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Information We Collect</h2>
              <p className="text-text-dark leading-relaxed mb-4">
                We may collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-dark">
                <li>Contact information (name, email address, phone number) when you submit inquiries or subscribe to our newsletter</li>
                <li>Information about your artwork preferences and inquiries</li>
                <li>Technical data such as IP address, browser type, and device information</li>
                <li>Usage data about how you interact with our website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">How We Use Your Information</h2>
              <p className="text-text-dark leading-relaxed mb-4">
                We use your information to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-dark">
                <li>Respond to your inquiries about artwork and commissions</li>
                <li>Send you newsletters and updates about new artwork (if you've subscribed)</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Data Security</h2>
              <p className="text-text-dark leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Your Rights</h2>
              <p className="text-text-dark leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-dark">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Unsubscribe from our newsletter at any time</li>
                <li>Object to processing of your personal information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Cookies</h2>
              <p className="text-text-dark leading-relaxed">
                Our website may use cookies to enhance your browsing experience. You can control cookie settings 
                through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Third-Party Services</h2>
              <p className="text-text-dark leading-relaxed">
                We do not sell or share your personal information with third parties for their marketing purposes. 
                We may use trusted third-party services to help operate our website and conduct our business.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Contact Us</h2>
              <p className="text-text-dark leading-relaxed">
                If you have any questions about this Privacy Policy or how we handle your data, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-cream rounded-lg">
                <p className="text-text-dark">
                  <strong>Email:</strong> aurabyshenoi@gmail.com<br />
                  <strong>Phone:</strong> +91 9113658874
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Changes to This Policy</h2>
              <p className="text-text-dark leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
