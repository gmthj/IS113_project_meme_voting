const { deletePostById } = require("../services/postService");
const { deleteCommentById } = require("../services/commentService");
const Post = require("../models/Post-model");
const { getUserById } = require("../services/userService");
const { timeAgo } = require("../utils/utils");

exports.renderDeletionConfirmation = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    const postId = req.body.postId;
    const postFromBody = req.body.post ? JSON.parse(req.body.post) : undefined;
    let post = postFromBody;
    const comment = req.body.comment ? JSON.parse(req.body.comment) : undefined;

    // Fallback fetch by postId so delete forms don't need to send large JSON payloads.
    if (!post && postId) {
        const rawPost = await Post.findById(postId).lean();
        if (rawPost) {
            post = rawPost;
            post.author = await getUserById(rawPost.userId.toString());
            post.postAge = timeAgo(rawPost.upload_datetime);
            post.voteValue = undefined;
            post.bookmark = false;
        }
    }

    const backURL = req.get('Referrer') || '/';
    return res.render("confirm-delete", {sessionUser, post, comment, backURL});

};

exports.handleDeletion = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    
    const postId = req.body.postId
    const commentId = req.body.commentId
    const backURL = req.body.backURL
    const confirm = (req.body.confirm == "true")

    // console.log("cfm del", backURL)


    if (confirm) {
        const delStatus = postId ? await deletePostById(postId) : await deleteCommentById(commentId)
        console.log("delete status: ", delStatus)

        if (backURL.includes("fullpost") && postId) {
            return res.redirect("/home")
        }
    }

    return res.redirect(`${backURL}#post-${postId}`)

}
