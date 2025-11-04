import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Testimonial
export interface ITestimonial extends Document {
  customerName: string;
  customerPhoto: string;
  testimonialText: string;
  rating?: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for Testimonial
const TestimonialSchema: Schema = new Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerPhoto: {
    type: String,
    required: [true, 'Customer photo is required'],
    trim: true
  },
  testimonialText: {
    type: String,
    required: [true, 'Testimonial text is required'],
    trim: true,
    maxlength: [1000, 'Testimonial text cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: function(v: number) {
        return v === undefined || (Number.isInteger(v) && v >= 1 && v <= 5);
      },
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    required: [true, 'Display order is required'],
    min: [0, 'Display order must be greater than or equal to 0']
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
TestimonialSchema.index({ isActive: 1, displayOrder: 1 }); // Main query for active testimonials
TestimonialSchema.index({ displayOrder: 1 }); // Admin ordering
TestimonialSchema.index({ createdAt: -1 }); // Admin listing by date
TestimonialSchema.index({ customerName: 1 }); // Search by customer name

// Compound index for the most common query pattern
TestimonialSchema.index(
  { isActive: 1, displayOrder: 1, createdAt: -1 },
  { name: 'active_testimonials_ordered' }
);

// Ensure unique display order for active testimonials
TestimonialSchema.index(
  { displayOrder: 1 },
  { 
    unique: true,
    partialFilterExpression: { isActive: true },
    name: 'unique_display_order_active'
  }
);

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);