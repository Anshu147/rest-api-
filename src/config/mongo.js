import mongoose from 'mongoose';
import { config } from './env.js';

export const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri);
    console.log(`[MongoDB] Connected successfully to ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('[MongoDB] Connection failed:', error.message);
    throw error;
  }
};
