
const mongoose = require("mongoose");
const { connectDB } = require("../utils/utils");

const User = require("../models/User-model");
const Post = require("../models/Post-model");
const Comment = require("../models/Comment-model");
const Vote = require("../models/Vote-model");

async function main() {
  // 1) Connect
  await connectDB();

  // 2) Ensure indexes
  await User.init();
  await Post.init();
  await Comment.init();
  await Vote.init();
  console.log("Indexes ensured ✅");

  // 3) Nuke everything
  await Vote.deleteMany({});
  await Comment.deleteMany({});
  await Post.deleteMany({});
  // await User.deleteMany({});
  console.log("Collections cleared ✅");

  await mongoose.disconnect();
  console.log("\nDisconnected ✅  Seed complete.");
  process.exit(0);
}

main().catch(async (e) => {
  console.error("cleardb script error:", e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
