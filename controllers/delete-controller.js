const { deletePostById } = require("../services/postService");
const { deleteCommentById } = require("../services/commentService");

exports.handleDeletion = (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    // console.log(req.body)
    const post = req.body.post ? JSON.parse(req.body.post) : undefined
    const comment = req.body.comment ? JSON.parse(req.body.comment) : undefined

    // console.log("post", post)
    // console.log("comment", comment)
    
    
    const backURL = req.get('Referrer') || '/';
    res.render("confirm-delete", {sessionUser, post, comment, backURL})

}


exports.handleDeletionConfirm = async (req, res) => {
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
            res.redirect("/home")
        }
    }

    res.redirect(`${backURL}#post-${postId}`)
    // TODO: test redirect back to user page

}