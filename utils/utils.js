
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
    const seconds = Math.floor((new Date() - datetime) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + "y ago"

    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + "m ago"

    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + "d ago"

    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + "h ago"

    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + "m ago"

    return Math.floor(seconds) + "s ago"
}


module.exports = { 
    connectDB,
    timeAgo
 };