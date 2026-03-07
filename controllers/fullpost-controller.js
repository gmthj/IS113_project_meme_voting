const Post = require('../models/Post-model');
const Comment = require('../models/Comment-model');
const User = require('../models/User-model');

exports.getFullPost = async (req, res) => {
    // get post data from db
    try {
        const postId = req.query.id;

        if (!postId) {
            return res.status(400).send("Post ID missing.");
        }

        const [post, comments] = await Promise.all([
            Post.findById(postId).populate('userId'),
            Comment.find({ postId }).populate('userId').sort({ createdAt: -1})
        ]);

        res.render('fullpost', {post, comments, currentUser: ''});

    } catch (err) {
        console.error("Error: ", err);
        return res.status(500).send("Internal Server Error");
    }
}

exports.postComment = (req, res) => {
    // post comment
}