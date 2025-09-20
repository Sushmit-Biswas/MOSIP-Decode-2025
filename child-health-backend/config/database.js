const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/child-health-db';
    
    const conn = await mongoose.connect(mongoURI, {
      // Mongoose 6+ doesn't need most of these options
      // but keeping for compatibility
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📡 MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    // For development, continue without MongoDB
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing in development mode without MongoDB...');
      console.log('💡 Install and start MongoDB to enable database features');
      return;
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;