const User = require("../models/User-model");
const Post = require("../models/Post-model");
const Comment = require("../models/Comment-model");
const Vote = require("../models/Vote-model");
const Bookmark = require("../models/Bookmark-model");
const PostPreference = require("../models/Post-Preference-model");
const CommentPreference = require("../models/Comment-Preference-model");
const Image = require("../models/Image-model");


const { timeAgo } = require("../utils/utils");
const {
    KARMA_TIER_0, 
    KARMA_TIER_1, 
    KARMA_TIER_2, 
    KARMA_TIER_3, 
    KARMA_NEW,
    VOTE_WEIGHTS
} = require("../config");


async function expandUser(user) {
  try {
    user.karmaTier = getKarmaTier(user);
    user.joined = `${timeAgo(user.createdAt)} ago`;
    user.age = timeAgo(user.dob);
    user.postCount = await Post.countDocuments({ userId: user._id });
    user.commentCount = await Comment.countDocuments({ userId: user._id });
    return user;
  }
  catch(error) {
    throw new Error(`expandUser - failed to expand user`);
  }
}

async function getUserByEmail(email) {
  try {
    const user = await User.findOne({ email: email }).lean();
    return await expandUser(user);
  }
  catch(error) {
    throw new Error(`User ${email} not found`);
  }
}

async function getUserById(userId) {
  try {
    const user = await User.findById(userId).lean();
    return await expandUser(user);
  }
  catch(error) {
    // console.log("Error: getUserById -", error)
    throw new Error(`User not found`);
  }
}


function getKarmaTier(user) {
  try {
    // console.log("efqwef", user)
    let karmaTier = "Unknown";

    if (!user) return karmaTier;

    const accountAgeDays = Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 86400));

    // see config.js for karma tier thresholds
    if (user.totalKarma < KARMA_TIER_0) karmaTier = "Troller"; // -5 karma
    else if (accountAgeDays < KARMA_NEW) karmaTier = "Newcomer"; // < 30 days
    else if (user.totalKarma < KARMA_TIER_1) karmaTier = "Lurker"; // < 10 karma
    else if (user.totalKarma < KARMA_TIER_2) karmaTier = "Apprentice"; // < 50 karma
    else if (user.totalKarma < KARMA_TIER_3) karmaTier = "Master"; // < 100 karma
    else karmaTier = "Legend"; // >= 100 karma

    // console.log(karmaTier)
    return karmaTier;
  }
  catch (error) {
    console.log("error: getKarmaTier - ", error)
    throw new Error(`User karma failed`);
  }
};

async function getVoteWeight(userId){
  const user = await User.findById(userId).lean();
  return VOTE_WEIGHTS[getKarmaTier(user)];
}


async function deleteUserById(userId) {
  try {
    const userPosts = await Post.find({ userId });
    const postIds = userPosts.map(p => p._id);
    
    // delete posts and posts' dependencies
    if (postIds.length > 0) {
      const postComments = await Comment.find({ postId: { $in: postIds } });
      const commentIds = postComments.map(c => c._id);
      
      await Vote.deleteMany({ commentId: { $in: commentIds } });
      await Comment.deleteMany({ postId: { $in: postIds } });
      await Vote.deleteMany({ postId: { $in: postIds } });
      await Bookmark.deleteMany({ postId: { $in: postIds } });
      await CommentPreference.deleteMany({ postId: { $in: postIds } });
      
      const imageIds = userPosts.map(p => p.imageId).filter(id => id);
      if (imageIds.length > 0) {
        await Image.deleteMany({ _id: { $in: imageIds } });
      }
      await Post.deleteMany({ _id: { $in: postIds } });
    }

    // delete comments and comments' dependencies
    const userComments = await Comment.find({ userId });
    if (userComments.length > 0) {
      const userCommentIds = userComments.map(c => c._id);
      await Vote.deleteMany({ commentId: { $in: userCommentIds } });

      const postCommentCounts = {};
      for (const c of userComments) {
        if (!postCommentCounts[c.postId]) postCommentCounts[c.postId] = 0;
        postCommentCounts[c.postId]++;
      }
      for (const [postId, count] of Object.entries(postCommentCounts)) {
        await Post.updateOne({ _id: postId }, { $inc: { comment_count: -count } });
      }
      await Comment.deleteMany({ userId });
    }

    await Vote.deleteMany({ userId });
    await Bookmark.deleteMany({ userId });
    await PostPreference.deleteMany({ userId });
    await CommentPreference.deleteMany({ userId });

    await User.findByIdAndDelete(userId);
    return true;
  } catch (error) {
    console.error("Error deleting user by ID:", error);
    throw new Error("Failed to delete user");
  }
}


module.exports = {
  getUserByEmail,
  getUserById,
  getVoteWeight,
  deleteUserById,
};
