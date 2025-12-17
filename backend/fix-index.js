import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codesnippets')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Drop the entire snippets collection
    await mongoose.connection.db.collection('snippets').drop();
    console.log('Snippets collection dropped successfully');
    
    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
