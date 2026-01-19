import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    console.log('URI:', process.env.MONGODB_URI?.substring(0, 60) + '...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/billbuddies', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('\n📝 Troubleshooting:');
    console.error('1. Go to: https://cloud.mongodb.com/v2');
    console.error('2. Click "Network Access" (left menu)');
    console.error('3. Add IP address: 0.0.0.0/0 (for development)');
    console.error('4. Wait 2-3 minutes');
    console.error('5. Restart backend');
    console.error('\nOR use local MongoDB:');
    console.error('Update .env: MONGODB_URI=mongodb://localhost:27017/billbuddies');
    console.error('Run: mongod');
    
    // Don't exit immediately, wait a bit for retry
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  }
};
