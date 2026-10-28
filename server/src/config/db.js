import mongoose from 'mongoose';

let lastConnectionError = null;
let retryTimer = null;

export const connectDB = async (isRetry = false) => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nex_world_travel';
  try {
    mongoose.set('strictQuery', false);
    // Allow up to 8s for cloud MongoDB Atlas TLS/SSL handshake
    mongoose.set('bufferTimeoutMS', 5000);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    lastConnectionError = null;
    if (retryTimer) {
      clearInterval(retryTimer);
      retryTimer = null;
    }
    return true;
  } catch (error) {
    lastConnectionError = error.message;
    if (!isRetry) {
      console.warn(`[Database] MongoDB offline (${error.message}). Resilient store active.`);
    }

    // Schedule background reconnection attempts if not connected
    if (!retryTimer) {
      retryTimer = setInterval(async () => {
        if (mongoose.connection.readyState !== 1) {
          await connectDB(true);
        } else {
          clearInterval(retryTimer);
          retryTimer = null;
        }
      }, 15000);
      if (retryTimer.unref) retryTimer.unref();
    }
    return false;
  }
};

export const getDBStatus = () => {
  const isConnected = mongoose.connection.readyState === 1;
  return {
    connected: isConnected,
    mode: isConnected ? 'mongodb-live' : 'resilient-in-memory-active',
    ...(isConnected
      ? { host: mongoose.connection.host }
      : { message: lastConnectionError || 'Not connected to remote database' }),
  };
};


