const { deletePostById, getPostById } = require("../services/postService");
const { deleteCommentById } = require("../services/commentService");

exports.renderDeletionConfirmation = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    const postId = req.body.postId;
    const postFromBody = req.body.post ? JSON.parse(req.body.post) : undefined;
    let post = postFromBody;
    const comment = req.body.comment ? JSON.parse(req.body.comment) : undefined;

    if (!post && postId) {
        post = await getPostById(postId, sessionUser)
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
