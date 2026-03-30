const { 
    deletePostVote, 
    switchPostVote, 
    newPostVote, 
    deleteCommentVote, 
    switchCommentVote, 
    newCommentVote 
} = require("../services/voteService");


// /vote
exports.handlePostVote = async (req, res) => {
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

exports.handleCommentVote = async (req, res) => {
    const sessionUser = req.session.sessionuser || {};

    const voteDirection = req.body.vote
    const authorId = req.body.authorId
    const userId = req.body.userId //voter
    const commentId = req.body.commentId
    const voteValue = req.body.voteValue // "true" / "false"

    const currentVote = voteValue === "true" ? true : (voteValue === "false" ? false : null);
    const isUpvote = (voteDirection === "up");
    const isSelfVote = (authorId == userId);

    if (currentVote === isUpvote) {
        await deleteCommentVote( commentId, userId, isUpvote, isSelfVote );
    }
    else if (currentVote !== null) {
        await switchCommentVote( commentId, userId, isUpvote, isSelfVote );
    }
    else {
        await newCommentVote( commentId, userId, isUpvote, isSelfVote );
    }

    const backURL = req.get('Referrer') || '/';
    res.redirect(`${backURL}#comment-${commentId}`)
}