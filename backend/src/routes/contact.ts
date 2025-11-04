import express, { Request, Response } from 'express';
import { Contact } from '../models';

const router = express.Router();

// Interface for contact form submission
interface ContactFormRequest {
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  query: string;
}

// POST /api/contact - Submit contact form
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customer, query }: ContactFormRequest = req.body;

    // Validate required fields
    if (!customer || !customer.fullName || !customer.email || !customer.phone || !customer.address) {
      return res.status(400).json({
        success: false,
        message: 'All customer fields (full name, email, phone, address) are required'
      });
    }

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query message is required'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(customer.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Validate field lengths
    if (customer.fullName.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Full name cannot exceed 100 characters'
      });
    }

    if (customer.phone.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Phone number cannot exceed 20 characters'
      });
    }

    if (customer.address.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Address cannot exceed 500 characters'
      });
    }

    if (query.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Query cannot exceed 2000 characters'
      });
    }

    // Create contact record in database
    const contact = new Contact({
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim()
      },
      query: query.trim(),
      status: 'new'
    });

    await contact.save();

    console.log(`Contact form submitted successfully for contact ${contact.contactNumber}`);

    res.status(201).json({
      success: true,
      data: {
        contact: {
          contactNumber: contact.contactNumber,
          _id: contact._id,
          customer: contact.customer,
          query: contact.query,
          status: contact.status,
          createdAt: contact.createdAt
        }
      },
      message: 'Contact form submitted successfully. We will reach out to you soon!'
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;