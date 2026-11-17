const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // Check if URI is default/placeholder
      if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('localhost') && !process.env.MONGO_URI.includes('27017')) {
        throw new Error('Invalid or missing MONGO_URI');
      }

      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries += 1;
      logger.error(`❌ MongoDB connection attempt ${retries}/${maxRetries} failed: ${error.message}`);
      
      if (retries === maxRetries) {
        logger.error('==================================================================');
        logger.error('                ⚠️  DATABASE CONNECTION ERROR ⚠️');
        logger.error('==================================================================');
        logger.error('  Could not connect to MongoDB.');
        logger.error('  If you are running in production/publishing professionally:');
        logger.error('  1. Create a free database cluster on MongoDB Atlas.');
        logger.error('  2. Copy the connection string and paste it into backend/.env');
        logger.error('     as MONGO_URI=mongodb+srv://<user>:<password>@cluster0...');
        logger.error('  3. Ensure you replace <password> with your actual database user password.');
        logger.error('  4. Whitelist all IP addresses (0.0.0.0/0) in MongoDB Atlas settings.');
        logger.error('==================================================================');

        if (process.env.NODE_ENV === 'production') {
          logger.error('Production mode detected. Exiting process...');
          process.exit(1);
        } else {
          logger.warn('Development mode: Keeping server running so you can update .env. Changes will hot-reload.');
          return;
        }
      }
      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1500 * retries));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err.message}`);
});

module.exports = connectDB;
