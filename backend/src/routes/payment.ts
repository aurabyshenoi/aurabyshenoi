import express from 'express';
import { stripe, STRIPE_CONFIG } from '../config/stripe';
import Order from '../models/Order';
import Painting from '../models/Painting';

const router = express.Router();

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { items, shipping, customer } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }
    
    if (!shipping || !customer) {
      return res.status(400).json({ error: 'Shipping and customer information are required' });
    }
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const painting = await Painting.findById(item.paintingId);
      if (!painting) {
        return res.status(404).json({ error: `Painting not found: ${item.paintingId}` });
      }
      
      if (!painting.isAvailable) {
        return res.status(400).json({ error: `Painting is no longer available: ${painting.title}` });
      }
      
      totalAmount += painting.price;
      orderItems.push({
        paintingId: painting._id,
        title: painting.title,
        price: painting.price,
        image: painting.images.thumbnail,
      });
    }
    
    // Add shipping cost
    totalAmount += shipping.price || 0;
    
    // Convert to cents for Stripe
    const amountInCents = Math.round(totalAmount * 100);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: STRIPE_CONFIG.currency,
      payment_method_types: STRIPE_CONFIG.paymentMethodTypes,
      capture_method: STRIPE_CONFIG.captureMethod,
      metadata: {
        customer_email: customer.email,
        customer_name: customer.name,
        item_count: items.length.toString(),
        shipping_method: shipping.name || 'Standard',
      },
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
    });
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Confirm payment and create order
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, orderData } = req.body;
    
    if (!paymentIntentId || !orderData) {
      return res.status(400).json({ error: 'Payment intent ID and order data are required' });
    }
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment has not been completed' });
    }
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create order in database
    const order = new Order({
      orderNumber,
      items: orderData.items,
      customer: orderData.customer,
      shipping: orderData.shipping,
      payment: {
        stripePaymentId: paymentIntentId,
        amount: paymentIntent.amount / 100, // Convert back from cents
        status: 'completed',
      },
      status: 'pending',
    });
    
    await order.save();
    
    // Mark paintings as sold
    for (const item of orderData.items) {
      await Painting.findByIdAndUpdate(item.paintingId, { isAvailable: false });
    }
    
    res.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.payment.amount,
        items: order.items,
        customer: order.customer,
        shipping: order.shipping,
      },
    });
    
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ 
      error: 'Failed to confirm payment',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get payment status
router.get('/payment-status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
    });
    
  } catch (error) {
    console.error('Error retrieving payment status:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve payment status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;