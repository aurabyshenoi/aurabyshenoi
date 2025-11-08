import React from 'react';
import { Layout } from './index';

interface TermsOfServiceProps {
  onHomeClick?: () => void;
  onGalleryClick?: () => void;
  onAboutClick?: () => void;
  onContactClick?: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ 
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
                Terms of Service
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
              <h2 className="text-2xl font-serif text-brown mb-4">Agreement to Terms</h2>
              <p className="text-text-dark leading-relaxed">
                By accessing and using the AuraByShenoi website, you agree to be bound by these Terms of Service 
                and all applicable laws and regulations. If you do not agree with any of these terms, you are 
                prohibited from using this site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Artwork and Intellectual Property</h2>
              <p className="text-text-dark leading-relaxed mb-4">
                All artwork, images, and content displayed on this website are the intellectual property of 
                AuraByShenoi and are protected by copyright laws.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-dark">
                <li>You may not reproduce, distribute, or use any artwork without explicit written permission</li>
                <li>Images are provided for viewing purposes only</li>
                <li>Unauthorized use of artwork may result in legal action</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Purchases and Commissions</h2>
              <p className="text-text-dark leading-relaxed mb-4">
                When purchasing artwork or commissioning a piece:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-dark">
                <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
                <li>Artwork availability is subject to change without notice</li>
                <li>Commission details, timelines, and pricing will be agreed upon in writing before work begins</li>
                <li>A deposit may be required for commissioned work</li>
                <li>Final sale is subject to our approval and your acceptance of the terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Shipping and Delivery</h2>
              <p className="text-text-dark leading-relaxed">
                Shipping costs and delivery times will be communicated at the time of purchase. We take great care 
                in packaging artwork to ensure safe delivery. However, we are not responsible for damage that occurs 
                during shipping unless proper insurance was purchased.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Returns and Refunds</h2>
              <p className="text-text-dark leading-relaxed mb-4">
                Due to the unique nature of original artwork:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-dark">
                <li>All sales are final unless the artwork arrives damaged</li>
                <li>Commissioned work is non-refundable once work has begun</li>
                <li>If artwork arrives damaged, please contact us within 48 hours with photographic evidence</li>
                <li>We reserve the right to assess damage claims on a case-by-case basis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Website Use</h2>
              <p className="text-text-dark leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-text-dark">
                <li>Use the website for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any part of the website</li>
                <li>Interfere with or disrupt the website's functionality</li>
                <li>Copy, reproduce, or distribute website content without permission</li>
                <li>Use automated systems to access the website without our consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Limitation of Liability</h2>
              <p className="text-text-dark leading-relaxed">
                AuraByShenoi shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages resulting from your use of or inability to use the website or services. Our total liability 
                shall not exceed the amount paid for the specific artwork or service in question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Modifications to Terms</h2>
              <p className="text-text-dark leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective 
                immediately upon posting to the website. Your continued use of the website after changes are posted 
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Governing Law</h2>
              <p className="text-text-dark leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of India. 
                Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts 
                in Bangalore, Karnataka, India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-brown mb-4">Contact Information</h2>
              <p className="text-text-dark leading-relaxed">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-cream rounded-lg">
                <p className="text-text-dark">
                  <strong>Email:</strong> aurabyshenoi@gmail.com<br />
                  <strong>Phone:</strong> +91 9113658874<br />
                  <strong>Location:</strong> Bangalore, Karnataka, India
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
