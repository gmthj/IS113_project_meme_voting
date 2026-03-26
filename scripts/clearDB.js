const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const { connectDB } = require("../utils/utils");

const User              = require("../models/User-model");
const Post              = require("../models/Post-model");
const Comment           = require("../models/Comment-model");
const Vote              = require("../models/Vote-model");
const Bookmark          = require("../models/Bookmark-model");
const PostPreference    = require("../models/Post-Preference-model");
const CommentPreference = require("../models/Comment-Preference-model");

async function main() {
  await connectDB();
  mongoose.set('autoIndex', false);

  // 2) Ensure indexes
  await User.init();
  await Post.init();
  await Comment.init();
  await Vote.init();
  await PostPreference.init();
  await CommentPreference.init();
  await Bookmark.init();
  console.log("Indexes ensured ✅");

  // 3) Nuke everything
  await CommentPreference.deleteMany({});
  await PostPreference.deleteMany({});
  await Bookmark.deleteMany({});
  await Vote.deleteMany({});
  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({});
  console.log("Collections cleared ✅");

  await mongoose.disconnect();
  console.log("\nDisconnected ✅");
  process.exit(0);
}

main().catch(async (e) => {
  console.error("clearDB error:", e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});