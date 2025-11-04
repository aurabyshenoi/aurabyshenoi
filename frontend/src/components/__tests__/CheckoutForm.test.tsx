import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckoutForm from '../CheckoutForm';
import { CartProvider, useCart } from '../../contexts/CartContext';
import { Painting } from '../../types/painting';

// Mock the shipping utility functions
vi.mock('../../utils/shipping', () => ({
  calculateShippingCost: vi.fn(() => [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '5-7 business days',
      estimatedDays: '5-7 business days',
      price: 15
    }
  ]),
  getCountries: vi.fn(() => [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' }
  ]),
  getUSStates: vi.fn(() => [
    { code: 'CA', name: 'California' },
    { code: 'NY', name: 'New York' }
  ])
}));

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

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <CartProvider>{children}</CartProvider>;
};

describe('CheckoutForm', () => {
  const mockOnBack = vi.fn();
  const mockOnProceedToPayment = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
    mockOnProceedToPayment.mockClear();
  });

  test('renders checkout form with all required fields', () => {
    render(
      <TestWrapper>
        <CheckoutForm onBack={mockOnBack} onProceedToPayment={mockOnProceedToPayment} />
      </TestWrapper>
    );

    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Customer Information')).toBeInTheDocument();
    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    
    // Check for required form fields
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/zip/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
  });

  test('calls onBack when back button is clicked', () => {
    render(
      <TestWrapper>
        <CheckoutForm onBack={mockOnBack} onProceedToPayment={mockOnProceedToPayment} />
      </TestWrapper>
    );

    const backButton = screen.getByText('Back to Cart');
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  test('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CheckoutForm onBack={mockOnBack} onProceedToPayment={mockOnProceedToPayment} />
      </TestWrapper>
    );

    // Try to submit empty form
    const submitButton = screen.getByText('Proceed to Payment');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Address is required')).toBeInTheDocument();
      expect(screen.getByText('City is required')).toBeInTheDocument();
      expect(screen.getByText('State/Province is required')).toBeInTheDocument();
      expect(screen.getByText('ZIP/Postal code is required')).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CheckoutForm onBack={mockOnBack} onProceedToPayment={mockOnProceedToPayment} />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByText('Proceed to Payment');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  test('updates form fields when user types', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CheckoutForm onBack={mockOnBack} onProceedToPayment={mockOnProceedToPayment} />
      </TestWrapper>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    
    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
  });

  test('clears validation errors when user starts typing', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CheckoutForm onBack={mockOnBack} onProceedToPayment={mockOnProceedToPayment} />
      </TestWrapper>
    );

    // Submit empty form to show errors
    const submitButton = screen.getByText('Proceed to Payment');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    // Start typing in name field
    const nameInput = screen.getByLabelText(/full name/i);
    await user.type(nameInput, 'J');

    // Error should be cleared
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
  });

  test('shows shipping options after country and state are selected', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CheckoutForm onBack={mockOnBack} onProceedToPayment={mockOnProceedToPayment} />
      </TestWrapper>
    );

    // Select country and state
    const countrySelect = screen.getByLabelText(/country/i);
    const stateSelect = screen.getByLabelText(/state/i);
    
    await user.selectOptions(countrySelect, 'US');
    await user.selectOptions(stateSelect, 'CA');

    // Wait for shipping options to appear
    await waitFor(() => {
      expect(screen.getByText('Shipping Options')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('displays order summary with cart items', () => {
    // Create a test component that adds items to cart
    const TestComponentWithItems = () => {
      const { addToCart } = useCart();
      
      React.useEffect(() => {
        addToCart(mockPainting);
      }, [addToCart]);

      return <CheckoutForm onBack={mockOnBack} onProceedToPayment={mockOnProceedToPayment} />;
    };

    render(
      <TestWrapper>
        <TestComponentWithItems />
      </TestWrapper>
    );

    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Test Painting')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <CheckoutForm onBack={mockOnBack} onProceedToPayment={mockOnProceedToPayment} />
      </TestWrapper>
    );

    // Fill out all required fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.type(screen.getByLabelText(/street address/i), '123 Main St');
    await user.type(screen.getByLabelText(/city/i), 'Anytown');
    await user.type(screen.getByLabelText(/zip/i), '12345');
    
    await user.selectOptions(screen.getByLabelText(/country/i), 'US');
    await user.selectOptions(screen.getByLabelText(/state/i), 'CA');

    // Wait for shipping options and select one
    await waitFor(() => {
      expect(screen.getByText('Shipping Options')).toBeInTheDocument();
    }, { timeout: 1000 });

    // Submit form
    const submitButton = screen.getByText('Proceed to Payment');
    await user.click(submitButton);

    // Should call onProceedToPayment with form data
    await waitFor(() => {
      expect(mockOnProceedToPayment).toHaveBeenCalledTimes(1);
    });
  });
});