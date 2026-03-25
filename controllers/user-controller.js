// Import user service
const User = require('./../services/userService')

// Import post service
const { expandPosts, getPostById, getPostsByUserId } = require('../services/postService')

exports.renderUserProfile = async (req, res) => {

    const sessionUser = req.session.sessionUser || {};
    try {
        const userId = req.params.userId;
        // console.log(userId)
    
        // Retrieve userInfo
        let userInfo = await User.getUserById(userId);
    
        // Retrieve post info
        let userPost = await getPostsByUserId(userId, sessionUser)
        // console.log(userPost)
    
        res.render('user', {sessionUser, userInfo, userPost})
    } catch (error) {
        console.log("Error renderUserProfile:", error)
        return res.render('error', { sessionUser, error });
    }
}