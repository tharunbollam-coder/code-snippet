import User from './models/User.js';

const testUserCreation = async () => {
  try {
    console.log('Testing user creation...');
    
    const userData = {
      username: 'testuser123',
      email: 'test123@example.com',
      password: 'Test123'
    };
    
    console.log('Creating user with data:', userData);
    
    const user = new User(userData);
    console.log('User object created:', user);
    
    await user.save();
    console.log('User saved successfully');
    
    // Clean up
    await User.deleteOne({ email: 'test123@example.com' });
    console.log('Test user cleaned up');
    
  } catch (error) {
    console.error('Error during user creation test:', error.message);
    console.error('Error stack:', error.stack);
  }
};

testUserCreation();
