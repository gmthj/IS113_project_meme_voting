// scripts/seedDB.js

const mongoose = require("mongoose");
const { connectDB } = require("../utils/utils");

const User = require("../models/User-model");
const Post = require("../models/Post-model");
const Comment = require("../models/Comment-model");
const Vote = require("../models/Vote-model");

const seedData = require("../data/data2.json");

function avatarFor(seed) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

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
  await User.deleteMany({});
  console.log("Collections cleared ✅");

  // 4) Create users
  const createdUsers = await Promise.all(
    seedData.users.map((u) =>
      User.create({
        email: u.email,
        passwordHash: u.passwordHash,
        name: u.name,
        dob: new Date(u.dob),
        bio: u.bio,
        avatar: avatarFor(u.avatarSeed),
      })
    )
  );
  console.log(`Users created ✅ (${createdUsers.length})`);

  // 5) Create posts
  const createdPosts = await Promise.all(
    seedData.posts.map((p) =>
      Post.create({
        userId: createdUsers[p.authorIndex]._id,
        title: p.title,
        description: p.description,
        image: p.image,
      })
    )
  );
  console.log(`Posts created ✅ (${createdPosts.length})`);

  // 6) Create comments + tally comment_count per post
  const commentCountMap = {};
  await Promise.all(
    seedData.comments.map((c) => {
      commentCountMap[c.postIndex] = (commentCountMap[c.postIndex] || 0) + 1;
      return Comment.create({
        postId: createdPosts[c.postIndex]._id,
        userId: createdUsers[c.authorIndex]._id,
        text: c.text,
      });
    })
  );

  await Promise.all(
    Object.entries(commentCountMap).map(([postIndex, count]) =>
      Post.updateOne(
        { _id: createdPosts[postIndex]._id },
        { $set: { comment_count: count } }
      )
    )
  );
  console.log(`Comments created ✅ (${seedData.comments.length})`);

  // 7) Create votes + tally vote_score per post
  const voteScoreMap = {};
  await Promise.all(
    seedData.votes.map((v) => {
      voteScoreMap[v.postIndex] =
        (voteScoreMap[v.postIndex] || 0) + (v.value ? 1 : -1);
      return Vote.create({
        postId: createdPosts[v.postIndex]._id,
        userId: createdUsers[v.authorIndex]._id,
        value: v.value,
      });
    })
  );

  await Promise.all(
    Object.entries(voteScoreMap).map(([postIndex, score]) =>
      Post.updateOne(
        { _id: createdPosts[postIndex]._id },
        { $set: { vote_score: score } }
      )
    )
  );
  console.log(`Votes created ✅ (${seedData.votes.length})`);

  // 8) Summary
  const topPosts = await Post.find()
    .sort({ vote_score: -1, upload_datetime: -1 })
    .limit(20)
    .populate("userId", "name");

  console.log("\n--- Top 20 posts by score ---");
  topPosts.forEach((p) =>
    console.log(
      `  [${String(p.vote_score).padStart(3)}] ${p.title} — by ${p.userId.name}`
    )
  );

  await mongoose.disconnect();
  console.log("\nDisconnected ✅  Seed complete.");
  process.exit(0);
}

main().catch(async (e) => {
  console.error("Seed script error:", e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
