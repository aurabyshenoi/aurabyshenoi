import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Painting } from '../types/painting';

interface AddToCartButtonProps {
  painting: Painting;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  painting, 
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const { cart, addToCart, openCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  // Check if painting is already in cart
  const isInCart = cart.items.some(item => item.painting._id === painting._id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (isInCart) {
      // If already in cart, open cart to show it
      openCart();
      return;
    }
    
    addToCart(painting);
    setIsAdded(true);
    
    // Reset the "added" state after animation
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  // Variant classes
  const variantClasses = {
    primary: isInCart 
      ? 'bg-sage-green text-cream hover:bg-sage-green-dark'
      : 'bg-brown text-cream hover:bg-brown-dark',
    secondary: isInCart
      ? 'border-2 border-sage-green text-sage-green hover:bg-sage-green hover:text-cream'
      : 'border-2 border-brown text-brown hover:bg-brown hover:text-cream'
  };
  
  const baseClasses = 'font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2';
  
  const focusRingColor = isInCart ? 'focus:ring-sage-green' : 'focus:ring-brown';
  
  return (
    <button
      onClick={handleAddToCart}
      disabled={!painting.isAvailable}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${focusRingColor} ${className}`}
      aria-label={
        !painting.isAvailable 
          ? 'Painting not available'
          : isInCart 
            ? 'View in cart' 
            : `Add ${painting.title} to cart`
      }
    >
      {!painting.isAvailable ? (
        <>
          <span>Sold</span>
        </>
      ) : isAdded ? (
        <>
          <Check className="h-4 w-4" />
          <span>Added!</span>
        </>
      ) : isInCart ? (
        <>
          <ShoppingBag className="h-4 w-4" />
          <span>In Cart</span>
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
};

export default AddToCartButton;