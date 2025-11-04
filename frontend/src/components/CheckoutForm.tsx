import React, { useState, useEffect } from 'react';
import { ArrowLeft, Truck, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { CheckoutFormData, ShippingOption, FormErrors } from '../types/checkout';
import { validateCheckoutForm } from '../utils/validation';
import { calculateShippingCost, getCountries, getUSStates } from '../utils/shipping';

interface CheckoutFormProps {
  onBack: () => void;
  onProceedToPayment: (formData: CheckoutFormData, shippingOption: ShippingOption) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack, onProceedToPayment }) => {
  const { cart } = useCart();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    customer: {
      name: '',
      email: '',
      phone: '',
    },
    shipping: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  
  const countries = getCountries();
  const usStates = getUSStates();
  
  // Calculate shipping when country/state changes
  useEffect(() => {
    if (formData.shipping.country && formData.shipping.state) {
      setIsCalculatingShipping(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const options = calculateShippingCost(
          formData.shipping.country,
          formData.shipping.state,
          cart.totalPrice
        );
        setShippingOptions(options);
        setSelectedShipping(options[0]?.id || '');
        setIsCalculatingShipping(false);
      }, 500);
    }
  }, [formData.shipping.country, formData.shipping.state, cart.totalPrice]);
  
  const handleInputChange = (field: string, value: string) => {
    const keys = field.split('.');
    if (keys.length === 2) {
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0] as keyof CheckoutFormData],
          [keys[1]]: value,
        },
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateCheckoutForm(formData);
    
    if (!selectedShipping) {
      validationErrors.shipping = 'Please select a shipping option';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
    if (selectedShippingOption) {
      onProceedToPayment(formData, selectedShippingOption);
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
  const totalWithShipping = cart.totalPrice + (selectedShippingOption?.price || 0);
  
  return (
    <div className="min-h-screen bg-off-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-text-light hover:text-brown transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Cart</span>
          </button>
          
          <h1 className="text-3xl font-serif text-brown">Checkout</h1>
          <p className="text-text-light mt-2">Complete your order information</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Information */}
              <div className="bg-cream rounded-lg p-6">
                <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center space-x-2">
                  <span>Customer Information</span>
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.customer.name}
                      onChange={(e) => handleInputChange('customer.name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green ${
                        errors.name ? 'border-red-300' : 'border-warm-gray'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.customer.email}
                      onChange={(e) => handleInputChange('customer.email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green ${
                        errors.email ? 'border-red-300' : 'border-warm-gray'
                      }`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-text-dark mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.customer.phone}
                      onChange={(e) => handleInputChange('customer.phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green ${
                        errors.phone ? 'border-red-300' : 'border-warm-gray'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>
              
              {/* Shipping Information */}
              <div className="bg-cream rounded-lg p-6">
                <h2 className="text-xl font-semibold text-text-dark mb-4 flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Shipping Address</span>
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-text-dark mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.shipping.address}
                      onChange={(e) => handleInputChange('shipping.address', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green ${
                        errors.address ? 'border-red-300' : 'border-warm-gray'
                      }`}
                      placeholder="Enter your street address"
                    />
                    {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-text-dark mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={formData.shipping.city}
                        onChange={(e) => handleInputChange('shipping.city', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green ${
                          errors.city ? 'border-red-300' : 'border-warm-gray'
                        }`}
                        placeholder="Enter city"
                      />
                      {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="zipCode" className="block text-sm font-medium text-text-dark mb-1">
                        ZIP/Postal Code *
                      </label>
                      <input
                        type="text"
                        id="zipCode"
                        value={formData.shipping.zipCode}
                        onChange={(e) => handleInputChange('shipping.zipCode', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green ${
                          errors.zipCode ? 'border-red-300' : 'border-warm-gray'
                        }`}
                        placeholder="Enter ZIP/Postal code"
                      />
                      {errors.zipCode && <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-text-dark mb-1">
                        Country *
                      </label>
                      <select
                        id="country"
                        value={formData.shipping.country}
                        onChange={(e) => handleInputChange('shipping.country', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green ${
                          errors.country ? 'border-red-300' : 'border-warm-gray'
                        }`}
                      >
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      {errors.country && <p className="text-red-600 text-sm mt-1">{errors.country}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-text-dark mb-1">
                        State/Province *
                      </label>
                      {formData.shipping.country === 'US' ? (
                        <select
                          id="state"
                          value={formData.shipping.state}
                          onChange={(e) => handleInputChange('shipping.state', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green ${
                            errors.state ? 'border-red-300' : 'border-warm-gray'
                          }`}
                        >
                          <option value="">Select State</option>
                          {usStates.map((state) => (
                            <option key={state.code} value={state.code}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          id="state"
                          value={formData.shipping.state}
                          onChange={(e) => handleInputChange('shipping.state', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sage-green ${
                            errors.state ? 'border-red-300' : 'border-warm-gray'
                          }`}
                          placeholder="Enter state/province"
                        />
                      )}
                      {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Shipping Options */}
              {shippingOptions.length > 0 && (
                <div className="bg-cream rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-text-dark mb-4">Shipping Options</h2>
                  
                  {isCalculatingShipping ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-green mx-auto"></div>
                      <p className="text-text-light mt-2">Calculating shipping costs...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {shippingOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                            selectedShipping === option.id
                              ? 'border-sage-green bg-sage-green bg-opacity-10'
                              : 'border-warm-gray hover:border-sage-green-light'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="shipping"
                              value={option.id}
                              checked={selectedShipping === option.id}
                              onChange={(e) => setSelectedShipping(e.target.value)}
                              className="text-sage-green focus:ring-sage-green"
                            />
                            <div>
                              <div className="font-medium text-text-dark">{option.name}</div>
                              <div className="text-sm text-text-light">{option.description}</div>
                              <div className="text-sm text-text-light">{option.estimatedDays}</div>
                            </div>
                          </div>
                          <div className="font-semibold text-brown">
                            {option.price === 0 ? 'Free' : formatPrice(option.price)}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {errors.shipping && <p className="text-red-600 text-sm mt-2">{errors.shipping}</p>}
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isCalculatingShipping || shippingOptions.length === 0}
                className="w-full bg-brown text-cream py-3 px-4 rounded-md font-medium hover:bg-brown-dark transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 focus:ring-offset-off-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>Proceed to Payment</span>
              </button>
            </form>
          </div>
          
          {/* Order Summary */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-cream rounded-lg p-6">
              <h2 className="text-xl font-semibold text-text-dark mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.painting._id} className="flex items-start space-x-3">
                    <img
                      src={item.painting.images.thumbnail}
                      alt={item.painting.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-dark truncate">{item.painting.title}</h4>
                      <p className="text-sm text-text-light">{item.painting.medium}</p>
                      <p className="font-semibold text-brown">{formatPrice(item.painting.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-warm-gray mt-6 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-dark">Subtotal</span>
                  <span className="font-semibold">{formatPrice(cart.totalPrice)}</span>
                </div>
                
                {selectedShippingOption && (
                  <div className="flex justify-between">
                    <span className="text-text-dark">Shipping</span>
                    <span className="font-semibold">
                      {selectedShippingOption.price === 0 ? 'Free' : formatPrice(selectedShippingOption.price)}
                    </span>
                  </div>
                )}
                
                <div className="border-t border-warm-gray pt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-text-dark">Total</span>
                    <span className="font-semibold text-brown">{formatPrice(totalWithShipping)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;