import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { ArrowLeft, Lock, CreditCard } from 'lucide-react';
import { CheckoutFormData, ShippingOption } from '../types/checkout';
import { useCart } from '../contexts/CartContext';

interface PaymentFormProps {
  formData: CheckoutFormData;
  shippingOption: ShippingOption;
  clientSecret: string;
  onBack: () => void;
  onPaymentSuccess: (orderId: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  formData,
  shippingOption,
  onBack,
  onPaymentSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const totalAmount = cart.totalPrice + shippingOption.price;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
        },
        redirect: 'if_required',
      });
      
      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }
      
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Create order in backend
        const orderData = {
          items: cart.items.map(item => ({
            paintingId: item.painting._id,
            title: item.painting.title,
            price: item.painting.price,
            image: item.painting.images.thumbnail,
          })),
          customer: formData.customer,
          shipping: {
            ...formData.shipping,
            method: shippingOption.name,
            cost: shippingOption.price,
          },
        };
        
        const response = await fetch('/api/payment/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            orderData,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create order');
        }
        
        const result = await response.json();
        
        // Clear cart and redirect to success page
        clearCart();
        onPaymentSuccess(result.order.id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-off-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-text-light hover:text-brown transition-colors duration-200 mb-4"
            disabled={isProcessing}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Checkout</span>
          </button>
          
          <h1 className="text-3xl font-serif text-brown">Payment</h1>
          <p className="text-text-light mt-2">Complete your secure payment</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Element */}
              <div className="bg-cream rounded-lg p-6">
                <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Information</span>
                </h2>
                
                <div className="mb-4">
                  <PaymentElement />
                </div>
                
                {/* Security Notice */}
                <div className="flex items-center space-x-2 text-sm text-text-light bg-off-white p-3 rounded-md">
                  <Lock className="h-4 w-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
              
              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{errorMessage}</p>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-brown text-cream py-3 px-4 rounded-md font-medium hover:bg-brown-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 focus:ring-offset-off-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cream"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    <span>Pay {formatPrice(totalAmount)}</span>
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-cream rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.painting._id} className="flex items-start space-x-3">
                    <img
                      src={item.painting.images.thumbnail}
                      alt={item.painting.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-dark truncate">{item.painting.title}</h4>
                      <p className="text-sm text-text-light">{item.painting.medium}</p>
                      <p className="font-semibold text-brown">{formatPrice(item.painting.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Customer Info */}
              <div className="border-t border-warm-gray pt-4 mb-4">
                <h3 className="font-medium text-text-dark mb-2">Customer</h3>
                <p className="text-sm text-text-light">{formData.customer.name}</p>
                <p className="text-sm text-text-light">{formData.customer.email}</p>
              </div>
              
              {/* Shipping Info */}
              <div className="border-t border-warm-gray pt-4 mb-4">
                <h3 className="font-medium text-text-dark mb-2">Shipping</h3>
                <p className="text-sm text-text-light">
                  {formData.shipping.address}<br />
                  {formData.shipping.city}, {formData.shipping.state} {formData.shipping.zipCode}
                </p>
                <p className="text-sm text-text-light mt-1">
                  {shippingOption.name} - {shippingOption.estimatedDays}
                </p>
              </div>
              
              {/* Totals */}
              <div className="border-t border-warm-gray pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-dark">Subtotal</span>
                  <span className="font-semibold">{formatPrice(cart.totalPrice)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-dark">Shipping</span>
                  <span className="font-semibold">
                    {shippingOption.price === 0 ? 'Free' : formatPrice(shippingOption.price)}
                  </span>
                </div>
                
                <div className="border-t border-warm-gray pt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-text-dark">Total</span>
                    <span className="font-semibold text-brown">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;