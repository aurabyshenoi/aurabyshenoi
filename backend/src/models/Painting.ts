import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Painting
export interface IPainting extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for Painting
const PaintingSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  dimensions: {
    width: {
      type: Number,
      required: [true, 'Width is required'],
      min: [0.1, 'Width must be greater than 0']
    },
    height: {
      type: Number,
      required: [true, 'Height is required'],
      min: [0.1, 'Height must be greater than 0']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: {
        values: ['inches', 'cm'],
        message: 'Unit must be either inches or cm'
      }
    }
  },
  medium: {
    type: String,
    required: [true, 'Medium is required'],
    trim: true,
    maxlength: [100, 'Medium cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be greater than or equal to 0']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  images: {
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail image is required'],
      trim: true
    },
    fullSize: [{
      type: String,
      required: true,
      trim: true
    }]
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
PaintingSchema.index({ category: 1 });
PaintingSchema.index({ price: 1 });
PaintingSchema.index({ isAvailable: 1 });
PaintingSchema.index({ createdAt: -1 });
PaintingSchema.index({ title: 'text', description: 'text' }); // Text search index

// Compound indexes for common query patterns (most specific first)
PaintingSchema.index({ isAvailable: 1, category: 1, price: 1, createdAt: -1 }); // Main gallery query
PaintingSchema.index({ isAvailable: 1, price: 1, createdAt: -1 }); // Price filtering
PaintingSchema.index({ isAvailable: 1, createdAt: -1 }); // Default sorting
PaintingSchema.index({ category: 1, isAvailable: 1 }); // Category filtering

// Sparse indexes for optional fields
PaintingSchema.index({ medium: 1 }, { sparse: true });

// Partial indexes for performance optimization
PaintingSchema.index(
  { createdAt: -1 }, 
  { 
    partialFilterExpression: { isAvailable: true },
    name: 'available_paintings_by_date'
  }
);

export default mongoose.model<IPainting>('Painting', PaintingSchema);