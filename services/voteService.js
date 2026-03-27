const Vote = require("../models/Vote-model");
const Post = require("../models/Post-model");



async function getPostVoteValue( postId , userId ) {
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
    console.log("error: getPostVoteValue - no postId or on userId receieved -", err)
    return undefined
  }
}

async function deletePostVote( postId , userId, isUpvote, isSelfVote, weight = 1 ) {
  try {
    await Vote.deleteOne({ postId, userId });
    await Post.updateOne({ _id: postId }, { $inc: { vote_score: isUpvote ? -1 * weight : 1 * weight,
                                                self_vote_score:  isSelfVote ? (isUpvote ? -1  * weight: 1 * weight) : 0}});
  }
  catch(err) {
    console.log("error: deletePostVote -", err)
  }
}

async function switchPostVote( postId , userId, isUpvote, isSelfVote, weight = 1 ) {
  try {
    await Vote.updateOne({ postId, userId }, { value: isUpvote });
    await Post.updateOne({ _id: postId }, { $inc: { vote_score: isUpvote ? 2  * weight: -2 * weight,
                                                self_vote_score:  isSelfVote ? (isUpvote ? 2  * weight: -2 * weight) : 0}});
  }
  catch(err) {
    console.log("error: switchPostVote -", err)
  }
}

async function newPostVote( postId , userId, isUpvote, isSelfVote, weight = 1 ) {
  try {
    await Vote.create({ postId, userId, value: isUpvote });
    await Post.updateOne({ _id: postId }, { $inc: { vote_score: isUpvote ? 1  * weight: -1 * weight,
                                                self_vote_score:  isSelfVote ? (isUpvote ? 1  * weight: -1 * weight) : 0}});
  }
  catch(err) {
    console.log("error: newPostVote -", err)
  }
}


module.exports = {
  getPostVoteValue,
  deletePostVote,
  switchPostVote,
  newPostVote
};
