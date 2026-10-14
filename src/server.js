import app from './app.js';
import { config } from './config/env.js';
import { connectMySQL, sequelize } from './config/mysql.js';
import { connectMongoDB } from './config/mongo.js';
import { syncDatabase } from './models/index.js';
import mongoose from 'mongoose';

let server;

const startServer = async () => {
  try {
    console.log('[Server] Initializing databases...');

    // Connect to MySQL and synchronize tables
    await connectMySQL();
    await syncDatabase();

    // Connect to MongoDB
    await connectMongoDB();

    // Start Express HTTP Server
    server = app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Project & Task Management API is running!`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`💾 MySQL Host: ${config.mysql.host}:${config.mysql.port}`);
      console.log(`🍃 MongoDB URI: ${config.mongodb.uri}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
};

const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);

  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed.');

      try {
        await sequelize.close();
        console.log('[MySQL] Connection closed.');
      } catch (err) {
        console.error('[MySQL] Error closing connection:', err.message);
      }

      try {
        await mongoose.connection.close();
        console.log('[MongoDB] Connection closed.');
      } catch (err) {
        console.error('[MongoDB] Error closing connection:', err.message);
      }

      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

startServer();
