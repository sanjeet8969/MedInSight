const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("URI exists:", !!process.env.MONGODB_URI);

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("FULL ERROR:");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
