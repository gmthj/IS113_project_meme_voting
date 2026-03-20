// scripts/exportDBtoJSON.js

const dotenv = require("dotenv");
dotenv.config();

const fs       = require("fs");
const path     = require("path");
const mongoose = require("mongoose");
const { connectDB } = require("../utils/utils");

const User    = require("../models/User-model");
const Post    = require("../models/Post-model");
const Comment = require("../models/Comment-model");
const Vote    = require("../models/Vote-model");

// Output goes to /data/data-<datetime>.json
const timestamp  = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
const outputPath = path.resolve(__dirname, `../data/data-${timestamp}.json`);

async function main() {
  await connectDB(process.env.MONGO_URI);
  console.log("Connected ✅");

  // ── Users ─────────────────────────────────────────────────────────────────
  const users = await User.find().lean();
  const userIndexById = {};
  users.forEach((u, i) => { userIndexById[u._id.toString()] = i; });

  const snapshotUsers = users.map((u) => ({
    email:        u.email,
    passwordHash: u.passwordHash,
    name:         u.name,
    dob:          u.dob ? u.dob.toISOString().split("T")[0] : null,
    bio:          u.bio  ?? "",
    avatar:       u.avatar ?? "",
    avatarSeed:   u.name,
  }));

  // ── Posts ─────────────────────────────────────────────────────────────────
  const posts = await Post.find().sort({ upload_datetime: 1 }).lean();
  const postIndexById = {};
  posts.forEach((p, i) => { postIndexById[p._id.toString()] = i; });

  const snapshotPosts = posts.map((p) => {
    const entry = {
      authorIndex: userIndexById[p.userId.toString()],
      title:       p.title,
      description: p.description ?? "",
      image:       p.image,
      uploadedAt:  p.upload_datetime.toISOString(),
    };
    if (p.edit_datetime) entry.editedAt = p.edit_datetime.toISOString();
    return entry;
  });

  // ── Comments ──────────────────────────────────────────────────────────────
  const comments = await Comment.find().sort({ upload_datetime: 1 }).lean();

  const snapshotComments = comments.map((c) => {
    const entry = {
      postIndex:   postIndexById[c.postId.toString()],
      authorIndex: userIndexById[c.userId.toString()],
      text:        c.text,
      uploadedAt:  c.upload_datetime.toISOString(),
    };
    if (c.edit_datetime) entry.editedAt = c.edit_datetime.toISOString();
    return entry;
  });

  // ── Votes ─────────────────────────────────────────────────────────────────
  const votes = await Vote.find().lean();

  const snapshotVotes = votes.map((v) => ({
    postIndex:   postIndexById[v.postId.toString()],
    authorIndex: userIndexById[v.userId.toString()],
    value:       v.value,
  }));

  // ── Write snapshot ────────────────────────────────────────────────────────
  const snapshot = {
    _checkpoint: new Date().toISOString(),
    users:    snapshotUsers,
    posts:    snapshotPosts,
    comments: snapshotComments,
    votes:    snapshotVotes,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

  console.log(`\nSnapshot saved ✅`);
  console.log(`  Users:    ${snapshotUsers.length}`);
  console.log(`  Posts:    ${snapshotPosts.length}`);
  console.log(`  Comments: ${snapshotComments.length}`);
  console.log(`  Votes:    ${snapshotVotes.length}`);
  console.log(`  Output:   ${outputPath}`);

  await mongoose.disconnect();
  console.log("\nDisconnected ✅");
  process.exit(0);
}

main().catch(async (e) => {
  console.error("Export error:", e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});