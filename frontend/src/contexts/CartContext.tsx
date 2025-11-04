import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartState, CartContextType, CartItem } from '../types/cart';
import { Painting } from '../types/painting';

// Initial cart state
const initialCartState: CartState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,
};

// Cart actions
type CartAction =
  | { type: 'ADD_TO_CART'; payload: Painting }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const painting = action.payload;
      
      // Check if item already exists in cart
      const existingItemIndex = state.items.findIndex(
        item => item.painting._id === painting._id
      );
      
      if (existingItemIndex >= 0) {
        // Item already in cart, don't add again (paintings are unique)
        return state;
      }
      
      const newItem: CartItem = {
        painting,
        quantity: 1,
        addedAt: new Date(),
      };
      
      const newItems = [...state.items, newItem];
      
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        totalPrice: newItems.reduce((total, item) => total + item.painting.price, 0),
      };
    }
    
    case 'REMOVE_FROM_CART': {
      const paintingId = action.payload;
      const newItems = state.items.filter(item => item.painting._id !== paintingId);
      
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        totalPrice: newItems.reduce((total, item) => total + item.painting.price, 0),
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    
    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      };
    
    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };
    
    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCartState);
  
  const addToCart = (painting: Painting) => {
    dispatch({ type: 'ADD_TO_CART', payload: painting });
  };
  
  const removeFromCart = (paintingId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: paintingId });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };
  
  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };
  
  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };
  
  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
  };
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};