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

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' }),
    };
  }

  try {
    const { email, source = 'homepage' } = JSON.parse(event.body);

    // Validate email
    if (!email || !email.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email address is required',
        }),
      };
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    const trimmedEmail = email.trim().toLowerCase();

    if (!emailRegex.test(trimmedEmail)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Please enter a valid email address',
        }),
      };
    }

    // Connect to database
    const client = await connectToDatabase();
    const db = client.db('artist-portfolio');
    const newsletters = db.collection('newsletters');

    // Check for duplicate
    const existing = await newsletters.findOne({ email: trimmedEmail });
    if (existing) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'This email is already subscribed to our newsletter',
        }),
      };
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

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Successfully subscribed to newsletter!',
        data: {
          email: trimmedEmail,
          subscribedAt: newsletter.subscribedAt.toISOString(),
        },
      }),
    };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to subscribe to newsletter. Please try again later.',
        error: error.message,
      }),
    };
  }
};
