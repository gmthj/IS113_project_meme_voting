const User = require("../models/User-model");
const Post = require("../models/Post-model");
const Comment = require("../models/Comment-model");

const { timeAgo } = require("../utils/utils");
const {
    KARMA_TIER_0, 
    KARMA_TIER_1, 
    KARMA_TIER_2, 
    KARMA_TIER_3, 
    KARMA_NEW
} = require("../config");


async function getUserByEmail(email) {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error(`User ${email} not found`);
  }

  return user;
}

async function getUserById(userId) {
  try {
    const user = await User.findById(userId).lean();
    user.karma = await calculateKarma(user);
    user.joined = timeAgo(user.createdAt);
    
    return user;
  }
  catch(error) {
    // console.log("Error: getUserById -", error)
    throw new Error(`User not found`);
  }
}


async function calculateKarma(user) {
  try {
    if (!user) return 0;

    const postStats = await Post.aggregate([
        { $match: { userId: user._id } },
        { $group: { 
            _id: null, 
            netScore: { $sum: { $subtract: ["$vote_score", "$self_vote_score"] } } 
        }}
    ]);

    const commentStats = await Comment.aggregate([
        { $match: { userId: user._id } },
        { $group: { 
            _id: null, 
            netScore: { $sum: { $subtract: ["$vote_score", "$self_vote_score"] } } 
        }}
    ]);
    // console.log("postStats")
    // console.log(postStats)
    // console.log("commentStats")
    // console.log(commentStats)

    const postKarmaScore = postStats.length > 0 ? postStats[0].netScore : 0;
    const commentKarmaScore = commentStats.length > 0 ? commentStats[0].netScore : 0;
    const finalKarmaScore = (postKarmaScore * 2) + commentKarmaScore;


    const accountAgeDays = Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));

    let karmaTier = "Unknown";
    if (finalKarmaScore < KARMA_TIER_0) karmaTier = "Troller"; // -5 karma
    else if (accountAgeDays < KARMA_NEW) karmaTier = "Newcomer"; // < 30 days
    else if (finalKarmaScore < KARMA_TIER_1) karmaTier = "Lurker"; // < 10 karma
    else if (finalKarmaScore < KARMA_TIER_2) karmaTier = "Apprentice"; // < 50 karma
    else if (finalKarmaScore < KARMA_TIER_3) karmaTier = "Master"; // < 100 karma
    else karmaTier = "Legend"; // >= 100 karma

    return {score: finalKarmaScore, tier: karmaTier};
  }
  catch (error) {
    console.log("error: calculateKarma - ", error)
    throw new Error(`User karma failed`);
  }
};



module.exports = {
  getUserByEmail,
  getUserById,
};
