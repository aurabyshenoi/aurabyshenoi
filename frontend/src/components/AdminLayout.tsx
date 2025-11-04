import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  currentSection?: 'dashboard' | 'paintings' | 'orders' | 'testimonials' | 'contacts';
  onNavigate?: (section: 'dashboard' | 'paintings' | 'orders' | 'testimonials' | 'contacts') => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title = 'Admin Dashboard',
  currentSection = 'dashboard',
  onNavigate
}) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-green"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => onNavigate?.('dashboard')}
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                currentSection === 'dashboard'
                  ? 'border-sage-green text-sage-green-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate?.('paintings')}
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                currentSection === 'paintings'
                  ? 'border-sage-green text-sage-green-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Paintings
            </button>
            <button
              onClick={() => onNavigate?.('orders')}
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                currentSection === 'orders'
                  ? 'border-sage-green text-sage-green-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => onNavigate?.('testimonials')}
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                currentSection === 'testimonials'
                  ? 'border-sage-green text-sage-green-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Testimonials
            </button>
            <button
              onClick={() => onNavigate?.('contacts')}
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                currentSection === 'contacts'
                  ? 'border-sage-green text-sage-green-dark'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contacts
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};