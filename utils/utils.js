
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({quiet:true});


async function connectDB(uri = process.env.MONGO_URI) {
  try {
    await mongoose.connect(uri);
    console.log("\n\nMongoDB connected:", mongoose.connection.name);
  } catch (err) {
    console.error("\n\nMongoDB connection error:", err);
    process.exit(1);
  }
}

function timeAgo(startDatetime, endDatetime = new Date()){
  const seconds = Math.floor((new Date(endDatetime) - new Date(startDatetime)) / 1000);

  if (seconds < 60) {
    return `${seconds}s`
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h`
  }
  if (seconds < 7 * 86400) {
    return `${Math.floor(seconds / 86400)}d`
  }
  if (seconds < 30 * 86400) {
    return `${Math.floor(seconds / (7 * 86400))}w`
  }
  if (seconds < 365 * 86400) {
    return `${Math.floor(seconds / (30 * 86400))}mo`
  }
  return `${Math.floor(seconds / (365 * 86400))}y`
}

function avatarFor(seed) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

module.exports = {
  connectDB,
  timeAgo,
  avatarFor,
};