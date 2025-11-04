import React, { useState, useEffect } from 'react';
import { CheckCircle, Package, Mail, ArrowLeft } from 'lucide-react';

interface OrderConfirmationProps {
  orderId: string;
  onBackToGallery: () => void;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items: Array<{
    paintingId: string;
    title: string;
    price: number;
    image: string;
  }>;
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
    method?: string;
    cost?: number;
  };
}

const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderId, onBackToGallery }) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/id/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        const order = await response.json();
        setOrderDetails(order);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-green mx-auto mb-4"></div>
          <p className="text-text-light">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-off-white py-8">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">{error || 'Order not found'}</p>
            <button
              onClick={onBackToGallery}
              className="mt-4 bg-sage-green text-cream px-6 py-2 rounded-md font-medium hover:bg-sage-green-dark transition-colors duration-200"
            >
              Back to Gallery
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-off-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif text-brown mb-2">Order Confirmed!</h1>
          <p className="text-text-light text-lg">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>
        
        {/* Order Details */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Information */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-cream rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Order Details</h2>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-text-light">Order Number</span>
                  <p className="font-mono text-text-dark">{orderDetails.orderNumber}</p>
                </div>
                
                <div>
                  <span className="text-sm text-text-light">Status</span>
                  <p className="font-medium text-text-dark capitalize">{orderDetails.status}</p>
                </div>
                
                <div>
                  <span className="text-sm text-text-light">Total Amount</span>
                  <p className="font-semibold text-brown text-lg">{formatPrice(orderDetails.total)}</p>
                </div>
              </div>
            </div>
            
            {/* Customer Information */}
            <div className="bg-cream rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Customer Information</h2>
              
              <div className="space-y-2">
                <p className="text-text-dark">{orderDetails.customer.name}</p>
                <p className="text-text-light">{orderDetails.customer.email}</p>
                {orderDetails.customer.phone && (
                  <p className="text-text-light">{orderDetails.customer.phone}</p>
                )}
              </div>
            </div>
            
            {/* Shipping Information */}
            <div className="bg-cream rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Shipping Information</span>
              </h2>
              
              <div className="space-y-2">
                <p className="text-text-dark">{orderDetails.shipping.address}</p>
                <p className="text-text-dark">
                  {orderDetails.shipping.city}, {orderDetails.shipping.state} {orderDetails.shipping.zipCode}
                </p>
                <p className="text-text-dark">{orderDetails.shipping.country}</p>
                
                {orderDetails.shipping.method && (
                  <div className="mt-3 pt-3 border-t border-warm-gray">
                    <span className="text-sm text-text-light">Shipping Method</span>
                    <p className="text-text-dark">{orderDetails.shipping.method}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="bg-cream rounded-lg p-6">
            <h2 className="text-xl font-semibold text-text-dark mb-4">Items Ordered</h2>
            
            <div className="space-y-4">
              {orderDetails.items.map((item) => (
                <div key={item.paintingId} className="flex items-start space-x-4 pb-4 border-b border-warm-gray last:border-b-0 last:pb-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-dark">{item.title}</h4>
                    <p className="font-semibold text-brown mt-1">{formatPrice(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Next Steps */}
        <div className="mt-8 bg-sage-green bg-opacity-10 border border-sage-green border-opacity-30 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>What's Next?</span>
          </h2>
          
          <div className="space-y-3 text-text-dark">
            <p>• You will receive an email confirmation shortly with your order details</p>
            <p>• We will prepare your artwork for shipping within 1-2 business days</p>
            <p>• You'll receive a tracking number once your order ships</p>
            <p>• If you have any questions, please contact us at support@artistportfolio.com</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={onBackToGallery}
            className="bg-brown text-cream px-8 py-3 rounded-md font-medium hover:bg-brown-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 focus:ring-offset-off-white flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;