import mongoose from "mongoose";
import { seedDatabaseIfEmpty } from "./dbSeeder.js";

export const dbConnect = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/Quirex';

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error event:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting reconnection if requested...');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully.');
    });

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    if (conn) {
      console.log(`Database connected successfully to ${conn.connection.host || 'MongoDB'}`);
      await seedDatabaseIfEmpty();
    }
  } catch (err) {
    console.error("Database initial connection error:", err.message);
  }
};