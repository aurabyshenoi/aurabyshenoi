import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { Order, Painting } from '../models';
import { sendOrderConfirmationEmail } from '../utils/emailService';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

// Interface for order creation request
interface CreateOrderRequest {
  items: {
    paintingId: string;
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
  paymentMethodId: string;
}

// Helper function to calculate shipping cost
const calculateShippingCost = (country: string, totalAmount: number): number => {
  // Basic shipping calculation - can be enhanced with more complex logic
  const baseShipping = country.toLowerCase() === 'united states' || country.toLowerCase() === 'us' ? 15 : 35;
  
  // Free shipping for orders over $500
  if (totalAmount >= 500) {
    return 0;
  }
  
  return baseShipping;
};

// Helper function to validate painting availability
const validatePaintingAvailability = async (paintingIds: string[]) => {
  const paintings = await Painting.find({
    _id: { $in: paintingIds },
    isAvailable: true
  });

  if (paintings.length !== paintingIds.length) {
    const foundIds = paintings.map(p => p._id.toString());
    const unavailableIds = paintingIds.filter(id => !foundIds.includes(id));
    throw new Error(`Some paintings are no longer available: ${unavailableIds.join(', ')}`);
  }

  return paintings;
};

// POST /api/orders - Create new order
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      items,
      customer,
      shipping,
      paymentMethodId
    }: CreateOrderRequest = req.body;

    // Validate required fields
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!customer || !customer.name || !customer.email) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and email are required'
      });
    }

    if (!shipping || !shipping.address || !shipping.city || !shipping.state || !shipping.zipCode || !shipping.country) {
      return res.status(400).json({
        success: false,
        message: 'Complete shipping address is required'
      });
    }

    if (!paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Extract painting IDs and validate availability
    const paintingIds = items.map(item => item.paintingId);
    const paintings = await validatePaintingAvailability(paintingIds);

    // Calculate order totals
    const subtotal = paintings.reduce((sum, painting) => sum + painting.price, 0);
    const shippingCost = calculateShippingCost(shipping.country, subtotal);
    const totalAmount = subtotal + shippingCost;

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/order-confirmation`,
      metadata: {
        customer_email: customer.email,
        customer_name: customer.name,
        item_count: paintings.length.toString()
      }
    });

    // Handle payment confirmation
    if (paymentIntent.status === 'requires_action') {
      return res.json({
        success: false,
        requiresAction: true,
        clientSecret: paymentIntent.client_secret,
        message: 'Payment requires additional authentication'
      });
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.',
        paymentStatus: paymentIntent.status
      });
    }

    // Create order items with painting details
    const orderItems = paintings.map(painting => ({
      paintingId: painting._id,
      title: painting.title,
      price: painting.price,
      image: painting.images.thumbnail
    }));

    // Create order in database
    const order = new Order({
      items: orderItems,
      customer: {
        name: customer.name.trim(),
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone?.trim()
      },
      shipping: {
        address: shipping.address.trim(),
        city: shipping.city.trim(),
        state: shipping.state.trim(),
        zipCode: shipping.zipCode.trim(),
        country: shipping.country.trim()
      },
      payment: {
        stripePaymentId: paymentIntent.id,
        amount: totalAmount,
        status: 'completed'
      },
      status: 'pending'
    });

    await order.save();

    // Mark paintings as unavailable
    await Painting.updateMany(
      { _id: { $in: paintingIds } },
      { isAvailable: false }
    );

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail({
        order,
        subtotal,
        shippingCost,
        totalAmount
      });
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      success: true,
      data: {
        order: {
          orderNumber: order.orderNumber,
          _id: order._id,
          items: order.items,
          customer: order.customer,
          shipping: order.shipping,
          payment: {
            amount: order.payment.amount,
            status: order.payment.status
          },
          status: order.status,
          createdAt: order.createdAt
        },
        totals: {
          subtotal,
          shippingCost,
          totalAmount
        }
      },
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle Stripe errors specifically
    if (error instanceof Stripe.errors.StripeError) {
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/orders/validate - Validate order before payment
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { items, shipping } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Extract painting IDs and validate availability
    const paintingIds = items.map((item: any) => item.paintingId);
    const paintings = await validatePaintingAvailability(paintingIds);

    // Calculate totals
    const subtotal = paintings.reduce((sum, painting) => sum + painting.price, 0);
    const shippingCost = calculateShippingCost(shipping?.country || 'US', subtotal);
    const totalAmount = subtotal + shippingCost;

    // Return order summary
    res.json({
      success: true,
      data: {
        items: paintings.map(painting => ({
          paintingId: painting._id,
          title: painting.title,
          price: painting.price,
          image: painting.images.thumbnail
        })),
        totals: {
          subtotal,
          shippingCost,
          totalAmount
        },
        isValid: true
      }
    });

  } catch (error) {
    console.error('Error validating order:', error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Order validation failed'
    });
  }
});

// GET /api/orders/id/:id - Get order by ID
router.get('/id/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Return order details (excluding sensitive payment info)
    res.json({
      id: order._id,
      orderNumber: order.orderNumber,
      items: order.items,
      customer: order.customer,
      shipping: order.shipping,
      status: order.status,
      total: order.payment.amount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/orders/:orderNumber - Get order by order number (for customer lookup)
router.get('/:orderNumber', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order number is required'
      });
    }

    const order = await Order.findOne({ orderNumber }).populate('items.paintingId', 'title images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Return order details (excluding sensitive payment info)
    res.json({
      success: true,
      data: {
        order: {
          orderNumber: order.orderNumber,
          items: order.items,
          customer: {
            name: order.customer.name,
            email: order.customer.email
          },
          shipping: order.shipping,
          payment: {
            amount: order.payment.amount,
            status: order.payment.status
          },
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;