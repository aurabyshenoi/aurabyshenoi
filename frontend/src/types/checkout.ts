export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CheckoutFormData {
  customer: CustomerInfo;
  shipping: ShippingAddress;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export interface FormErrors {
  [key: string]: string;
}