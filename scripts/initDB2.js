// scripts/initDB2.js

const dotenv = require("dotenv");
dotenv.config();

const fs       = require("fs");
const path     = require("path");
const readline = require("readline");
const mongoose = require("mongoose");
const { connectDB, avatarFor } = require("../utils/utils");

const User              = require("../models/User-model");
const Post              = require("../models/Post-model");
const Comment           = require("../models/Comment-model");
const Vote              = require("../models/Vote-model");
const PostPreference    = require("../models/Post-Preference-model");
const CommentPreference = require("../models/Comment-Preference-model");
const Bookmark          = require("../models/Bookmark-model");

// ── Data file selection ───────────────────────────────────────────────────
//
// Priority order:
//   1. Interactive prompt — user picks from the list, or hits enter for default or latest
//   2. DEFAULT_FILE — use this file if nothing is selected
//   3. Latest data-*.json in /data by filename (which sorts by datetime)

const DEFAULT_FILE = null;
// const DEFAULT_FILE = "../data/data-v1-2026-03-23_1430.json";

const DATA_DIR = path.resolve(__dirname, "../data");

// function getDataFiles() {
//   return fs
//     .readdirSync(DATA_DIR)
//     .filter((f) => f.endsWith(".json"))
//     .sort()
//     // .reverse(); // newest first
// }

function getDataFiles() {
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => {
      const getVersion = (name) => {
        const match = name.match(/v(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };

      return getVersion(a) - getVersion(b);
    });
}

const loadDataArt = `\n\n
██╗      ██████╗  █████╗ ██████╗     ██████╗  █████╗ ████████╗ █████╗
██║     ██╔═══██╗██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
██║     ██║   ██║███████║██║  ██║    ██║  ██║███████║   ██║   ███████║
██║     ██║   ██║██╔══██║██║  ██║    ██║  ██║██╔══██║   ██║   ██╔══██║
███████╗╚██████╔╝██║  ██║██████╔╝    ██████╔╝██║  ██║   ██║   ██║  ██║
╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═════╝     ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
`

function pickFileInteractive(files) {
  return new Promise((resolve) => {
    console.log(loadDataArt);
    console.log("Available data files:");
    files.forEach((f, i) => console.log(`  [${i + 1}] ${f}`));


    const uri = process.env.MONGO_URI
    const dbName = new URL(uri).pathname.substring(1);
    console.log(`\nWrite to: (${(uri.includes(".mongodb.net")) ? "ATLAS" : "LOCAL"}) ${dbName}`); 


    const fallback = DEFAULT_FILE ? path.basename(DEFAULT_FILE) : files[files.length-1];
    console.log(`                                     Default: ${fallback}`);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Select file number (or Enter to use default): ", (answer) => {
      rl.close();
      const trimmed = answer.trim();
      if (!trimmed) return resolve({ file: null, explicit: false });
      const idx = parseInt(trimmed, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= files.length) {
        console.log("Invalid selection, skipping to next priority.");
        return resolve({ file: null, explicit: false });
      }
      resolve({ file: files[idx], explicit: true });
    });
  });
}

async function resolveDataFile() {
  const files = getDataFiles();
  if (files.length === 0) throw new Error(`No .json files found in ${DATA_DIR}`);

  const { file: picked, explicit } = await pickFileInteractive(files);
  console.log("===================================");
  if (explicit) {
    const abs = path.join(DATA_DIR, picked);
    console.log(`Using selected file: ${abs}`);
    console.log("===================================");
    return abs;
  }

  if (DEFAULT_FILE) {
    const abs = path.resolve(__dirname, DEFAULT_FILE);
    console.log(`Using default file: ${abs}`);
    console.log("===================================");
    return abs;
  }

  console.log(`Using latest file: ${files[files.length-1]}`);
  console.log("===================================");
  return path.join(DATA_DIR, files[files.length-1]);
}

async function main() {
  const dataFilePath = await resolveDataFile();
  const seedData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  console.log(`\nLoading: ${dataFilePath}`);
  if (seedData._checkpoint) console.log(`Checkpoint: ${seedData._checkpoint}`);
  if (seedData._version)    console.log(`Version:    v${seedData._version}`);

  // 1) Connect
  await connectDB();

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

  // 4) Create users
  // Use insertMany with { timestamps: false } to restore original createdAt/updatedAt.
  // Falls back to User.create() for old snapshots that don't have those fields.
  const hasTimestamps = seedData.users.some((u) => u.createdAt);
  let createdUsers;

  if (hasTimestamps) {
    const userDocs = seedData.users.map((u) => ({
      email:        u.email,
      passwordHash: u.passwordHash,
      name:         u.name,
      dob:          new Date(u.dob),
      bio:          u.bio,
      avatar:       u.avatar || avatarFor(u.avatarSeed),
      createdAt:    new Date(u.createdAt),
      updatedAt:    new Date(u.updatedAt ?? u.createdAt),
    }));
    // timestamps: false lets us write createdAt/updatedAt manually
    createdUsers = await User.insertMany(userDocs, { timestamps: false });
  } else {
    createdUsers = await Promise.all(
      seedData.users.map((u) =>
        User.create({
          email:        u.email,
          passwordHash: u.passwordHash,
          name:         u.name,
          dob:          new Date(u.dob),
          bio:          u.bio,
          avatar:       u.avatar || avatarFor(u.avatarSeed),
        })
      )
    );
  }
  console.log(`Users created ✅ (${createdUsers.length})`);

  // 5) Create posts
  const createdPosts = await Promise.all(
    seedData.posts.map((p) =>
      Post.create({
        userId:          createdUsers[p.authorIndex]._id,
        title:           p.title,
        description:     p.description,
        image:           p.image,
        upload_datetime: new Date(p.uploadedAt),
        ...(p.editedAt && { edit_datetime: new Date(p.editedAt) }),
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
        postId:          createdPosts[c.postIndex]._id,
        userId:          createdUsers[c.authorIndex]._id,
        text:            c.text,
        upload_datetime: new Date(c.uploadedAt),
        ...(c.editedAt && { edit_datetime: new Date(c.editedAt) }),
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
        value:  v.value,
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

  // 8) Create bookmarks
  if (seedData.bookmarks?.length) {
    await Promise.all(
      seedData.bookmarks.map((b) =>
        Bookmark.create({
          postId: createdPosts[b.postIndex]._id,
          userId: createdUsers[b.authorIndex]._id,
        })
      )
    );
    console.log(`Bookmarks created ✅ (${seedData.bookmarks.length})`);
  }

  // 9) Create post preferences
  if (seedData.postPreferences?.length) {
    await Promise.all(
      seedData.postPreferences.map((pp) =>
        PostPreference.create({
          userId:   createdUsers[pp.authorIndex]._id,
          page:     pp.page,
          sortType: pp.sortType,
        })
      )
    );
    console.log(`Post preferences created ✅ (${seedData.postPreferences.length})`);
  }

  // 10) Create comment preferences
  if (seedData.commentPreferences?.length) {
    await Promise.all(
      seedData.commentPreferences.map((cp) =>
        CommentPreference.create({
          userId:   createdUsers[cp.authorIndex]._id,
          postId:   createdPosts[cp.postIndex]._id,
          sortType: cp.sortType,
        })
      )
    );
    console.log(`Comment preferences created ✅ (${seedData.commentPreferences.length})`);
  }

  // 11) Summary
  const topPosts = await Post.find()
    .sort({ vote_score: -1, upload_datetime: -1 })
    .limit(20)
    .populate("userId", "name");

  console.log("\n--- Top 20 posts by score ---");
  topPosts.forEach((p) =>
    console.log(`  [${String(p.vote_score).padStart(3)}] ${p.title} — by ${p.userId.name}`)
  );

  await mongoose.disconnect();
  console.log("\nDisconnected ✅  Seed complete.");
  process.exit(0);
}

main().catch(async (e) => {
  console.error("Seed error:", e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});