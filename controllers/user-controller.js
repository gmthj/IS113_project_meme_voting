// Import user service
const User = require('./../services/userService')

// Import post service
const { expandPosts, getPostById, getPostByUserId } = require('../services/postService')

exports.renderUserProfile = async (req, res) => {

    try {
        const sessionUser = req.session.sessionUser || {};
        const userId = req.params.userId;
    
        // Retrieve userInfo
        let userInfo = await User.getUserById(userId);
    
        // Retrieve post info
        let userPost = await getPostByUserId(userId, sessionUser)
        console.log(userPost)
    
        res.render('user', {sessionUser, userInfo, userPost})
    } catch (error) {
        console.log("Error renderUserProfile:", error)
    }
}