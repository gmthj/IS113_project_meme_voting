const Post = require("../models/Post-model");
const Vote = require("../models/Vote-model");

// /vote
exports.handleVote = async (req, res) => {
    // console.log(req.body)

    const voteDirection = req.body.vote
    const userId = req.body.userId
    const postId = req.body.postId
    const voteValue = req.body.voteValue


    const currentVote = voteValue === "true" ? true : (voteValue === "false" ? false : null);
    const isUpvote = (voteDirection === "up");

    // remove vote
    if (currentVote === isUpvote) {
        await Vote.deleteOne({ postId, userId });
        await Post.updateOne({ _id: postId }, { $inc: { vote_score: isUpvote ? -1 : 1 } });
    }
    // switch vote
    else if (currentVote !== null) {
        await Vote.updateOne({ postId, userId }, { value: isUpvote });
        // If switching from Down (-1) to Up (+1), we need +2. Vice versa is -2.
        await Post.updateOne({ _id: postId }, { $inc: { vote_score: isUpvote ? 2 : -2 } });
    }
    // new vote
    else {
        await Vote.create({ postId, userId, value: isUpvote });
        await Post.updateOne({ _id: postId }, { $inc: { vote_score: isUpvote ? 1 : -1 } });
    }


    // voting
    // 
    // go back to origin page - fullpost user home

    const backURL = req.get('Referrer') || '/';
    res.redirect(`${backURL}#post-${postId}`)
}