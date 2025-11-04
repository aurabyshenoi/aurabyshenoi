import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from './AdminLayout';
import { TestimonialForm } from './TestimonialForm';
import { Testimonial } from '../types/testimonial';

interface TestimonialManagerProps {
  currentSection?: 'dashboard' | 'paintings' | 'orders' | 'testimonials' | 'contacts';
  onNavigate?: (section: 'dashboard' | 'paintings' | 'orders' | 'testimonials' | 'contacts') => void;
}

export const TestimonialManager: React.FC<TestimonialManagerProps> = ({ 
  currentSection = 'testimonials', 
  onNavigate 
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();

  useEffect(() => {
    fetchTestimonials();
  }, [currentPage, token]);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/testimonials?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }

      const data = await response.json();
      setTestimonials(data.data.testimonials);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTestimonial = () => {
    setEditingTestimonial(null);
    setShowForm(true);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setShowForm(true);
  };

  const handleDeleteTestimonial = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete testimonial');
      }

      await fetchTestimonials();
    } catch (err: any) {
      setError(err.message || 'Failed to delete testimonial');
    }
  };

  const handleToggleActive = async (testimonialId: string) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialId}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle testimonial status');
      }

      await fetchTestimonials();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle testimonial status');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTestimonial(null);
    fetchTestimonials();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTestimonial(null);
  };

  if (showForm) {
    return (
      <TestimonialForm
        testimonial={editingTestimonial}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <AdminLayout 
      title="Testimonial Management" 
      currentSection={currentSection} 
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Customer Testimonials</h2>
          <button
            onClick={handleAddTestimonial}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sage-green hover:bg-sage-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-green"
          >
            Add New Testimonial
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Testimonials Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-green mx-auto"></div>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No testimonials found. Add your first testimonial to get started.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {testimonials.map((testimonial) => (
                <li key={testimonial._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        <img
                          className="h-16 w-16 rounded-full object-cover"
                          src={testimonial.customerPhoto}
                          alt={testimonial.customerName}
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {testimonial.customerName}
                        </div>
                        <div className="text-sm text-gray-500 max-w-md truncate">
                          "{testimonial.testimonialText}"
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Display Order: {testimonial.displayOrder}
                          {testimonial.rating && (
                            <span className="ml-2">
                              Rating: {testimonial.rating}/5 ⭐
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        testimonial.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {testimonial.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleActive(testimonial._id)}
                          className={`text-sm font-medium ${
                            testimonial.isActive 
                              ? 'text-gray-600 hover:text-gray-900' 
                              : 'text-sage-green hover:text-sage-green-dark'
                          }`}
                        >
                          {testimonial.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEditTestimonial(testimonial)}
                          className="text-sage-green hover:text-sage-green-dark text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(testimonial._id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};