import mongoose from 'mongoose';

export const connectDB = async (retries = 3, delay = 5000): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/artist-portfolio';
  
  // Optimize connection settings for performance
  const options = {
    // Connection pool settings
    maxPoolSize: 10, // Maximum number of connections
    minPoolSize: 2,  // Minimum number of connections
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    serverSelectionTimeoutMS: 5000, // How long to try selecting a server
    socketTimeoutMS: 45000, // How long a send or receive on a socket can take
    
    // Performance optimizations
    bufferCommands: false, // Disable mongoose buffering
    
    // Compression
    compressors: ['zlib' as const], // Enable compression for network traffic
    
    // Read preferences for better performance
    readPreference: 'primaryPreferred' as const, // Read from primary, fallback to secondary
    
    // Write concern for better performance (adjust based on requirements)
    writeConcern: {
      w: 1, // Acknowledge writes to primary only (faster)
      j: true, // Wait for journal confirmation
    },
  };
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting to connect to MongoDB (attempt ${attempt}/${retries})...`);
      
      await mongoose.connect(mongoURI, options);
      
      // Verify connection is established
      const connectionState = mongoose.connection.readyState;
      if (connectionState !== 1) {
        throw new Error(`Connection state is ${connectionState}, expected 1 (connected)`);
      }
      
      // Enable query result caching (development only)
      if (process.env.NODE_ENV === 'development') {
        mongoose.set('debug', false); // Disable debug in production
      }
      
      console.log('MongoDB connected successfully with optimized settings');
      console.log(`Connection state: ${connectionState} (1 = connected)`);
      console.log(`Database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
      
      return; // Success, exit function
      
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed:`, error);
      
      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('All MongoDB connection attempts failed');
        throw error;
      }
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});