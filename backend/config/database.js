const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("MONGODB_URI =", process.env.MONGODB_URI);
        const conn = await mongoose.connect(
          process.env.MONGODB_URI,
          {
            serverSelectionTimeoutMS: 10000,
            family: 4
          }
        );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
