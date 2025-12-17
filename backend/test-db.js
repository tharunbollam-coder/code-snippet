import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    
    try {
      // Test creating a user
      const testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test123'
      });
      
      await testUser.save();
      console.log('Test user created successfully');
      
      // Clean up
      await User.deleteOne({ email: 'test@example.com' });
      console.log('Test user cleaned up');
      
    } catch (error) {
      console.error('Error during user test:', error.message);
    }
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
