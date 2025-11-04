import { ShippingOption } from '../types/checkout';

export const calculateShippingCost = (country: string, _state: string, totalValue: number): ShippingOption[] => {
  const baseOptions: ShippingOption[] = [];
  
  if (country === 'US') {
    // Domestic US shipping
    baseOptions.push({
      id: 'standard',
      name: 'Standard Shipping',
      description: 'USPS Ground',
      price: totalValue > 500 ? 0 : 25, // Free shipping over $500
      estimatedDays: '5-7 business days'
    });
    
    baseOptions.push({
      id: 'expedited',
      name: 'Expedited Shipping',
      description: 'USPS Priority Mail',
      price: 45,
      estimatedDays: '2-3 business days'
    });
    
    baseOptions.push({
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'FedEx Overnight',
      price: 85,
      estimatedDays: '1 business day'
    });
  } else if (country === 'CA') {
    // Canada shipping
    baseOptions.push({
      id: 'international-standard',
      name: 'International Standard',
      description: 'USPS International',
      price: 65,
      estimatedDays: '7-14 business days'
    });
    
    baseOptions.push({
      id: 'international-expedited',
      name: 'International Expedited',
      description: 'FedEx International',
      price: 125,
      estimatedDays: '3-5 business days'
    });
  } else {
    // International shipping
    baseOptions.push({
      id: 'international-standard',
      name: 'International Standard',
      description: 'USPS International',
      price: 85,
      estimatedDays: '10-21 business days'
    });
    
    baseOptions.push({
      id: 'international-expedited',
      name: 'International Expedited',
      description: 'FedEx International',
      price: 165,
      estimatedDays: '5-7 business days'
    });
  }
  
  return baseOptions;
};

export const getCountries = (): { code: string; name: string }[] => {
  return [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'JP', name: 'Japan' },
    // Add more countries as needed
  ];
};

export const getUSStates = (): { code: string; name: string }[] => {
  return [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
  ];
};