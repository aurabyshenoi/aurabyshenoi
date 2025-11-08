/**
 * BoundCard Component - React Bits equivalent using Framer Motion
 * Provides bound animations and hover effects for card components
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BoundCardProps } from '../../types/react-bits';

const BoundCard: React.FC<BoundCardProps> = ({
  variant = 'elevated',
  interactive = false,
  bound = { strength: 0.4, damping: 0.7, stiffness: 300 },
  hover = { scale: 1.05, elevation: 8, transition: '0.3s ease' },
  children,
  className = '',
  onClick,
  ...props
}) => {
  // Default bound animation variants
  const boundVariants = {
    initial: {
      scale: 1,
      rotateX: 0,
      rotateY: 0,
    },
    hover: {
      scale: hover.scale || 1.05,
      transition: {
        type: 'spring' as const,
        stiffness: bound.stiffness || 300,
        damping: bound.damping * 100 || 70,
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        type: 'spring' as const,
        stiffness: bound.stiffness || 300,
        damping: bound.damping * 100 || 70,
      }
    }
  };

  // Get variant-specific styles
  const getVariantStyles = (variant: string) => {
    const baseStyles = 'transition-all duration-300';
    
    switch (variant) {
      case 'flat':
        return `${baseStyles} bg-white border border-gray-200`;
      case 'elevated':
        return `${baseStyles} bg-white shadow-md hover:shadow-lg`;
      case 'outlined':
        return `${baseStyles} bg-transparent border-2 border-gray-300 hover:border-gray-400`;
      default:
        return `${baseStyles} bg-white shadow-md hover:shadow-lg`;
    }
  };

  const cardClasses = `
    ${getVariantStyles(variant)}
    ${interactive ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <motion.div
      className={cardClasses}
      variants={boundVariants}
      initial="initial"
      whileHover={interactive ? "hover" : undefined}
      whileTap={interactive ? "tap" : undefined}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default BoundCard;