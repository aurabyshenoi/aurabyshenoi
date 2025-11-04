import { CheckoutFormData, FormErrors } from '../types/checkout';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

export const validateZipCode = (zipCode: string, country: string): boolean => {
  if (country === 'US') {
    const usZipRegex = /^\d{5}(-\d{4})?$/;
    return usZipRegex.test(zipCode);
  }
  // For other countries, just check it's not empty
  return zipCode.trim().length > 0;
};

export const validateCheckoutForm = (formData: CheckoutFormData): FormErrors => {
  const errors: FormErrors = {};
  
  // Customer validation
  if (!formData.customer.name.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!formData.customer.email.trim()) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.customer.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (formData.customer.phone && !validatePhone(formData.customer.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  // Shipping validation
  if (!formData.shipping.address.trim()) {
    errors.address = 'Address is required';
  }
  
  if (!formData.shipping.city.trim()) {
    errors.city = 'City is required';
  }
  
  if (!formData.shipping.state.trim()) {
    errors.state = 'State/Province is required';
  }
  
  if (!formData.shipping.zipCode.trim()) {
    errors.zipCode = 'ZIP/Postal code is required';
  } else if (!validateZipCode(formData.shipping.zipCode, formData.shipping.country)) {
    errors.zipCode = 'Please enter a valid ZIP/Postal code';
  }
  
  if (!formData.shipping.country.trim()) {
    errors.country = 'Country is required';
  }
  
  return errors;
};