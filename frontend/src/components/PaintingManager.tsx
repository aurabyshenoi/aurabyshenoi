import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from './AdminLayout';
import { PaintingForm } from './PaintingForm';
import { Painting } from '../types/painting';

interface PaintingManagerProps {
  currentSection?: 'dashboard' | 'paintings' | 'orders' | 'testimonials' | 'contacts';
  onNavigate?: (section: 'dashboard' | 'paintings' | 'orders' | 'testimonials' | 'contacts') => void;
}

export const PaintingManager: React.FC<PaintingManagerProps> = ({ 
  currentSection = 'paintings', 
  onNavigate 
}) => {
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPainting, setEditingPainting] = useState<Painting | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();

  useEffect(() => {
    fetchPaintings();
  }, [currentPage, token]);

  const fetchPaintings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/paintings?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch paintings');
      }

      const data = await response.json();
      setPaintings(data.data.paintings);
      setTotalPages(data.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load paintings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPainting = () => {
    setEditingPainting(null);
    setShowForm(true);
  };

  const handleEditPainting = (painting: Painting) => {
    setEditingPainting(painting);
    setShowForm(true);
  };

  const handleDeletePainting = async (paintingId: string) => {
    if (!confirm('Are you sure you want to delete this painting?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/paintings/${paintingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete painting');
      }

      await fetchPaintings();
    } catch (err: any) {
      setError(err.message || 'Failed to delete painting');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPainting(null);
    fetchPaintings();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPainting(null);
  };

  if (showForm) {
    return (
      <PaintingForm
        painting={editingPainting}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <AdminLayout 
      title="Painting Management" 
      currentSection={currentSection} 
      onNavigate={onNavigate}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Paintings</h2>
          <button
            onClick={handleAddPainting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sage-green hover:bg-sage-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-green"
          >
            Add New Painting
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Paintings Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-green mx-auto"></div>
            </div>
          ) : paintings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No paintings found. Add your first painting to get started.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {paintings.map((painting) => (
                <li key={painting._id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16">
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={painting.images.thumbnail}
                          alt={painting.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {painting.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {painting.medium} • {painting.dimensions.width}" × {painting.dimensions.height}"
                        </div>
                        <div className="text-sm text-gray-500">
                          ${painting.price} • {painting.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        painting.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {painting.isAvailable ? 'Available' : 'Sold'}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPainting(painting)}
                          className="text-sage-green hover:text-sage-green-dark text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePainting(painting._id)}
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