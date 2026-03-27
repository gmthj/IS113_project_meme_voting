const { deletePostVote, switchPostVote, newPostVote } = require("../services/voteService");


// /vote
exports.handleVote = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    // console.log(req.body)

    const voteDirection = req.body.vote
    const authorId = req.body.authorId
    const userId = req.body.userId //voter
    const postId = req.body.postId
    const voteValue = req.body.voteValue // "true" / "false"


    const currentVote = voteValue === "true" ? true : (voteValue === "false" ? false : null);
    const isUpvote = (voteDirection === "up");
    const isSelfVote = (authorId == userId);
    // console.log("selfvote ", isSelfVote)


    if (currentVote === isUpvote) {
        await deletePostVote( postId, userId, isUpvote, isSelfVote );
    }
    else if (currentVote !== null) {
        await switchPostVote( postId, userId, isUpvote, isSelfVote );
    }
    else {
        await newPostVote( postId, userId, isUpvote, isSelfVote );
    }


    const backURL = req.get('Referrer') || '/';
    res.redirect(`${backURL}#post-${postId}`)
}