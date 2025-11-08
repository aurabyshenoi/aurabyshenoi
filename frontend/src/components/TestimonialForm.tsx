import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from './AdminLayout';
import { ImageUploader } from './ImageUploader';
import { Testimonial, TestimonialFormData } from '../types/testimonial';

interface TestimonialFormProps {
  testimonial?: Testimonial | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TestimonialForm: React.FC<TestimonialFormProps> = ({
  testimonial,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<TestimonialFormData>({
    customerName: '',
    customerPhoto: '',
    testimonialText: '',
    rating: undefined,
    isActive: true,
    displayOrder: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (testimonial) {
      setFormData({
        customerName: testimonial.customerName,
        customerPhoto: testimonial.customerPhoto,
        testimonialText: testimonial.testimonialText,
        rating: testimonial.rating,
        isActive: testimonial.isActive,
        displayOrder: testimonial.displayOrder,
      });
      setUploadedImages([testimonial.customerPhoto]);
    }
  }, [testimonial]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'rating') {
      const numValue = value === '' ? undefined : parseInt(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else if (name === 'displayOrder') {
      const numValue = parseInt(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (images: any[]) => {
    if (images.length > 0) {
      const imageUrl = images[0].publicId; // Use publicId for Cloudinary
      setFormData(prev => ({ ...prev, customerPhoto: imageUrl }));
      setUploadedImages([imageUrl]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!formData.customerPhoto) {
      setError('Customer photo is required');
      return;
    }
    if (!formData.testimonialText.trim()) {
      setError('Testimonial text is required');
      return;
    }
    if (formData.displayOrder < 0) {
      setError('Display order must be 0 or greater');
      return;
    }

    try {
      setIsLoading(true);
      
      const url = testimonial 
        ? `/api/admin/testimonials/${testimonial._id}`
        : '/api/admin/testimonials';
      
      const method = testimonial ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save testimonial');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save testimonial');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title={testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
              Customer Name *
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sage-green focus:border-sage-green sm:text-sm"
              placeholder="Enter customer's full name"
            />
          </div>

          {/* Customer Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Photo *
            </label>
            <ImageUploader
              images={{ thumbnail: uploadedImages[0] || '', fullSize: uploadedImages }}
              onChange={(imgs) => handleImageUpload(imgs.fullSize)}
            />
            <p className="mt-2 text-sm text-gray-500">
              Upload a photo of the customer. Recommended size: 200x200px or larger, square aspect ratio.
            </p>
          </div>

          {/* Testimonial Text */}
          <div>
            <label htmlFor="testimonialText" className="block text-sm font-medium text-gray-700">
              Testimonial Text *
            </label>
            <textarea
              id="testimonialText"
              name="testimonialText"
              value={formData.testimonialText}
              onChange={handleInputChange}
              required
              rows={4}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sage-green focus:border-sage-green sm:text-sm"
              placeholder="Enter the customer's testimonial..."
              maxLength={1000}
            />
            <p className="mt-2 text-sm text-gray-500">
              {formData.testimonialText.length}/1000 characters
            </p>
          </div>

          {/* Rating */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
              Rating (Optional)
            </label>
            <select
              id="rating"
              name="rating"
              value={formData.rating || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sage-green focus:border-sage-green sm:text-sm"
            >
              <option value="">No rating</option>
              <option value="1">1 Star</option>
              <option value="2">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </div>

          {/* Display Order */}
          <div>
            <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700">
              Display Order *
            </label>
            <input
              type="number"
              id="displayOrder"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleInputChange}
              required
              min="0"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-sage-green focus:border-sage-green sm:text-sm"
              placeholder="0"
            />
            <p className="mt-2 text-sm text-gray-500">
              Lower numbers appear first in the carousel. Each active testimonial must have a unique display order.
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-sage-green focus:ring-sage-green border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active (display in testimonials carousel)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-green"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sage-green hover:bg-sage-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage-green disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : testimonial ? 'Update Testimonial' : 'Create Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};