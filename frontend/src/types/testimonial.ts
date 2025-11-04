export interface Testimonial {
  _id: string;
  customerName: string;
  customerPhoto: string;
  testimonialText: string;
  rating?: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialFormData {
  customerName: string;
  customerPhoto: string;
  testimonialText: string;
  rating?: number;
  isActive: boolean;
  displayOrder: number;
}