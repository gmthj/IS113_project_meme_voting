exports.handleDeletion = (req, res) => {
    const sessionUser = req.session.sessionUser || {};

    // if commment del comment
    // if post del post
    // 
    // go back to origin page - fullpost user home
    res.redirect('back')
}