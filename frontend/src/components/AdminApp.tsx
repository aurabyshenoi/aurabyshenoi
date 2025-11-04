import React, { useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { PaintingManager } from './PaintingManager';
import { OrderManager } from './OrderManager';
import { TestimonialManager } from './TestimonialManager';
import { ContactManager } from './ContactManager';

type AdminSection = 'dashboard' | 'paintings' | 'orders' | 'testimonials' | 'contacts';

export const AdminApp: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');

  const handleNavigate = (section: AdminSection) => {
    setCurrentSection(section);
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <AdminDashboard currentSection={currentSection} onNavigate={handleNavigate} />;
      case 'paintings':
        return <PaintingManager currentSection={currentSection} onNavigate={handleNavigate} />;
      case 'orders':
        return <OrderManager currentSection={currentSection} onNavigate={handleNavigate} />;
      case 'testimonials':
        return <TestimonialManager currentSection={currentSection} onNavigate={handleNavigate} />;
      case 'contacts':
        return <ContactManager currentSection={currentSection} onNavigate={handleNavigate} />;
      default:
        return <AdminDashboard currentSection={currentSection} onNavigate={handleNavigate} />;
    }
  };

  return renderCurrentSection();
};