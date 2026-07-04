import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { config } from '../src/config.js';

let isConnected = false;

// Ensure MongoDB is connected before handling any request in serverless environment
app.use(async (req, res, next) => {
  if (isConnected) {
    return next();
  }
  
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000 // fail fast if unable to connect
    });
    isConnected = true;
    console.log('MongoDB Connected successfully in Serverless Function');
    next();
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

export default app;
