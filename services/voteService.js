const Vote = require("../models/Vote-model");
const Post = require("../models/Post-model");



async function getVoteValue( postId , userId ) {
  try {
    const voteValue = await Vote.findOne({ postId , userId}).lean();

    if (voteValue === null){
      return undefined
    }
    else{
      return voteValue.value;
    }
  }
  catch(err) {
    console.log("error: getVoteValue - no postId or on userId receieved -", err)
    return undefined
  }
}



async function deleteVote( postId , userId, isUpvote ) {
  try {
    await Vote.deleteOne({ postId, userId });
    await Post.updateOne({ _id: postId }, { $inc: { vote_score: isUpvote ? -1 : 1 } });
  }
  catch(err) {
    console.log("error: deleteVote -", err)
  }
}

async function switchVote( postId , userId, isUpvote ) {
  try {
    await Vote.updateOne({ postId, userId }, { value: isUpvote });
    await Post.updateOne({ _id: postId }, { $inc: { vote_score: isUpvote ? 2 : -2 } });
  }
  catch(err) {
    console.log("error: switchVote -", err)
  }
}

async function newVote( postId , userId, isUpvote ) {
  try {
    await Vote.create({ postId, userId, value: isUpvote });
    await Post.updateOne({ _id: postId }, { $inc: { vote_score: isUpvote ? 1 : -1 } });
  }
  catch(err) {
    console.log("error: newVote -", err)
  }
}


module.exports = {
  getVoteValue,
  deleteVote,
  switchVote,
  newVote
};
