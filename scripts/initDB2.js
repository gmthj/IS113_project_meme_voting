// scripts/initDB2.js

const dotenv = require("dotenv");
dotenv.config();

const fs       = require("fs");
const path     = require("path");
const readline = require("readline");
const mongoose = require("mongoose");
const { connectDB, avatarFor } = require("../utils/utils");
const {
  KARMA_TIER_0,
  KARMA_TIER_1,
  KARMA_TIER_2,
  KARMA_TIER_3,
  KARMA_NEW,
  VOTE_WEIGHTS,
  POST_VOTE_WEIGHT,
  COMMENT_VOTE_WEIGHT,
} = require("../config");

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

// ── Karma helpers (mirrors userService.js / voteService.js) ──────────────

function getKarmaTier(totalKarma, accountAgeDays) {
  if (totalKarma < KARMA_TIER_0)   return "Troller";
  if (accountAgeDays < KARMA_NEW)  return "Newcomer";
  if (totalKarma < KARMA_TIER_1)   return "Lurker";
  if (totalKarma < KARMA_TIER_2)   return "Apprentice";
  if (totalKarma < KARMA_TIER_3)   return "Master";
  return "Legend";
}

function getWeight(totalKarma, accountAgeDays) {
  return VOTE_WEIGHTS[getKarmaTier(totalKarma, accountAgeDays)] ?? 1;
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const dataFilePath = await resolveDataFile();
  const seedData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
  console.log(`\nLoading: ${dataFilePath}`);
  if (seedData._checkpoint) console.log(`Checkpoint: ${seedData._checkpoint}`);
  if (seedData._version)    console.log(`Version:    v${seedData._version}`);

  // 1) Connect
  await connectDB();
  mongoose.set("autoIndex", false);

  // Drop all collections (clears indexes too — avoids stale index conflicts)
  try {
    await mongoose.connection.db.dropCollection("votes");
    await mongoose.connection.db.dropCollection("posts");
    await mongoose.connection.db.dropCollection("users");
    await mongoose.connection.db.dropCollection("comments");
    await mongoose.connection.db.dropCollection("postpreferences");
    await mongoose.connection.db.dropCollection("commentpreferences");
    await mongoose.connection.db.dropCollection("bookmarks");
    console.log("Collections dropped (data + indexes cleared) ✅");
  } catch (e) {
    console.log("Some collections didn't exist to drop, skipping...");
  }

  // 2) Ensure indexes
  await User.init();
  await Post.init();
  await Comment.init();
  await Vote.init();
  await PostPreference.init();
  await CommentPreference.init();
  await Bookmark.init();
  console.log("Indexes ensured ✅");

  // 3) Create users
  // insertMany with { timestamps: false } restores original createdAt/updatedAt.
  // Falls back to create() for old snapshots without those fields.
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
      totalKarma:   u.totalKarma ?? 0,
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
          totalKarma:   u.totalKarma ?? 0,
        })
      )
    );
  }
  console.log(`Users created ✅ (${createdUsers.length})`);

  // 4) Create posts
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
            vote_score:    p.vote_score    ?? 0,
            comment_count: p.comment_count ?? 0,
          }}
        )
      )
    );
  }
  console.log(`Posts created ✅ (${createdPosts.length})`);

  // 5) Create comments + tally comment_count per post
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
          { $set: { vote_score: c.vote_score ?? 0 } }
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

  // ── 6) Create post votes ──────────────────────────────────────────────────
  if (hasStoredScores) {
    // Snapshot mode: just insert docs, scores are already set
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
    // Hand-crafted mode: Recalculate everything
    console.log("Recalculating Post Karma...");
    for (const v of seedData.votes) {
      const voterDoc   = createdUsers[v.authorIndex];
      const postDoc    = createdPosts[v.postIndex];
      const authorDoc  = createdUsers[seedData.posts[v.postIndex].authorIndex];
      const isSelfVote = voterDoc._id.toString() === postDoc.userId.toString();

      // Calculate weight based on CURRENT state of the voter in this script run
      const accountAgeDays = Math.ceil((new Date() - new Date(voterDoc.createdAt)) / 86400000);
      const weight = getWeight(voterDoc.totalKarma ?? 0, accountAgeDays);

      await Vote.create({ postId: postDoc._id, userId: voterDoc._id, value: v.value });

      if (weight === 0) continue; // Trollers don't affect scores

      const incValue = (v.value ? 1 : -1) * weight;

      // 1. Update Post Score
      await Post.updateOne({ _id: postDoc._id }, { $inc: { vote_score: incValue } });

      // 2. Update Author Karma
      if (!isSelfVote) {
        const karmaChange = incValue * POST_VOTE_WEIGHT;
        await User.updateOne({ _id: authorDoc._id }, { $inc: { totalKarma: karmaChange } });
        
        // FIX: Update in-memory karma so the next time this author votes, 
        // their tier/weight is calculated correctly.
        authorDoc.totalKarma = (authorDoc.totalKarma ?? 0) + karmaChange;
      }
    }
  }
  console.log(`Post votes created ✅ (${seedData.votes.length})`);

  // ── 7) Create comment votes ───────────────────────────────────────────────
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
      console.log("Recalculating Comment Karma...");
      for (const v of seedData.commentVotes) {
        const voterDoc   = createdUsers[v.authorIndex];
        const commentDoc = createdCommentsList[v.commentIndex];
        const authorDoc  = createdUsers[seedData.comments[v.commentIndex].authorIndex];
        const isSelfVote = voterDoc._id.toString() === commentDoc.userId.toString();

        const accountAgeDays = Math.ceil((new Date() - new Date(voterDoc.createdAt)) / 86400000);
        const weight = getWeight(voterDoc.totalKarma ?? 0, accountAgeDays);

        await Vote.create({ commentId: commentDoc._id, userId: voterDoc._id, value: v.value });

        if (weight === 0) continue;

        const incValue = (v.value ? 1 : -1) * weight;

        // 1. Update Comment Score
        await Comment.updateOne({ _id: commentDoc._id }, { $inc: { vote_score: incValue } });

        // 2. Update Author Karma
        if (!isSelfVote) {
          const karmaChange = incValue * COMMENT_VOTE_WEIGHT;
          await User.updateOne({ _id: authorDoc._id }, { $inc: { totalKarma: karmaChange } });
          
          // FIX: Update in-memory karma
          authorDoc.totalKarma = (authorDoc.totalKarma ?? 0) + karmaChange;
        }
      }
    }
    console.log(`Comment votes created ✅ (${seedData.commentVotes.length})`);
  }

  // 8) Create bookmarks
  if (seedData.bookmarks?.length) {
    await Promise.all(
      seedData.bookmarks.map(async (b, i) => {
        const post = createdPosts[b.postIndex];
        const user = createdUsers[b.authorIndex];
        if (!post || !user) {
          console.warn(`⚠️  Skipping bookmark ${i}: postIndex ${b.postIndex} or authorIndex ${b.authorIndex} not found`);
          return null;
        }
        return Bookmark.create({ postId: post._id, userId: user._id });
      })
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