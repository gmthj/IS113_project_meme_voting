const { deleteVote, switchVote, newVote } = require("../services/voteService");


// /vote
exports.handleVote = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    // console.log(req.body)

    const voteDirection = req.body.vote
    const userId = req.body.userId
    const postId = req.body.postId
    const voteValue = req.body.voteValue


    const currentVote = voteValue === "true" ? true : (voteValue === "false" ? false : null);
    const isUpvote = (voteDirection === "up");


    if (currentVote === isUpvote) {
        await deleteVote( postId, userId, isUpvote );
    }
    else if (currentVote !== null) {
        await switchVote( postId, userId, isUpvote );
    }
    else {
        await newVote( postId, userId, isUpvote );
    }


    const backURL = req.get('Referrer') || '/';
    res.redirect(`${backURL}#post-${postId}`)
}