import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaintingModal from '../PaintingModal';
import { CartProvider } from '../../contexts/CartContext';
import { Painting } from '../../types/painting';

// Mock OptimizedImage component
vi.mock('../OptimizedImage', () => ({
  OptimizedImage: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} data-testid="optimized-image" />
  ),
  useResponsiveImageUrls: (src: string) => ({
    small: `${src}?w=400`,
    medium: `${src}?w=800`,
    large: `${src}?w=1200`,
    xlarge: `${src}?w=1600`
  })
}));

// Mock AddToCartButton component
vi.mock('../AddToCartButton', () => ({
  default: ({ painting, variant, size, className }: any) => (
    <button 
      data-testid="add-to-cart-button"
      className={className}
    >
      Add to Cart - {painting.title}
    </button>
  )
}));

const mockPainting: Painting = {
  _id: '1',
  title: 'Test Painting',
  description: 'A beautiful test painting with detailed description',
  dimensions: { width: 24, height: 36, unit: 'inches' },
  medium: 'Oil on canvas',
  price: 500,
  category: 'landscape',
  images: {
    thumbnail: 'test-thumb.jpg',
    fullSize: ['test-full-1.jpg', 'test-full-2.jpg']
  },
  isAvailable: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const mockPaintingSold: Painting = {
  ...mockPainting,
  _id: '2',
  title: 'Sold Painting',
  isAvailable: false
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <CartProvider>{children}</CartProvider>;
};

describe('PaintingModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    // Reset body overflow style
    document.body.style.overflow = 'unset';
  });

  test('does not render when isOpen is false', () => {
    render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.queryByText('Test Painting')).not.toBeInTheDocument();
  });

  test('does not render when painting is null', () => {
    render(
      <TestWrapper>
        <PaintingModal painting={null} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('renders painting details when open', () => {
    render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Painting')).toBeInTheDocument();
    expect(screen.getByText('Oil on canvas')).toBeInTheDocument();
    expect(screen.getByText('A beautiful test painting with detailed description')).toBeInTheDocument();
    expect(screen.getByText('24" × 36" inches')).toBeInTheDocument();
    expect(screen.getByText('landscape')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
  });

  test('renders optimized image with correct props', () => {
    render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const image = screen.getByTestId('optimized-image');
    expect(image).toHaveAttribute('src', 'test-thumb.jpg?w=1600');
    expect(image).toHaveAttribute('alt', 'Test Painting');
  });

  test('shows sold status for unavailable paintings', () => {
    render(
      <TestWrapper>
        <PaintingModal painting={mockPaintingSold} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('Sold')).toBeInTheDocument();
  });

  test('renders add to cart button', () => {
    render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByTestId('add-to-cart-button')).toBeInTheDocument();
    expect(screen.getByText('Add to Cart - Test Painting')).toBeInTheDocument();
  });

  test('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const closeButton = document.querySelector('.absolute.top-4.right-4');
    expect(closeButton).toBeInTheDocument();
    
    if (closeButton) {
      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  test('closes modal when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Find the backdrop (the fixed overlay)
    const backdrop = document.querySelector('.absolute.inset-0.bg-black.bg-opacity-75');
    expect(backdrop).toBeTruthy();
    
    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  test('closes modal when Escape key is pressed', () => {
    render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('prevents body scroll when modal is open', () => {
    render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  test('restores body scroll when modal is closed', () => {
    const { rerender } = render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(document.body.style.overflow).toBe('unset');
  });

  test('shows image navigation when multiple images exist', () => {
    render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Should show navigation buttons for multiple images
    const prevButton = document.querySelector('.absolute.left-4');
    const nextButton = document.querySelector('.absolute.right-4.top-1\\/2');
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
    
    // Check for image indicators (dots)
    const indicators = document.querySelectorAll('.w-2.h-2.rounded-full');
    expect(indicators).toHaveLength(3); // thumbnail + 2 fullSize images
  });

  test('navigates between images', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Initially shows first image (thumbnail)
    let image = screen.getByTestId('optimized-image');
    expect(image).toHaveAttribute('src', 'test-thumb.jpg?w=1600');

    // Click next button (find the right navigation button, not the close button)
    const nextButton = document.querySelector('.absolute.right-4.top-1\\/2');
    if (nextButton) {
      await user.click(nextButton);
      
      // Should now show first full-size image
      image = screen.getByTestId('optimized-image');
      expect(image).toHaveAttribute('src', 'test-full-1.jpg?w=1600');
    }
  });

  test('navigates to specific image when indicator is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Click on the third indicator (index 2)
    const indicators = document.querySelectorAll('.w-2.h-2.rounded-full');
    if (indicators[2]) {
      await user.click(indicators[2]);
      
      // Should show the third image (second full-size image)
      const image = screen.getByTestId('optimized-image');
      expect(image).toHaveAttribute('src', 'test-full-2.jpg?w=1600');
    }
  });

  test('resets image index when painting changes', () => {
    const { rerender } = render(
      <TestWrapper>
        <PaintingModal painting={mockPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Navigate to second image
    const nextButton = document.querySelector('.absolute.right-4');
    if (nextButton) {
      fireEvent.click(nextButton);
    }

    // Change painting
    const newPainting = { ...mockPainting, _id: '3', title: 'New Painting' };
    rerender(
      <TestWrapper>
        <PaintingModal painting={newPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Should reset to first image
    const image = screen.getByTestId('optimized-image');
    expect(image).toHaveAttribute('src', 'test-thumb.jpg?w=1600');
  });

  test('handles painting with single image (no navigation)', () => {
    const singleImagePainting = {
      ...mockPainting,
      images: {
        thumbnail: 'single-thumb.jpg',
        fullSize: []
      }
    };

    render(
      <TestWrapper>
        <PaintingModal painting={singleImagePainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Should not show navigation buttons or indicators (only close button should exist)
    expect(document.querySelector('.absolute.left-4.top-1\\/2')).not.toBeInTheDocument();
    expect(document.querySelector('.absolute.right-4.top-1\\/2')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.w-2.h-2.rounded-full')).toHaveLength(0);
    
    // Close button should still exist
    expect(document.querySelector('.absolute.top-4.right-4')).toBeInTheDocument();
  });

  test('formats price correctly', () => {
    const expensivePainting = { ...mockPainting, price: 1234.56 };
    
    render(
      <TestWrapper>
        <PaintingModal painting={expensivePainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });

  test('formats dimensions correctly for different units', () => {
    const cmPainting = {
      ...mockPainting,
      dimensions: { width: 60, height: 90, unit: 'cm' as const }
    };
    
    render(
      <TestWrapper>
        <PaintingModal painting={cmPainting} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByText('60" × 90" cm')).toBeInTheDocument();
  });
});