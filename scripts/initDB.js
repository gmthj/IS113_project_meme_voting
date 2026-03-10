// scripts/fullTest.js
const mongoose = require("mongoose");
const { connectDB } = require("../utils/utils");

const User = require("../models/User-model");
const Post = require("../models/Post-model");
const Comment = require("../models/Comment-model");
const Vote = require("../models/Vote-model");

function avatarFor(seed) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

async function main() {
  // 1) Connect
  await connectDB();

  // 2) Ensure indexes (important for unique email + unique vote compound index)
  await User.init();
  await Post.init();
  await Comment.init();
  await Vote.init();
  console.log("Indexes ensured ✅");

  // 3) Clean up old test data (safe rerun)
  // Only delete the stuff created by this test script
  await Vote.deleteMany({});
  await Comment.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({});
  console.log("Old test data cleared ✅");

  // 4) Create users
  const userA = await User.create({
    email: "seed@smu.edu.sg",
    passwordHash: "fakehash",
    name: "Seed User A",
    dob: new Date("2005-01-01"),
    bio: "seed bio A",
    avatar: avatarFor("Seed User A"),
  });

  const userB = await User.create({
    email: "seed2@smu.edu.sg",
    passwordHash: "fakehash",
    name: "Seed User B",
    dob: new Date("2005-02-02"),
    bio: "seed bio B",
    avatar: avatarFor("Seed User B"),
  });

  console.log("Users created ✅", {
    userA: userA._id.toString(),
    userB: userB._id.toString(),
  });

  // 5) Create posts
  const post1 = await Post.create({
    userId: userA._id,
    title: "TEST: Meme A1",
    description: "First meme by A",
    image: "https://example.com/meme-a1.jpg",
  });

  const post2 = await Post.create({
    userId: userA._id,
    title: "TEST: Meme A2",
    description: "Second meme by A",
    image: "https://example.com/meme-a2.jpg",
  });

  const post3 = await Post.create({
    userId: userB._id,
    title: "TEST: Meme B1",
    description: "First meme by B",
    image: "https://example.com/meme-b1.jpg",
  });

  console.log("Posts created ✅", {
    post1: post1._id.toString(),
    post2: post2._id.toString(),
    post3: post3._id.toString(),
  });

  // 6) Create comments
  const c1 = await Comment.create({
    postId: post1._id,
    userId: userB._id,
    text: "Nice meme A!",
  });

  const c2 = await Comment.create({
    postId: post1._id,
    userId: userA._id,
    text: "Thanks!!",
  });

  const c3 = await Comment.create({
    postId: post3._id,
    userId: userA._id,
    text: "B meme is solid 😂",
  });

  // Update comment_count (denormalized counter)
  await Post.updateOne({ _id: post1._id }, { $set: { comment_count: 2 } });
  await Post.updateOne({ _id: post3._id }, { $set: { comment_count: 1 } });

  console.log("Comments created ✅", {
    c1: c1._id.toString(),
    c2: c2._id.toString(),
    c3: c3._id.toString(),
  });

  // 7) Create votes (1 vote per user per post)
  // userA upvotes post3 (+1)
  await Vote.create({ postId: post3._id, userId: userA._id, value: true });
  await Post.updateOne({ _id: post3._id }, { $inc: { vote_score: 1 } });

  // userB upvotes post1 (+1)
  await Vote.create({ postId: post1._id, userId: userB._id, value: true });
  await Post.updateOne({ _id: post1._id }, { $inc: { vote_score: 1 } });

  // userB downvotes post2 (-1)
  await Vote.create({ postId: post2._id, userId: userB._id, value: false });
  await Post.updateOne({ _id: post2._id }, { $inc: { vote_score: -1 } });

  console.log("Votes created ✅");

  // 8) Fetch posts by userA (your “user page”)
  const postsByA = await Post.find({ userId: userA._id }).sort({
    upload_datetime: -1,
  });
  console.log("\n--- Posts by User A (newest first) ---");
  postsByA.forEach((p) => console.log(p.title, "score:", p.vote_score));

  // 9) Fetch top posts (your “home page highest”)
  const topPosts = await Post.find()
    .sort({ vote_score: -1, upload_datetime: -1 })
    .limit(10);
  console.log("\n--- Top posts (score desc) ---");
  topPosts.forEach((p) => console.log(p.title, "score:", p.vote_score));

  // 10) Fetch posts with author info (populate)
  const postsWithAuthor = await Post.find()
    .sort({ upload_datetime: -1 })
    .populate("userId", "name email avatar");
  console.log("\n--- Posts with author populated ---");
  postsWithAuthor.forEach((p) => {
    console.log(`${p.title} by ${p.userId.name} (${p.userId.email})`);
  });

  // 11) Fetch comments for post1 with comment author populated
  const commentsForPost1 = await Comment.find({ postId: post1._id })
    .sort({ upload_datetime: 1 })
    .populate("userId", "name avatar");
  console.log("\n--- Comments for Post1 ---");
  commentsForPost1.forEach((c) => {
    console.log(`${c.userId.name}: ${c.text}`);
  });

  // Done
  await mongoose.disconnect();
  console.log("\nDisconnected ✅");
  process.exit(0);
}

main().catch(async (e) => {
  console.error("Test script error:", e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
