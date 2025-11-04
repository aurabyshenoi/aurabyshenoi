import React, { useState, useRef, useCallback } from 'react';
import { uploadImages, deleteImage, validateImageFile, extractPublicIdFromUrl } from '../utils/imageService';

interface ImageUploaderProps {
  images: {
    thumbnail: string;
    fullSize: string[];
  };
  onChange: (images: { thumbnail: string; fullSize: string[] }) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setUploadError('Please select valid image files');
      return;
    }

    // Validate each file
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    imageFiles.forEach(file => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (validationErrors.length > 0) {
      setUploadError(validationErrors.join(', '));
      return;
    }

    if (validFiles.length === 0) {
      setUploadError('No valid image files found');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Upload to Cloudinary via backend
      const uploadResult = await uploadImages(validFiles);

      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Upload failed');
      }

      const uploadedImages = uploadResult.data?.images || [];
      
      // Use medium-sized URLs for display, but store all sizes
      const newUrls = uploadedImages.map(img => img.mediumUrl);
      const newFullSize = [...images.fullSize, ...newUrls];
      const newThumbnail = images.thumbnail || newUrls[0];

      onChange({
        thumbnail: newThumbnail,
        fullSize: newFullSize,
      });

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images.fullSize[index];
    
    // Try to delete from Cloudinary if it's a Cloudinary URL
    const publicId = extractPublicIdFromUrl(imageUrl);
    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
        // Continue with local removal even if Cloudinary deletion fails
      }
    }

    const newFullSize = images.fullSize.filter((_, i) => i !== index);
    const newThumbnail = newFullSize.length > 0 ? newFullSize[0] : '';

    onChange({
      thumbnail: newThumbnail,
      fullSize: newFullSize,
    });
  };

  const handleSetThumbnail = (imageUrl: string) => {
    onChange({
      ...images,
      thumbnail: imageUrl,
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging
            ? 'border-sage-green bg-sage-green bg-opacity-10'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="mt-4">
            <button
              type="button"
              onClick={openFileDialog}
              className="text-sage-green hover:text-sage-green-dark font-medium"
            >
              Upload images
            </button>
            <span className="text-gray-500"> or drag and drop</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, WebP, GIF up to 10MB each
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage-green"></div>
              <span className="text-gray-600">Uploading...</span>
            </div>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{uploadError}</div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.fullSize.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Images</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.fullSize.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                  <img
                    src={imageUrl}
                    alt={`Upload ${index + 1}`}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                
                {/* Image Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    {images.thumbnail !== imageUrl && (
                      <button
                        type="button"
                        onClick={() => handleSetThumbnail(imageUrl)}
                        className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium hover:bg-gray-100"
                      >
                        Set as thumbnail
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Thumbnail Badge */}
                {images.thumbnail === imageUrl && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sage-green text-white">
                      Thumbnail
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};