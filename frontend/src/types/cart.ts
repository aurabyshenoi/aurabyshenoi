import { Painting } from './painting';

export interface CartItem {
  painting: Painting;
  quantity: number; // For now always 1 since paintings are unique
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
}

export interface CartContextType {
  cart: CartState;
  addToCart: (painting: Painting) => void;
  removeFromCart: (paintingId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}