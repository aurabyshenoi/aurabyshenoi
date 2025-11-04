import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { StripeProvider } from '../contexts/StripeContext';
import CheckoutForm from './CheckoutForm';
import PaymentForm from './PaymentForm';
import OrderConfirmation from './OrderConfirmation';
import { CheckoutFormData, ShippingOption } from '../types/checkout';

interface CheckoutPageProps {
  onBack: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack }) => {
  const { cart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'payment' | 'confirmation'>('form');
  const [formData, setFormData] = useState<CheckoutFormData | null>(null);
  const [shippingOption, setShippingOption] = useState<ShippingOption | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  
  // Redirect back if cart is empty
  if (cart.items.length === 0) {
    onBack();
    return null;
  }
  
  const handleProceedToPayment = async (data: CheckoutFormData, shipping: ShippingOption) => {
    setFormData(data);
    setShippingOption(shipping);
    
    try {
      // Create payment intent
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            paintingId: item.painting._id,
          })),
          shipping: {
            price: shipping.price,
            name: shipping.name,
          },
          customer: data.customer,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const result = await response.json();
      setClientSecret(result.clientSecret);
      setCheckoutStep('payment');
    } catch (error) {
      console.error('Error creating payment intent:', error);
      // Handle error - could show error message to user
    }
  };
  
  const handleBackToForm = () => {
    setCheckoutStep('form');
  };
  
  const handlePaymentSuccess = (orderIdResult: string) => {
    setOrderId(orderIdResult);
    setCheckoutStep('confirmation');
  };
  
  if (checkoutStep === 'form') {
    return (
      <CheckoutForm
        onBack={onBack}
        onProceedToPayment={handleProceedToPayment}
      />
    );
  }
  
  if (checkoutStep === 'payment' && formData && shippingOption && clientSecret) {
    return (
      <StripeProvider>
        <PaymentForm
          formData={formData}
          shippingOption={shippingOption}
          clientSecret={clientSecret}
          onBack={handleBackToForm}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </StripeProvider>
    );
  }
  
  if (checkoutStep === 'confirmation' && orderId) {
    return (
      <OrderConfirmation
        orderId={orderId}
        onBackToGallery={onBack}
      />
    );
  }
  
  // Loading or error state
  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-green mx-auto mb-4"></div>
        <p className="text-text-light">Loading...</p>
      </div>
    </div>
  );
};

export default CheckoutPage;