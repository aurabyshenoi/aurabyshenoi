import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to upload image buffer to Cloudinary
export const uploadImageToCloudinary = async (
  buffer: Buffer,
  folder: string = 'paintings',
  publicId?: string
): Promise<{
  url: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
}> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.url,
            publicId: result.public_id,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height,
          });
        } else {
          reject(new Error('Upload failed - no result returned'));
        }
      }
    ).end(buffer);
  });
};

// Helper function to delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to generate optimized image URLs
export const generateOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string => {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  let transformation = `q_${quality},f_${format}`;
  
  if (width || height) {
    transformation += `,c_${crop}`;
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;
  }

  return cloudinary.url(publicId, {
    transformation,
    secure: true,
  });
};