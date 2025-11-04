import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Contact
export interface IContact extends Document {
  contactNumber: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  query: string;
  status: 'new' | 'contacted' | 'completed';
  emailNotificationSent: boolean;
  emailNotificationSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for Contact
const ContactSchema: Schema = new Schema({
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    unique: true,
    trim: true
  },
  customer: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    }
  },
  query: {
    type: String,
    required: [true, 'Query message is required'],
    trim: true,
    maxlength: [2000, 'Query cannot exceed 2000 characters']
  },
  status: {
    type: String,
    required: [true, 'Contact status is required'],
    enum: {
      values: ['new', 'contacted', 'completed'],
      message: 'Contact status must be new, contacted, or completed'
    },
    default: 'new'
  },
  emailNotificationSent: {
    type: Boolean,
    default: false
  },
  emailNotificationSentAt: {
    type: Date
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to generate contact number
ContactSchema.pre('save', async function(next) {
  if (this.isNew && !this.contactNumber) {
    // Generate contact number: CNT-YYYYMMDD-XXXX
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    // Find the last contact of the day to get the next sequence number
    const ContactModel = this.constructor as mongoose.Model<IContact>;
    const lastContact = await ContactModel.findOne({
      contactNumber: new RegExp(`^CNT-${dateStr}-`)
    }).sort({ contactNumber: -1 });
    
    let sequence = 1;
    if (lastContact) {
      const lastSequence = parseInt(lastContact.contactNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.contactNumber = `CNT-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

// Indexes for efficient querying
ContactSchema.index({ contactNumber: 1 });
ContactSchema.index({ 'customer.email': 1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ 'customer.email': 1, createdAt: -1 });

export default mongoose.model<IContact>('Contact', ContactSchema);