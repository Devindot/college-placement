// Load environment variables from .env file at the very beginning
require('dotenv').config();

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
console.log(MONGODB_URI);

if (!process.env.MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI not found in environment variables. Falling back to localhost (if defined). This is not recommended for production.");
}


const connectDB = async () => {
  try {
    // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose v6+
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = { connectDB };