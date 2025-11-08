import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Newsletter
export interface INewsletter extends Document {
  email: string;
  subscribedAt: Date;
  status: 'active' | 'unsubscribed';
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for Newsletter
const NewsletterSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [254, 'Email cannot exceed 254 characters'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['active', 'unsubscribed'],
      message: 'Status must be active or unsubscribed'
    },
    default: 'active'
  },
  source: {
    type: String,
    default: 'homepage',
    trim: true
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
NewsletterSchema.index({ email: 1 }, { unique: true });
NewsletterSchema.index({ subscribedAt: -1 });
NewsletterSchema.index({ status: 1 });

// Compound index for common query patterns
NewsletterSchema.index({ status: 1, subscribedAt: -1 });

export default mongoose.model<INewsletter>('Newsletter', NewsletterSchema);
