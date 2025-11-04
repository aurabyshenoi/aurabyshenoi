import express, { Request, Response } from 'express';
import multer from 'multer';
import { Painting, Order, Testimonial, Contact } from '../models';
import { authenticateAdmin } from '../middleware/auth';
import { uploadImageToCloudinary, deleteImageFromCloudinary, generateOptimizedImageUrl } from '../config/cloudinary';

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// ===== PAINTING MANAGEMENT ROUTES =====

// GET /api/admin/paintings - Get all paintings (including unavailable)
router.get('/paintings', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      availability,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter: any = {};
    if (category) {
      filter.category = { $regex: new RegExp(category as string, 'i') };
    }
    if (availability !== undefined) {
      filter.isAvailable = availability === 'true';
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    const validSortFields = ['createdAt', 'updatedAt', 'price', 'title'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
    sortOptions[sortField as string] = sortOrder === 'asc' ? 1 : -1;

    const [paintings, totalCount] = await Promise.all([
      Painting.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Painting.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        paintings,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin paintings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch paintings',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/admin/paintings - Create new painting
router.post('/paintings', async (req: Request, res: Response) => {
  try {
    const paintingData = req.body;

    // Validate required fields
    const requiredFields = ['title', 'description', 'dimensions', 'medium', 'price', 'category', 'images'];
    const missingFields = requiredFields.filter(field => !paintingData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const painting = new Painting(paintingData);
    await painting.save();

    res.status(201).json({
      success: true,
      data: { painting },
      message: 'Painting created successfully'
    });

  } catch (error: any) {
    console.error('Error creating painting:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create painting',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// PUT /api/admin/paintings/:id - Update painting
router.put('/paintings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid painting ID format'
      });
    }

    const painting = await Painting.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!painting) {
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    res.json({
      success: true,
      data: { painting },
      message: 'Painting updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating painting:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update painting',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// DELETE /api/admin/paintings/:id - Delete painting
router.delete('/paintings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid painting ID format'
      });
    }

    const painting = await Painting.findByIdAndDelete(id);

    if (!painting) {
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    res.json({
      success: true,
      message: 'Painting deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting painting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete painting',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// ===== IMAGE UPLOAD ROUTES =====

// POST /api/admin/images/upload - Upload images to Cloudinary
router.post('/images/upload', upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const uploadPromises = files.map(async (file) => {
      try {
        const result = await uploadImageToCloudinary(file.buffer, 'paintings');
        
        return {
          originalName: file.originalname,
          url: result.secureUrl,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          // Generate optimized URLs for different sizes
          thumbnailUrl: generateOptimizedImageUrl(result.publicId, { width: 400, height: 400 }),
          mediumUrl: generateOptimizedImageUrl(result.publicId, { width: 800, height: 800 }),
          largeUrl: generateOptimizedImageUrl(result.publicId, { width: 1200, height: 1200 }),
        };
      } catch (error) {
        console.error(`Error uploading ${file.originalname}:`, error);
        throw new Error(`Failed to upload ${file.originalname}`);
      }
    });

    const uploadResults = await Promise.all(uploadPromises);

    res.json({
      success: true,
      data: { images: uploadResults },
      message: `Successfully uploaded ${uploadResults.length} image(s)`
    });

  } catch (error: any) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload images',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// DELETE /api/admin/images/:publicId - Delete image from Cloudinary
router.delete('/images/:publicId', async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    
    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    await deleteImageFromCloudinary(decodedPublicId);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/admin/images/optimize - Generate optimized URLs for existing images
router.post('/images/optimize', async (req: Request, res: Response) => {
  try {
    const { publicIds, options = {} } = req.body;
    
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Public IDs array is required'
      });
    }

    const optimizedUrls = publicIds.map(publicId => ({
      publicId,
      thumbnailUrl: generateOptimizedImageUrl(publicId, { width: 400, height: 400, ...options }),
      mediumUrl: generateOptimizedImageUrl(publicId, { width: 800, height: 800, ...options }),
      largeUrl: generateOptimizedImageUrl(publicId, { width: 1200, height: 1200, ...options }),
      originalUrl: generateOptimizedImageUrl(publicId, options),
    }));

    res.json({
      success: true,
      data: { optimizedUrls }
    });

  } catch (error: any) {
    console.error('Error generating optimized URLs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate optimized URLs',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// ===== ORDER MANAGEMENT ROUTES =====

// GET /api/admin/orders - Get all orders
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (paymentStatus) {
      filter['payment.status'] = paymentStatus;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    const validSortFields = ['createdAt', 'updatedAt', 'orderNumber', 'payment.amount'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
    sortOptions[sortField as string] = sortOrder === 'asc' ? 1 : -1;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('items.paintingId', 'title images')
        .lean(),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/admin/orders/:id - Get specific order
router.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    const order = await Order.findById(id).populate('items.paintingId', 'title images dimensions medium');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// PUT /api/admin/orders/:id/status - Update order status
router.put('/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order },
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/admin/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', async (req: Request, res: Response) => {
  try {
    const [
      totalPaintings,
      availablePaintings,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue
    ] = await Promise.all([
      Painting.countDocuments(),
      Painting.countDocuments({ isAvailable: true }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([
        { $match: { 'payment.status': 'completed' } },
        { $group: { _id: null, total: { $sum: '$payment.amount' } } }
      ])
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.paintingId', 'title')
      .lean();

    res.json({
      success: true,
      data: {
        stats: {
          paintings: {
            total: totalPaintings,
            available: availablePaintings,
            sold: totalPaintings - availablePaintings
          },
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            completed: completedOrders
          },
          revenue: {
            total: totalRevenue[0]?.total || 0
          }
        },
        recentOrders
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// ===== TESTIMONIAL MANAGEMENT ROUTES =====

// GET /api/admin/testimonials - Get all testimonials
router.get('/testimonials', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      isActive,
      sortBy = 'displayOrder',
      sortOrder = 'asc'
    } = req.query;

    // Build filter
    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    const validSortFields = ['displayOrder', 'createdAt', 'updatedAt', 'customerName'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'displayOrder';
    sortOptions[sortField as string] = sortOrder === 'asc' ? 1 : -1;

    const [testimonials, totalCount] = await Promise.all([
      Testimonial.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Testimonial.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        testimonials,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// POST /api/admin/testimonials - Create new testimonial
router.post('/testimonials', async (req: Request, res: Response) => {
  try {
    const testimonialData = req.body;

    // Validate required fields
    const requiredFields = ['customerName', 'customerPhoto', 'testimonialText', 'displayOrder'];
    const missingFields = requiredFields.filter(field => !testimonialData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if display order already exists for active testimonials
    if (testimonialData.isActive !== false) {
      const existingTestimonial = await Testimonial.findOne({
        displayOrder: testimonialData.displayOrder,
        isActive: true
      });

      if (existingTestimonial) {
        return res.status(400).json({
          success: false,
          message: 'Display order already exists for an active testimonial'
        });
      }
    }

    const testimonial = new Testimonial(testimonialData);
    await testimonial.save();

    res.status(201).json({
      success: true,
      data: { testimonial },
      message: 'Testimonial created successfully'
    });

  } catch (error: any) {
    console.error('Error creating testimonial:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Display order already exists for an active testimonial'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// PUT /api/admin/testimonials/:id - Update testimonial
router.put('/testimonials/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid testimonial ID format'
      });
    }

    // Check if display order already exists for active testimonials (excluding current testimonial)
    if (updateData.displayOrder !== undefined && updateData.isActive !== false) {
      const existingTestimonial = await Testimonial.findOne({
        _id: { $ne: id },
        displayOrder: updateData.displayOrder,
        isActive: true
      });

      if (existingTestimonial) {
        return res.status(400).json({
          success: false,
          message: 'Display order already exists for another active testimonial'
        });
      }
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      data: { testimonial },
      message: 'Testimonial updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating testimonial:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Display order already exists for another active testimonial'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// DELETE /api/admin/testimonials/:id - Delete testimonial
router.delete('/testimonials/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid testimonial ID format'
      });
    }

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// PUT /api/admin/testimonials/:id/toggle-active - Toggle testimonial active status
router.put('/testimonials/:id/toggle-active', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid testimonial ID format'
      });
    }

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    // If activating, check for display order conflicts
    if (!testimonial.isActive) {
      const existingTestimonial = await Testimonial.findOne({
        _id: { $ne: id },
        displayOrder: testimonial.displayOrder,
        isActive: true
      });

      if (existingTestimonial) {
        return res.status(400).json({
          success: false,
          message: 'Cannot activate: Display order conflicts with another active testimonial'
        });
      }
    }

    testimonial.isActive = !testimonial.isActive;
    await testimonial.save();

    res.json({
      success: true,
      data: { testimonial },
      message: `Testimonial ${testimonial.isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Error toggling testimonial status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle testimonial status',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// ===== CONTACT MANAGEMENT ROUTES =====

// GET /api/admin/contacts - Get all contact form submissions
router.get('/contacts', async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions: any = {};
    const validSortFields = ['createdAt', 'updatedAt', 'contactNumber', 'customer.fullName'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
    sortOptions[sortField as string] = sortOrder === 'asc' ? 1 : -1;

    const [contacts, totalCount] = await Promise.all([
      Contact.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Contact.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// GET /api/admin/contacts/:id - Get specific contact
router.get('/contacts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID format'
      });
    }

    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: { contact }
    });

  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// PUT /api/admin/contacts/:id/status - Update contact status
router.put('/contacts/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid contact ID format'
      });
    }

    // Validate status
    const validStatuses = ['new', 'contacted', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      data: { contact },
      message: 'Contact status updated successfully'
    });

  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

export default router;