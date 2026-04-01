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

  // 3) Nuke everything
  // await CommentPreference.deleteMany({});
  // await PostPreference.deleteMany({});
  // await Bookmark.deleteMany({});
  // await Vote.deleteMany({});
  // await Comment.deleteMany({});
  // await Post.deleteMany({});
  // await User.deleteMany({});
  // console.log("Collections cleared ✅");

  await mongoose.disconnect();
  console.log("\nDisconnected ✅");
  process.exit(0);
}




const readline = require("readline");

const uri = process.env.MONGO_URI;
const dbName = new URL(uri).pathname.substring(1);
const location = uri.includes(".mongodb.net") ? "ATLAS" : "LOCAL";

console.log(`\nWrite to: (${location}) ${dbName}\n`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Proceed? (y/n): ", (answer) => {
  const input = answer.trim().toLowerCase();

  if (input === "y" || input === "yes") {
    console.log("✅ Proceeding...\n");
    rl.close();

    // 👉 Put your main logic here
    main().catch(async (e) => {
      console.error("clearDB error:", e);
      try { await mongoose.disconnect(); } catch {}
      process.exit(1);
    });
  } else {
    console.log("❌ Operation cancelled. Exiting...");
    rl.close();
    process.exit(0);
  }
});


