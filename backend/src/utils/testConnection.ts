import { connectDB } from '../config/database';

export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await connectDB();
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
};