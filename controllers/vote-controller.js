const Post = require("../models/Post-model");
const Vote = require("../models/Vote-model");

// /vote
exports.handleVote = async (req, res) => {
    console.log(req.body)

    const voteDirection = req.body.vote
    const userId = req.body.userId
    const postId = req.body.postId
    const voteValue = req.body.voteValue


    if (voteDirection === "up") {
        if (voteValue === undefined){
            await Vote.create({ postId, userId, value: true });
        }
        else {
            await Vote.updateOne({ postId, userId}, {value: true });
        }
        await Post.updateOne({ _id: postId }, { $inc: { vote_score: 1 } });
    }
    if (voteDirection === "down") {
        if (voteValue === undefined){
            await Vote.create({ postId, userId, value: false });
        }
        else {
            await Vote.updateOne({ postId, userId}, {value: false });
        }
        await Post.updateOne({ _id: postId }, { $inc: { vote_score: -1 } });
    }


    // voting
    // 
    // go back to origin page - fullpost user home

    const backURL = req.get('Referrer') || '/';
    res.redirect(`${backURL}#post-${postId}`)
}