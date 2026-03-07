const Post = require('../models/Post-model');
const Comment = require('../models/Comment-model');
const User = require('../models/User-model');

const { expandPosts } = require('../services/postService')
const { expandComments } = require('../services/commentService')

exports.getFullPost = async (req, res) => {
    // get post data from db
    try {
        // const postId = req.query.id;
        const postId = req.params.postId;

        if (!postId) {
            return res.status(400).send("Post ID missing.");
        }

        const [rawPost, rawComments] = await Promise.all([
            // Post.findById(postId).populate('userId'),
            Post.findById(postId).lean(),
            Comment.find({ postId }).sort({ createdAt: -1})
        ]);

        const posts = await expandPosts([rawPost]);
        const comments = await expandComments(rawComments);

        res.render('fullpost', {post: posts[0], comments, currentUser: ''});

    } catch (err) {
        console.error("Error: ", err);
        return res.status(500).send("Internal Server Error");
    }
}

exports.postComment = (req, res) => {
    // post comment
}