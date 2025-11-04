import React, { useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import CartItem from './CartItem';

interface ShoppingCartProps {
  onCheckout?: () => void;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ onCheckout }) => {
  const { cart, removeFromCart, clearCart, closeCart } = useCart();
  
  // Close cart on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && cart.isOpen) {
        closeCart();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [cart.isOpen, closeCart]);
  
  // Prevent body scroll when cart is open
  useEffect(() => {
    if (cart.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [cart.isOpen]);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  if (!cart.isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />
      
      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-cream shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-warm-gray">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-brown" />
              <h2 className="text-lg font-semibold text-text-dark">
                Shopping Cart
              </h2>
              {cart.totalItems > 0 && (
                <span className="bg-brown text-cream text-xs font-semibold rounded-full px-2 py-1 min-w-[20px] text-center">
                  {cart.totalItems}
                </span>
              )}
            </div>
            
            <button
              onClick={closeCart}
              className="p-2 text-text-light hover:text-brown transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream rounded-md"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto">
            {cart.items.length === 0 ? (
              /* Empty Cart */
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <ShoppingBag className="h-16 w-16 text-warm-gray mb-4" />
                <h3 className="text-lg font-medium text-text-dark mb-2">
                  Your cart is empty
                </h3>
                <p className="text-text-light mb-6">
                  Browse our gallery to find beautiful paintings to add to your collection.
                </p>
                <button
                  onClick={closeCart}
                  className="bg-sage-green text-cream px-6 py-2 rounded-md font-medium hover:bg-sage-green-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              /* Cart Items */
              <div className="p-6">
                <div className="space-y-0">
                  {cart.items.map((item) => (
                    <CartItem
                      key={item.painting._id}
                      item={item}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
                
                {/* Clear Cart Button */}
                {cart.items.length > 1 && (
                  <button
                    onClick={clearCart}
                    className="mt-4 text-sm text-text-light hover:text-brown transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream rounded-md px-2 py-1"
                  >
                    Clear all items
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Footer with Total and Checkout */}
          {cart.items.length > 0 && (
            <div className="border-t border-warm-gray p-6 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-text-dark">
                  Total
                </span>
                <span className="text-xl font-semibold text-brown">
                  {formatPrice(cart.totalPrice)}
                </span>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={onCheckout}
                className="w-full bg-brown text-cream py-3 px-4 rounded-md font-medium hover:bg-brown-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 focus:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cart.items.length === 0}
              >
                Proceed to Checkout
              </button>
              
              {/* Continue Shopping */}
              <button
                onClick={closeCart}
                className="w-full text-text-dark hover:text-sage-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream rounded-md py-2"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShoppingCart;