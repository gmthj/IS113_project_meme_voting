exports.renderUserProfile = (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    
    const userId = req.params.userId;



    res.render('user', {sessionUser})
}