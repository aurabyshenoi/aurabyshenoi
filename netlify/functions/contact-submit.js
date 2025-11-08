const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
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
    const { name, email, phone, message, artworkReference } = JSON.parse(event.body);

    // Validate required fields
    if (!name || !name.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Name is required',
        }),
      };
    }

    if (!email || !email.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Email is required',
        }),
      };
    }

    if (!message || !message.trim()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Message is required',
        }),
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
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
    const contacts = db.collection('contacts');

    // Generate contact number
    const count = await contacts.countDocuments();
    const contactNumber = `CNT${String(count + 1).padStart(6, '0')}`;

    // Create contact document
    const contact = {
      contactNumber,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      message: message.trim(),
      artworkReference: artworkReference || null,
      status: 'new',
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await contacts.insertOne(contact);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Thank you for contacting us! We will get back to you soon.',
        data: {
          contactNumber,
          submittedAt: contact.submittedAt.toISOString(),
        },
      }),
    };
  } catch (error) {
    console.error('Contact submission error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to submit contact form. Please try again later.',
        error: error.message,
      }),
    };
  }
};
