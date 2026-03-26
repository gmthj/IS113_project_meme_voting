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

    const uri = process.env.MONGO_URI;
    const dbName = new URL(uri).pathname.substring(1);
    console.log(`\nWrite to: (${uri.includes(".mongodb.net") ? "ATLAS" : "LOCAL"}) ${dbName}`);

    const fallback = DEFAULT_FILE ? path.basename(DEFAULT_FILE) : files[files.length - 1];
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

  console.log(`Using latest file: ${files[files.length - 1]}`);
  console.log("===================================");
  return path.join(DATA_DIR, files[files.length - 1]);
}

async function main() {
  const dataFilePath = await resolveDataFile();
  const seedData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  console.log(`\nLoading: ${dataFilePath}`);
  if (seedData._checkpoint) console.log(`Checkpoint: ${seedData._checkpoint}`);
  if (seedData._version)    console.log(`Version:    v${seedData._version}`);

  // 1) Connect
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

  // If snapshot has pre-computed scores (exported from live DB), restore them now
  const hasStoredScores = seedData.posts.some((p) => p.vote_score !== undefined);
  if (hasStoredScores) {
    await Promise.all(
      seedData.posts.map((p, i) =>
        Post.updateOne(
          { _id: createdPosts[i]._id },
          { $set: {
            vote_score:      p.vote_score      ?? 0,
            self_vote_score: p.self_vote_score ?? 0,
            comment_count:   p.comment_count   ?? 0,
          }}
        )
      )
    );
  }
  console.log(`Posts created ✅ (${createdPosts.length})`);

  // 6) Create comments + tally comment_count per post
  const commentCountMap = {};
  const createdCommentsList = await Promise.all(
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

  if (hasStoredScores) {
    await Promise.all(
      seedData.comments.map((c, i) =>
        Comment.updateOne(
          { _id: createdCommentsList[i]._id },
          { $set: {
            vote_score:      c.vote_score      ?? 0,
            self_vote_score: c.self_vote_score ?? 0,
          }}
        )
      )
    );
  } else {
    await Promise.all(
      Object.entries(commentCountMap).map(([postIndex, count]) =>
        Post.updateOne(
          { _id: createdPosts[postIndex]._id },
          { $set: { comment_count: count } }
        )
      )
    );
  }
  console.log(`Comments created ✅ (${seedData.comments.length})`);

  // 7) Create votes
  //
  // Two modes:
  //   - Snapshot (hasStoredScores): scores already restored above, just insert Vote docs
  //   - Hand-crafted JSON: recalculate using karma-weighted voting
  //
  // Karma formula (from userService.js):
  //   postKarma    = sum(post.vote_score   - post.self_vote_score)   * 2
  //   commentKarma = sum(comment.vote_score - comment.self_vote_score)
  //   finalKarma   = postKarma + commentKarma
  //
  // Weight tiers:
  //   Troller    (score < -5)  : 0  (vote recorded but ignored)
  //   Newcomer   (age  < 30d)  : 1
  //   Lurker     (score < 10)  : 1
  //   Apprentice (score < 50)  : 2
  //   Master     (score < 100) : 3
  //   Legend     (score >= 100): 5

  if (hasStoredScores) {
    await Promise.all(
      seedData.votes.map((v) =>
        Vote.create({
          postId: createdPosts[v.postIndex]._id,
          userId: createdUsers[v.authorIndex]._id,
          value:  v.value,
        })
      )
    );
  } else {
    function getKarmaWeight(karmaScore, accountAgeDays) {
      if (karmaScore < -5)     return 0; // Troller
      if (accountAgeDays < 30) return 1; // Newcomer
      if (karmaScore < 10)     return 1; // Lurker
      if (karmaScore < 50)     return 2; // Apprentice
      if (karmaScore < 100)    return 3; // Master
      return 5;                          // Legend
    }

    async function getUserKarmaWeight(userDoc) {
      const postStats = await Post.aggregate([
        { $match: { userId: userDoc._id } },
        { $group: { _id: null, netScore: { $sum: { $subtract: ["$vote_score", "$self_vote_score"] } } } }
      ]);
      const commentStats = await Comment.aggregate([
        { $match: { userId: userDoc._id } },
        { $group: { _id: null, netScore: { $sum: { $subtract: ["$vote_score", "$self_vote_score"] } } } }
      ]);
      const postKarma    = postStats[0]?.netScore    ?? 0;
      const commentKarma = commentStats[0]?.netScore ?? 0;
      const finalKarma   = (postKarma * 2) + commentKarma;
      const accountAgeDays = Math.ceil((new Date() - new Date(userDoc.createdAt)) / 86400000);
      return getKarmaWeight(finalKarma, accountAgeDays);
    }

    for (const v of seedData.votes) {
      const voterDoc   = createdUsers[v.authorIndex];
      const postDoc    = createdPosts[v.postIndex];
      const isSelfVote = voterDoc._id.toString() === postDoc.userId.toString();
      const weight     = await getUserKarmaWeight(voterDoc);

      await Vote.create({ postId: postDoc._id, userId: voterDoc._id, value: v.value });

      if (weight === 0) continue; // Troller — recorded but no score impact

      const delta = v.value ? weight : -weight;
      await Post.updateOne(
        { _id: postDoc._id },
        { $inc: {
          vote_score:      delta,
          self_vote_score: isSelfVote ? delta : 0,
        }}
      );
    }
  }
  console.log(`Votes created ✅ (${seedData.votes.length})`);

  // 8) Create comment votes
  if (seedData.commentVotes?.length) {
    if (hasStoredScores) {
      await Promise.all(
        seedData.commentVotes.map((v) =>
          Vote.create({
            commentId: createdCommentsList[v.commentIndex]._id,
            userId:    createdUsers[v.authorIndex]._id,
            value:     v.value,
          })
        )
      );
    } else {
      for (const v of seedData.commentVotes) {
        const voterDoc      = createdUsers[v.authorIndex];
        const commentDoc    = createdCommentsList[v.commentIndex];
        const isSelfVote    = voterDoc._id.toString() === commentDoc.userId.toString();
        const weight        = await getUserKarmaWeight(voterDoc);

        await Vote.create({ commentId: commentDoc._id, userId: voterDoc._id, value: v.value });

        if (weight === 0) continue;

        const delta = v.value ? weight : -weight;
        await Comment.updateOne(
          { _id: commentDoc._id },
          { $inc: {
            vote_score:      delta,
            self_vote_score: isSelfVote ? delta : 0,
          }}
        );
      }
    }
    console.log(`Comment votes created ✅ (${seedData.commentVotes.length})`);
  }

  // // 9) Create bookmarks
  // if (seedData.bookmarks?.length) {
  //   await Promise.all(
  //     seedData.bookmarks.map((b) =>
  //       Bookmark.create({
  //         postId: createdPosts[b.postIndex]._id,
  //         userId: createdUsers[b.authorIndex]._id,
  //       })
  //     )
  //   );
  //   console.log(`Bookmarks created ✅ (${seedData.bookmarks.length})`);
  // }

    // 9) Create bookmarks (Safe Version)
  if (seedData.bookmarks?.length) {
      await Promise.all(
          seedData.bookmarks.map(async (b, i) => {
              const post = createdPosts[b.postIndex];
              const user = createdUsers[b.authorIndex];

              // VALIDATION: Check if the index actually exists
              if (!post || !user) {
                  console.warn(`⚠️ Skipping Bookmark at index ${i}: PostIndex ${b.postIndex} or AuthorIndex ${b.authorIndex} not found.`);
                  return null;
              }

              return Bookmark.create({
                  postId: post._id,
                  userId: user._id,
              });
          })
      );
      console.log(`Bookmarks created ✅ (${seedData.bookmarks.length})`);
  } 

  // 10) Create post preferences
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

  // 11) Create comment preferences
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

  // 12) Summary
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