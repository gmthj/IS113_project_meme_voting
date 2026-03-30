const { updatePostById } = require("../services/postService");
const { updateCommentById } = require("../services/commentService");

exports.renderEditComment = (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    
    const post = req.body.post ? JSON.parse(req.body.post) : undefined;
    const comment = req.body.comment ? JSON.parse(req.body.comment) : undefined;
    
    const backURL = req.get('Referrer') || '/';
    
    res.render("editcomment", { sessionUser, post, comment, backURL });
}

exports.handleEditConfirm = async (req, res) => {
    const postId = req.body.postId;
    const commentId = req.body.commentId;
    const backURL = req.body.backURL;
    const updatedText = req.body.updatedText;
    const isCancel = req.body.cancel === "true";

    if (!isCancel) {
        if (commentId) {
            await updateCommentById(commentId, updatedText);
        }
    }

    res.redirect(`${backURL}#post-${postId}`)
}