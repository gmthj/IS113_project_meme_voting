// scripts/test-fetch.js
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const { connectDB } = require("../config/db");

const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

async function main() {
  await connectDB(process.env.MONGO_URI);

  // 1) Find userA (by email)
  const userA = await User.findOne({ email: "seed@smu.edu.sg" });
  if (!userA) {
    console.log("User seed@smu.edu.sg not found. Run your seed script first.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // 2) Find a post to test comments (by title)
  const post1 = await Post.findOne({ title: "TEST: Meme A1" });
  if (!post1) {
    console.log('Post "TEST: Meme A1" not found. Run your seed script first.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // 3) Fetch posts by userA (user page)
  const postsByA = await Post.find({ userId: userA._id }).sort({
    upload_datetime: -1,
  });
  console.log("\n--- Posts by User A (newest first) ---");
  postsByA.forEach((p) => console.log(p.title, "score:", p.vote_score));

  // 4) Fetch top posts (home page highest)
  const topPosts = await Post.find()
    .sort({ vote_score: -1, upload_datetime: -1 })
    .limit(10);

  console.log("\n--- Top posts (score desc) ---");
  topPosts.forEach((p) => console.log(p.title, "score:", p.vote_score));

  // 5) Fetch posts with author info (populate)
  const postsWithAuthor = await Post.find()
    .sort({ upload_datetime: -1 })
    .populate("userId", "name email avatar");

  console.log("\n--- Posts with author populated ---");
  postsWithAuthor.forEach((p) => {
    // IMPORTANT: populate can be null if user doc is missing
    const author = p.userId;
    if (!author) {
      console.log(`${p.title} by [deleted user]`);
      return;
    }
    console.log(`${p.title} by ${author.name} (${author.email})`);
  });

  // 6) Fetch comments for post1 with comment author populated
  const commentsForPost1 = await Comment.find({ postId: post1._id })
    .sort({ upload_datetime: 1 })
    .populate("userId", "name avatar");

  console.log(`\n--- Comments for Post1 (${post1.title}) ---`);
  commentsForPost1.forEach((c) => {
    const author = c.userId;
    const authorName = author ? author.name : "[deleted user]";
    console.log(`${authorName}: ${c.text}`);
  });

  await mongoose.disconnect();
  console.log("\nDisconnected ✅");
  process.exit(0);
}

main().catch(async (e) => {
  console.error("Fetch test error:", e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
