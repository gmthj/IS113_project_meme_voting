// scripts/exportDBtoJSON.js

const dotenv = require("dotenv");
dotenv.config();

const fs       = require("fs");
const path     = require("path");
const mongoose = require("mongoose");
const { connectDB } = require("../utils/utils");

const User              = require("../models/User-model");
const Post              = require("../models/Post-model");
const Comment           = require("../models/Comment-model");
const Vote              = require("../models/Vote-model");
const Bookmark          = require("../models/Bookmark-model");
const PostPreference    = require("../models/Post-Preference-model");
const CommentPreference = require("../models/Comment-Preference-model");

const DATA_DIR = path.resolve(__dirname, "../data");

function getNextVersion() {
  if (!fs.existsSync(DATA_DIR)) return 1;
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  const versions = files
    .map((f) => { const m = f.match(/^data-v(\d+)-/); return m ? parseInt(m[1], 10) : 0; })
    .filter((v) => v > 0);
  return versions.length > 0 ? Math.max(...versions) + 1 : 1;
}

const version    = getNextVersion();
const timestamp  = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Singapore" }).slice(0, 16).replace(" ", "_").replace(":", "");
const filename   = `data-v${version}-${timestamp}.json`;
const outputPath = path.join(DATA_DIR, filename);

async function main() {
  await connectDB();
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
    bio:          u.bio        ?? "",
    avatar:       u.avatar     ?? "",
    avatarSeed:   u.name,
    totalKarma:   u.totalKarma ?? 0,
    createdAt:    u.createdAt?.toISOString() ?? null,
    updatedAt:    u.updatedAt?.toISOString() ?? null,
  }));

  // ── Posts ─────────────────────────────────────────────────────────────────
  const posts = await Post.find().sort({ upload_datetime: 1 }).lean();
  const postIndexById = {};
  posts.forEach((p, i) => { postIndexById[p._id.toString()] = i; });

  const snapshotPosts = posts.map((p) => {
    const entry = {
      authorIndex:   userIndexById[p.userId.toString()],
      title:         p.title,
      description:   p.description ?? "",
      image:         p.image,
      uploadedAt:    p.upload_datetime.toISOString(),
      vote_score:    p.vote_score    ?? 0,
      comment_count: p.comment_count ?? 0,
    };
    if (p.edit_datetime) entry.editedAt = p.edit_datetime.toISOString();
    return entry;
  });

  // ── Comments ──────────────────────────────────────────────────────────────
  const comments = await Comment.find().sort({ upload_datetime: 1 }).lean();
  const commentIndexById = {};
  comments.forEach((c, i) => { commentIndexById[c._id.toString()] = i; });

  const snapshotComments = comments.map((c) => {
    const entry = {
      postIndex:   postIndexById[c.postId.toString()],
      authorIndex: userIndexById[c.userId.toString()],
      text:        c.text,
      uploadedAt:  c.upload_datetime.toISOString(),
      vote_score:  c.vote_score ?? 0,
    };
    if (c.edit_datetime) entry.editedAt = c.edit_datetime.toISOString();
    return entry;
  });

  // ── Post Votes ────────────────────────────────────────────────────────────
  const postVotes = await Vote.find({ postId: { $exists: true, $ne: null } }).lean();

  const snapshotVotes = postVotes.map((v) => ({
    postIndex:   postIndexById[v.postId.toString()],
    authorIndex: userIndexById[v.userId.toString()],
    value:       v.value,
  }));

  // ── Comment Votes ─────────────────────────────────────────────────────────
  const commentVotes = await Vote.find({ commentId: { $exists: true, $ne: null } }).lean();

  const snapshotCommentVotes = commentVotes.map((v) => ({
    commentIndex: commentIndexById[v.commentId.toString()],
    authorIndex:  userIndexById[v.userId.toString()],
    value:        v.value,
  }));

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  const bookmarks = await Bookmark.find().lean();

  const snapshotBookmarks = bookmarks.map((b) => ({
    postIndex:   postIndexById[b.postId.toString()],
    authorIndex: userIndexById[b.userId.toString()],
  }));

  // ── Post Preferences ──────────────────────────────────────────────────────
  const postPrefs = await PostPreference.find().lean();

  const snapshotPostPrefs = postPrefs.map((pp) => ({
    authorIndex: userIndexById[pp.userId.toString()],
    page:        pp.page,
    sortType:    pp.sortType,
  }));

  // ── Comment Preferences ───────────────────────────────────────────────────
  const commentPrefs = await CommentPreference.find().lean();

  const snapshotCommentPrefs = commentPrefs.map((cp) => ({
    authorIndex: userIndexById[cp.userId.toString()],
    postIndex:   postIndexById[cp.postId.toString()],
    sortType:    cp.sortType,
  }));

  // ── Write snapshot ────────────────────────────────────────────────────────
  const snapshot = {
    _checkpoint:        new Date().toISOString(),
    _version:           version,
    users:              snapshotUsers,
    posts:              snapshotPosts,
    comments:           snapshotComments,
    votes:              snapshotVotes,
    commentVotes:       snapshotCommentVotes,
    bookmarks:          snapshotBookmarks,
    postPreferences:    snapshotPostPrefs,
    commentPreferences: snapshotCommentPrefs,
  };

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2));

  console.log(`\nSnapshot saved ✅`);
  console.log(`  Version:            v${version}`);
  console.log(`  Users:              ${snapshotUsers.length}`);
  console.log(`  Posts:              ${snapshotPosts.length}`);
  console.log(`  Comments:           ${snapshotComments.length}`);
  console.log(`  Post votes:         ${snapshotVotes.length}`);
  console.log(`  Comment votes:      ${snapshotCommentVotes.length}`);
  console.log(`  Bookmarks:          ${snapshotBookmarks.length}`);
  console.log(`  Post prefs:         ${snapshotPostPrefs.length}`);
  console.log(`  Comment prefs:      ${snapshotCommentPrefs.length}`);
  console.log(`  Output:             ${outputPath}`);

  await mongoose.disconnect();
  console.log("\nDisconnected ✅");
  process.exit(0);
}

main().catch(async (e) => {
  console.error("Export error:", e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});