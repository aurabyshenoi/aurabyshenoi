import { render, screen, act } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { Painting } from '../../types/painting';

// Mock painting data
const mockPainting: Painting = {
  _id: '1',
  title: 'Test Painting',
  description: 'A beautiful test painting',
  dimensions: { width: 24, height: 36, unit: 'inches' },
  medium: 'Oil on canvas',
  price: 500,
  category: 'landscape',
  images: {
    thumbnail: 'test-thumb.jpg',
    fullSize: ['test-full.jpg']
  },
  isAvailable: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockPainting2: Painting = {
  ...mockPainting,
  _id: '2',
  title: 'Test Painting 2',
  price: 300
};

// Test component to access cart context
const TestComponent = () => {
  const { cart, addToCart, removeFromCart, clearCart, toggleCart, openCart, closeCart } = useCart();
  
  return (
    <div>
      <div data-testid="cart-items">{cart.totalItems}</div>
      <div data-testid="cart-price">{cart.totalPrice}</div>
      <div data-testid="cart-open">{cart.isOpen ? 'open' : 'closed'}</div>
      <button onClick={() => addToCart(mockPainting)} data-testid="add-painting-1">
        Add Painting 1
      </button>
      <button onClick={() => addToCart(mockPainting2)} data-testid="add-painting-2">
        Add Painting 2
      </button>
      <button onClick={() => removeFromCart('1')} data-testid="remove-painting-1">
        Remove Painting 1
      </button>
      <button onClick={clearCart} data-testid="clear-cart">
        Clear Cart
      </button>
      <button onClick={toggleCart} data-testid="toggle-cart">
        Toggle Cart
      </button>
      <button onClick={openCart} data-testid="open-cart">
        Open Cart
      </button>
      <button onClick={closeCart} data-testid="close-cart">
        Close Cart
      </button>
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <CartProvider>
      <TestComponent />
    </CartProvider>
  );
};

describe('CartContext', () => {
  test('initializes with empty cart', () => {
    renderWithProvider();
    
    expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-price')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-open')).toHaveTextContent('closed');
  });

  test('adds painting to cart', () => {
    renderWithProvider();
    
    act(() => {
      screen.getByTestId('add-painting-1').click();
    });
    
    expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-price')).toHaveTextContent('500');
  });

  test('adds multiple paintings to cart', () => {
    renderWithProvider();
    
    act(() => {
      screen.getByTestId('add-painting-1').click();
      screen.getByTestId('add-painting-2').click();
    });
    
    expect(screen.getByTestId('cart-items')).toHaveTextContent('2');
    expect(screen.getByTestId('cart-price')).toHaveTextContent('800');
  });

  test('does not add duplicate paintings', () => {
    renderWithProvider();
    
    act(() => {
      screen.getByTestId('add-painting-1').click();
      screen.getByTestId('add-painting-1').click();
    });
    
    expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-price')).toHaveTextContent('500');
  });

  test('removes painting from cart', () => {
    renderWithProvider();
    
    act(() => {
      screen.getByTestId('add-painting-1').click();
      screen.getByTestId('add-painting-2').click();
    });
    
    expect(screen.getByTestId('cart-items')).toHaveTextContent('2');
    
    act(() => {
      screen.getByTestId('remove-painting-1').click();
    });
    
    expect(screen.getByTestId('cart-items')).toHaveTextContent('1');
    expect(screen.getByTestId('cart-price')).toHaveTextContent('300');
  });

  test('clears entire cart', () => {
    renderWithProvider();
    
    act(() => {
      screen.getByTestId('add-painting-1').click();
      screen.getByTestId('add-painting-2').click();
    });
    
    expect(screen.getByTestId('cart-items')).toHaveTextContent('2');
    
    act(() => {
      screen.getByTestId('clear-cart').click();
    });
    
    expect(screen.getByTestId('cart-items')).toHaveTextContent('0');
    expect(screen.getByTestId('cart-price')).toHaveTextContent('0');
  });

  test('toggles cart open/closed state', () => {
    renderWithProvider();
    
    expect(screen.getByTestId('cart-open')).toHaveTextContent('closed');
    
    act(() => {
      screen.getByTestId('toggle-cart').click();
    });
    
    expect(screen.getByTestId('cart-open')).toHaveTextContent('open');
    
    act(() => {
      screen.getByTestId('toggle-cart').click();
    });
    
    expect(screen.getByTestId('cart-open')).toHaveTextContent('closed');
  });

  test('opens cart', () => {
    renderWithProvider();
    
    act(() => {
      screen.getByTestId('open-cart').click();
    });
    
    expect(screen.getByTestId('cart-open')).toHaveTextContent('open');
  });

  test('closes cart', () => {
    renderWithProvider();
    
    act(() => {
      screen.getByTestId('open-cart').click();
    });
    
    expect(screen.getByTestId('cart-open')).toHaveTextContent('open');
    
    act(() => {
      screen.getByTestId('close-cart').click();
    });
    
    expect(screen.getByTestId('cart-open')).toHaveTextContent('closed');
  });

  test('throws error when useCart is used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      useCart();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useCart must be used within a CartProvider');
    
    consoleSpy.mockRestore();
  });
});