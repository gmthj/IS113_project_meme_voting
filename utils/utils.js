
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

function timeAgo(datetime) {
  const seconds = Math.floor((new Date() - new Date(datetime)) / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h ago`
  }
  if (seconds < 7 * 86400) {
    return `${Math.floor(seconds / 86400)}d ago`
  }
  if (seconds < 30 * 86400) {
    return `${Math.floor(seconds / (7 * 86400))}w ago`
  }
  if (seconds < 365 * 86400) {
    return `${Math.floor(seconds / (30 * 86400))}mo ago`
  }
  return `${Math.floor(seconds / (365 * 86400))}y ago`
}

module.exports = {
  connectDB,
  timeAgo
};