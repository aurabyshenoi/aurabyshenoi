/**
 * Demo component to verify React Bits equivalent setup
 * This can be removed after verification
 */

import React from 'react';
import { BoundCard } from './index';

const ReactBitsDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">React Bits Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BoundCard 
          variant="flat" 
          interactive
          className="p-4 rounded-lg"
        >
          <h3 className="font-semibold">Flat Card</h3>
          <p className="text-sm text-gray-600">This is a flat variant card</p>
        </BoundCard>

        <BoundCard 
          variant="elevated" 
          interactive
          className="p-4 rounded-lg"
          bound={{ strength: 0.6, damping: 0.5 }}
        >
          <h3 className="font-semibold">Elevated Card</h3>
          <p className="text-sm text-gray-600">This is an elevated variant card with stronger bound effect</p>
        </BoundCard>

        <BoundCard 
          variant="outlined" 
          interactive
          className="p-4 rounded-lg"
          hover={{ scale: 1.1 }}
        >
          <h3 className="font-semibold">Outlined Card</h3>
          <p className="text-sm text-gray-600">This is an outlined variant card with custom hover scale</p>
        </BoundCard>
      </div>
    </div>
  );
};

export default ReactBitsDemo;