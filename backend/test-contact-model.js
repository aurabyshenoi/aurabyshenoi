const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Simple test to verify Contact model works
async function testContactModel() {
  let mongoServer;
  
  try {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    
    // Import Contact model
    const Contact = require('./dist/models/Contact').default;
    
    // Create a test contact
    const contact = new Contact({
      customer: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '123-456-7890',
        address: '123 Test St'
      },
      query: 'Test query',
      status: 'new'
    });
    
    // Save and check if contactNumber is generated
    await contact.save();
    console.log('Contact saved successfully!');
    console.log('Contact Number:', contact.contactNumber);
    console.log('Contact ID:', contact._id);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
}

testContactModel();