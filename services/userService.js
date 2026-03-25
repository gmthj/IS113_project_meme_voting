const User = require("../models/User-model");
const Post = require("../models/Post-model");

const { timeAgo } = require("../utils/utils");


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
    const karmaStats = await Post.aggregate(
      [
        { $match: {userId: user._id} },
        { $group: { 
            _id: "$userId", 
            totalPostVotes: { $sum: "$vote_score" },
            postCount: { $count: {} }
          }
        },
        { $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "userId",
            as: "userComments"
          }
        },
        { $addFields: {
            // TODO: switch when comment votes implemented
            // commentScore: { $sum: "$userComments.vote_score" },
            // finalKarma: {  $add: [ { $multiply: ["$totalPostVotes", 2] }, "$commentScore" ] }
            finalKarma: {  $add: [ { $multiply: ["$totalPostVotes", 2] }, 0 ] }
          }
        }
      ]
    );
  
    // console.log(karmaStats)
    // console.log(karmaStats[0].finalKarma)
    // getUserAccountAge(user)
    const karmaScore = karmaStats.length > 0 ? karmaStats[0].finalKarma : 0;
    const accountAgeDays = Math.ceil((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));


    let karmaTier = "Unknown";
    if (karmaScore < -5) karmaTier = "Troller";
    else if (accountAgeDays < 30) karmaTier = "Newcomer";
    else if (karmaScore < 10) karmaTier = "Lurker";
    else if (karmaScore < 50) karmaTier = "Apprentice";
    else if (karmaScore < 100) karmaTier = "Master";
    else karmaTier = "Legend";

    return {score: karmaScore, tier: karmaTier};
  }
  catch (error) {
    console.log("error: calculateKarma - ", error)
    throw new Error(`User karma failed`);
  }
};














async function getSortPreference(userId) {
    const user = await User.findById(userId).lean();
    return user?.sortPreference || 'highest-votes';
}

async function saveSortPreference(userId, sortType) {
    await User.findByIdAndUpdate(userId, { sortPreference: sortType });
}

async function deleteSortPreference(userId) {
    await User.findByIdAndUpdate(userId, { $unset: { sortPreference: "" } });
}


module.exports = {
  getUserByEmail,
  getUserById,
  getSortPreference,
  saveSortPreference,
  deleteSortPreference
};
