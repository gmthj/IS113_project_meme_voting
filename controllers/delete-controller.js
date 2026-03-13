exports.handleDeletion = (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    // console.log(req.body)
    const post = JSON.parse(req.body.post) || {}
    
    
    
    const backURL = req.get('Referrer') || '/';
    res.render("confirm-delete", {sessionUser, post, comment: {}, backURL})

}


exports.handleDeletionConfirm = (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    
    const postId = req.body.postId
    const backURL = req.body.backURL

    // console.log("hello del cfm", req.body)

    // are you sure
    // if commment del comment
    // if post del post
    
    // TODO: delete in DB
    // TODO: handle cancel



    console.log("cfm del", backURL)
    if (backURL.includes("fullpost")) {
        res.redirect("/home")
    }
    else {
        res.redirect(`${backURL}#post-${postId}`)
    }
}