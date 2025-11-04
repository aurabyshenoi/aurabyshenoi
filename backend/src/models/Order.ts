import mongoose, { Document, Schema } from 'mongoose';

// TypeScript interface for Order
export interface IOrder extends Document {
  orderNumber: string;
  items: {
    paintingId: mongoose.Types.ObjectId;
    title: string;
    price: number;
    image: string;
  }[];
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  payment: {
    stripePaymentId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for Order
const OrderSchema: Schema = new Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  items: [{
    paintingId: {
      type: Schema.Types.ObjectId,
      ref: 'Painting',
      required: [true, 'Painting ID is required']
    },
    title: {
      type: String,
      required: [true, 'Painting title is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be greater than or equal to 0']
    },
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true
    }
  }],
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters']
    }
  },
  shipping: {
    address: {
      type: String,
      required: [true, 'Shipping address is required'],
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true,
      maxlength: [20, 'Zip code cannot exceed 20 characters']
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters']
    }
  },
  payment: {
    stripePaymentId: {
      type: String,
      required: [true, 'Stripe payment ID is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount must be greater than or equal to 0']
    },
    status: {
      type: String,
      required: [true, 'Payment status is required'],
      enum: {
        values: ['pending', 'completed', 'failed'],
        message: 'Payment status must be pending, completed, or failed'
      },
      default: 'pending'
    }
  },
  status: {
    type: String,
    required: [true, 'Order status is required'],
    enum: {
      values: ['pending', 'processing', 'shipped', 'delivered'],
      message: 'Order status must be pending, processing, shipped, or delivered'
    },
    default: 'pending'
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    // Generate order number: ORD-YYYYMMDD-XXXX
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    
    // Find the last order of the day to get the next sequence number
    const lastOrder = await mongoose.model('Order').findOne({
      orderNumber: new RegExp(`^ORD-${dateStr}-`)
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }
    
    this.orderNumber = `ORD-${dateStr}-${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

// Indexes for efficient querying
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ 'payment.status': 1 });
OrderSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'payment.status': 1, createdAt: -1 });
OrderSchema.index({ 'customer.email': 1, createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);