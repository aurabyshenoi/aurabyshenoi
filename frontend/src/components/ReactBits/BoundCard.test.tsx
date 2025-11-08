/**
 * Test file for BoundCard component
 * Verifies React Bits equivalent functionality
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BoundCard from './BoundCard';

describe('BoundCard Component', () => {
  it('renders children correctly', () => {
    render(
      <BoundCard>
        <div>Test Content</div>
      </BoundCard>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    const { container } = render(
      <BoundCard variant="elevated">
        <div>Test Content</div>
      </BoundCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('shadow-md');
  });

  it('applies interactive cursor when interactive prop is true', () => {
    const { container } = render(
      <BoundCard interactive>
        <div>Test Content</div>
      </BoundCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('applies custom className', () => {
    const { container } = render(
      <BoundCard className="custom-class">
        <div>Test Content</div>
      </BoundCard>
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });
});