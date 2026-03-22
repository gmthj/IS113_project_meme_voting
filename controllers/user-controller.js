// Import user service
const User = require('./../services/userService')

exports.renderUserProfile = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    const userId = req.params.userId;

    // Retrieve userInfo
    let userInfo = await User.getUserById(userId);
    console.log(userInfo);




    res.render('user', {sessionUser, userInfo})
}