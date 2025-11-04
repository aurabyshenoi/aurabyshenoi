import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminLayout } from './AdminLayout';
import { ImageUploader } from './ImageUploader';
import { Painting } from '../types/painting';

interface PaintingFormProps {
  painting?: Painting | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  description: string;
  dimensions: {
    width: number;
    height: number;
    unit: 'inches' | 'cm';
  };
  medium: string;
  price: number;
  category: string;
  images: {
    thumbnail: string;
    fullSize: string[];
  };
  isAvailable: boolean;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  dimensions: {
    width: 0,
    height: 0,
    unit: 'inches',
  },
  medium: '',
  price: 0,
  category: '',
  images: {
    thumbnail: '',
    fullSize: [],
  },
  isAvailable: true,
};

export const PaintingForm: React.FC<PaintingFormProps> = ({
  painting,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (painting) {
      setFormData({
        title: painting.title,
        description: painting.description,
        dimensions: painting.dimensions,
        medium: painting.medium,
        price: painting.price,
        category: painting.category,
        images: painting.images,
        isAvailable: painting.isAvailable,
      });
    }
  }, [painting]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as object),
          [child]: type === 'number' ? parseFloat(value) || 0 : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : 
                type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleImagesChange = (images: { thumbnail: string; fullSize: string[] }) => {
    setFormData(prev => ({
      ...prev,
      images,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.medium || 
          !formData.category || formData.price <= 0 || 
          formData.dimensions.width <= 0 || formData.dimensions.height <= 0) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.images.thumbnail || formData.images.fullSize.length === 0) {
        throw new Error('Please upload at least one image');
      }

      const url = painting 
        ? `/api/admin/paintings/${painting._id}`
        : '/api/admin/paintings';
      
      const method = painting ? 'PUT' : 'POST';

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
        throw new Error(errorData.message || 'Failed to save painting');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save painting');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title={painting ? 'Edit Painting' : 'Add New Painting'}>
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Basic Information
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Essential details about the painting
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-sage-green focus:border-sage-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={4}
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-sage-green focus:border-sage-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-3">
                    <label htmlFor="medium" className="block text-sm font-medium text-gray-700">
                      Medium *
                    </label>
                    <input
                      type="text"
                      name="medium"
                      id="medium"
                      required
                      value={formData.medium}
                      onChange={handleInputChange}
                      placeholder="e.g., Oil on canvas, Watercolor, Acrylic"
                      className="mt-1 focus:ring-sage-green focus:border-sage-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-3">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <select
                      name="category"
                      id="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sage-green focus:border-sage-green sm:text-sm"
                    >
                      <option value="">Select a category</option>
                      <option value="landscape">Landscape</option>
                      <option value="portrait">Portrait</option>
                      <option value="abstract">Abstract</option>
                      <option value="still-life">Still Life</option>
                      <option value="nature">Nature</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dimensions and Pricing */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Dimensions & Pricing
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Size and pricing information
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-2">
                    <label htmlFor="dimensions.width" className="block text-sm font-medium text-gray-700">
                      Width *
                    </label>
                    <input
                      type="number"
                      name="dimensions.width"
                      id="dimensions.width"
                      required
                      min="0"
                      step="0.1"
                      value={formData.dimensions.width}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-sage-green focus:border-sage-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="dimensions.height" className="block text-sm font-medium text-gray-700">
                      Height *
                    </label>
                    <input
                      type="number"
                      name="dimensions.height"
                      id="dimensions.height"
                      required
                      min="0"
                      step="0.1"
                      value={formData.dimensions.height}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-sage-green focus:border-sage-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="dimensions.unit" className="block text-sm font-medium text-gray-700">
                      Unit
                    </label>
                    <select
                      name="dimensions.unit"
                      id="dimensions.unit"
                      value={formData.dimensions.unit}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sage-green focus:border-sage-green sm:text-sm"
                    >
                      <option value="inches">Inches</option>
                      <option value="cm">Centimeters</option>
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price (USD) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-sage-green focus:border-sage-green block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        id="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleInputChange}
                        className="focus:ring-sage-green h-4 w-4 text-sage-green border-gray-300 rounded"
                      />
                      <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                        Available for purchase
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Images
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload high-quality images of your painting
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <ImageUploader
                  images={formData.images}
                  onChange={handleImagesChange}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
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
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                painting ? 'Update Painting' : 'Create Painting'
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};