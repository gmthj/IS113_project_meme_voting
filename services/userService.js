const User = require("../models/User-model");


const { timeAgo } = require("../utils/utils");
const {
    KARMA_TIER_0, 
    KARMA_TIER_1, 
    KARMA_TIER_2, 
    KARMA_TIER_3, 
    KARMA_NEW,
    VOTE_WEIGHTS
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
    user.karmaTier = getKarmaTier(user);
    user.joined = `${timeAgo(user.createdAt)} ago`;
    user.age = timeAgo(user.dob)
    

    return user;
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


module.exports = {
  getUserByEmail,
  getUserById,
  getVoteWeight,
};
