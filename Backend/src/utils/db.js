import mongoose from 'mongoose';

export const connectDB = async () => {
  console.log('Connecting to MongoDB...',process.env.MONGODB_URI);
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('MongoDB connection error:', error);
  }
};
