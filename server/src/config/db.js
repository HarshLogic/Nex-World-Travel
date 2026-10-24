import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nex_world_travel';
  try {
    mongoose.set('strictQuery', false);
    // Disable long buffering so operations fail fast if db is offline
    mongoose.set('bufferTimeoutMS', 1500);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database] MongoDB offline (${error.message}). Resilient store active.`);
    return false;
  }
};

export const getDBStatus = () => {
  const isConnected = mongoose.connection.readyState === 1;
  return {
    connected: isConnected,
    mode: isConnected ? 'mongodb-live' : 'resilient-in-memory-active',
  };
};

