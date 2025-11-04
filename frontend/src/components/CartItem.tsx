import React from 'react';
import { X } from 'lucide-react';
import { CartItem as CartItemType } from '../types/cart';

interface CartItemProps {
  item: CartItemType;
  onRemove: (paintingId: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
  const { painting } = item;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  const formatDimensions = (dimensions: typeof painting.dimensions) => {
    return `${dimensions.width}" × ${dimensions.height}" ${dimensions.unit}`;
  };
  
  return (
    <div className="flex items-start space-x-4 py-4 border-b border-warm-gray last:border-b-0">
      {/* Painting Image */}
      <div className="flex-shrink-0 w-16 h-16 bg-warm-gray rounded-md overflow-hidden">
        <img
          src={painting.images.thumbnail}
          alt={painting.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Painting Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-text-dark truncate">
          {painting.title}
        </h4>
        <p className="text-xs text-text-light mt-1">
          {painting.medium}
        </p>
        <p className="text-xs text-text-light">
          {formatDimensions(painting.dimensions)}
        </p>
        <p className="text-sm font-semibold text-brown mt-2">
          {formatPrice(painting.price)}
        </p>
      </div>
      
      {/* Remove Button */}
      <button
        onClick={() => onRemove(painting._id)}
        className="flex-shrink-0 p-1 text-text-light hover:text-brown transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 focus:ring-offset-cream rounded-md"
        aria-label={`Remove ${painting.title} from cart`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default CartItem;