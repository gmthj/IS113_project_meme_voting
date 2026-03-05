const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();


async function connectDB(uri = process.env.MONGO_URI) {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected:", mongoose.connection.name);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

module.exports = { connectDB };
