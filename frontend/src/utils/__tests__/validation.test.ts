import { validateEmail, validatePhone, validateZipCode, validateCheckoutForm } from '../validation';
import { CheckoutFormData } from '../../types/checkout';

describe('validateEmail', () => {
  test('validates correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('test+tag@example.org')).toBe(true);
  });

  test('rejects invalid email addresses', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test.example.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});

describe('validatePhone', () => {
  test('validates correct phone numbers', () => {
    expect(validatePhone('1234567890')).toBe(true);
    expect(validatePhone('+1234567890')).toBe(true);
    expect(validatePhone('123-456-7890')).toBe(true);
    expect(validatePhone('(123) 456-7890')).toBe(true);
    expect(validatePhone('123 456 7890')).toBe(true);
  });

  test('allows empty phone (optional field)', () => {
    expect(validatePhone('')).toBe(true);
  });

  test('rejects invalid phone numbers', () => {
    expect(validatePhone('abc123')).toBe(false);
    expect(validatePhone('0123456789')).toBe(false); // starts with 0
    expect(validatePhone('+0123456789')).toBe(false); // starts with 0 after +
  });
});

describe('validateZipCode', () => {
  test('validates US zip codes', () => {
    expect(validateZipCode('12345', 'US')).toBe(true);
    expect(validateZipCode('12345-6789', 'US')).toBe(true);
  });

  test('rejects invalid US zip codes', () => {
    expect(validateZipCode('1234', 'US')).toBe(false);
    expect(validateZipCode('123456', 'US')).toBe(false);
    expect(validateZipCode('12345-67890', 'US')).toBe(false);
    expect(validateZipCode('abcde', 'US')).toBe(false);
  });

  test('validates non-US postal codes', () => {
    expect(validateZipCode('K1A 0A6', 'CA')).toBe(true); // Canada
    expect(validateZipCode('SW1A 1AA', 'GB')).toBe(true); // UK
    expect(validateZipCode('10115', 'DE')).toBe(true); // Germany
  });

  test('rejects empty postal codes for non-US countries', () => {
    expect(validateZipCode('', 'CA')).toBe(false);
    expect(validateZipCode('   ', 'GB')).toBe(false);
  });
});

describe('validateCheckoutForm', () => {
  const validFormData: CheckoutFormData = {
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890'
    },
    shipping: {
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'US'
    }
  };

  test('validates complete form data', () => {
    const errors = validateCheckoutForm(validFormData);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test('validates form with optional phone field empty', () => {
    const formData = {
      ...validFormData,
      customer: {
        ...validFormData.customer,
        phone: ''
      }
    };
    const errors = validateCheckoutForm(formData);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test('requires customer name', () => {
    const formData = {
      ...validFormData,
      customer: {
        ...validFormData.customer,
        name: ''
      }
    };
    const errors = validateCheckoutForm(formData);
    expect(errors.name).toBe('Name is required');
  });

  test('requires customer email', () => {
    const formData = {
      ...validFormData,
      customer: {
        ...validFormData.customer,
        email: ''
      }
    };
    const errors = validateCheckoutForm(formData);
    expect(errors.email).toBe('Email is required');
  });

  test('validates customer email format', () => {
    const formData = {
      ...validFormData,
      customer: {
        ...validFormData.customer,
        email: 'invalid-email'
      }
    };
    const errors = validateCheckoutForm(formData);
    expect(errors.email).toBe('Please enter a valid email address');
  });

  test('validates customer phone format when provided', () => {
    const formData = {
      ...validFormData,
      customer: {
        ...validFormData.customer,
        phone: 'invalid-phone'
      }
    };
    const errors = validateCheckoutForm(formData);
    expect(errors.phone).toBe('Please enter a valid phone number');
  });

  test('requires shipping address', () => {
    const formData = {
      ...validFormData,
      shipping: {
        ...validFormData.shipping,
        address: ''
      }
    };
    const errors = validateCheckoutForm(formData);
    expect(errors.address).toBe('Address is required');
  });

  test('requires shipping city', () => {
    const formData = {
      ...validFormData,
      shipping: {
        ...validFormData.shipping,
        city: ''
      }
    };
    const errors = validateCheckoutForm(formData);
    expect(errors.city).toBe('City is required');
  });

  test('requires shipping state', () => {
    const formData = {
      ...validFormData,
      shipping: {
        ...validFormData.shipping,
        state: ''
      }
    };
    const errors = validateCheckoutForm(formData);
    expect(errors.state).toBe('State/Province is required');
  });

  test('requires shipping zip code', () => {
    const formData = {
      ...validFormData,
      shipping: {
        ...validFormData.shipping,
        zipCode: ''
      }
    };
    const errors = validateCheckoutForm(formData);
    expect(errors.zipCode).toBe('ZIP/Postal code is required');
  });

  test('validates shipping zip code format', () => {
    const formData = {
      ...validFormData,
      shipping: {
        ...validFormData.shipping,
        zipCode: 'invalid'
      }
    };
    const errors = validateCheckoutForm(formData);
    expect(errors.zipCode).toBe('Please enter a valid ZIP/Postal code');
  });

  test('requires shipping country', () => {
    const formData = {
      ...validFormData,
      shipping: {
        ...validFormData.shipping,
        country: ''
      }
    };
    const errors = validateCheckoutForm(formData);
    expect(errors.country).toBe('Country is required');
  });

  test('handles multiple validation errors', () => {
    const formData: CheckoutFormData = {
      customer: {
        name: '',
        email: 'invalid-email',
        phone: 'invalid-phone'
      },
      shipping: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    };
    
    const errors = validateCheckoutForm(formData);
    
    expect(errors.name).toBe('Name is required');
    expect(errors.email).toBe('Please enter a valid email address');
    expect(errors.phone).toBe('Please enter a valid phone number');
    expect(errors.address).toBe('Address is required');
    expect(errors.city).toBe('City is required');
    expect(errors.state).toBe('State/Province is required');
    expect(errors.zipCode).toBe('ZIP/Postal code is required');
    expect(errors.country).toBe('Country is required');
  });
});