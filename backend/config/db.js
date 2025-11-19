const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let memoryServer;

const connectWithUri = async (uri) => {
  console.log(`Connecting to MongoDB with URI: ${uri}`);
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

const startMemoryServer = async () => {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create();
    console.warn(
      'Using in-memory MongoDB instance. Set MONGODB_URI for a persistent database.',
    );
  }
  const uri = memoryServer.getUri();
  return connectWithUri(uri);
};

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await connectWithUri(process.env.MONGODB_URI);
      return;
    }
    await startMemoryServer();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    if (process.env.MONGODB_URI && process.env.ALLOW_IN_MEMORY_FALLBACK === 'false') {
      process.exit(1);
    }

    try {
      await startMemoryServer();
    } catch (fallbackErr) {
      console.error(
        'MongoDB in-memory fallback failed:',
        fallbackErr.message,
      );
      process.exit(1);
    }
  }
};

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
  }
  process.exit(0);
});

module.exports = connectDB;
