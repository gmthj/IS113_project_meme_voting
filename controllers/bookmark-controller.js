

exports.hellokinyu = (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    const postId = req.body.postId


    // do bookmarking stuff



    
    const backURL = req.get('Referrer') || '/';
    res.redirect(`${backURL}#post-${postId}`)
}
