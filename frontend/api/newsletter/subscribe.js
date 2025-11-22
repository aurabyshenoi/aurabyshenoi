const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = await MongoClient.connect(MONGODB_URI);
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { email, source = 'homepage' } = req.body;

    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required',
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const trimmedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    // Connect to database
    const client = await connectToDatabase();
    const db = client.db('artist-portfolio');
    const newsletters = db.collection('newsletters');

    // Check for duplicate
    const existing = await newsletters.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This email is already subscribed to our newsletter',
      });
    }

    // Create subscription
    const newsletter = {
      email: trimmedEmail,
      source,
      status: 'active',
      subscribedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await newsletters.insertOne(newsletter);

    return res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      data: {
        email: trimmedEmail,
        subscribedAt: newsletter.subscribedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter. Please try again later.',
      error: error.message,
    });
  }
}
