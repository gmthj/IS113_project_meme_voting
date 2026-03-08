const Post = require('../models/Post-model');
const Comment = require('../models/Comment-model');
const User = require('../models/User-model');

const { expandPosts, getPostById } = require('../services/postService')
const { expandComments, getAllCommentsByPostId } = require('../services/commentService')

exports.getFullPost = async (req, res) => {
    // get post data from db
    try {
        const postId = req.params.postId;

        if (!postId) {
            return res.status(400).send("Post ID missing.");
        }

        const [post, comments] = await Promise.all([
            getPostById(postId),
            getAllCommentsByPostId(postId)
        ]);

        // const posts = await expandPosts([rawPost]);
        // const comments = await expandComments(rawComments);

        res.render('fullpost', {post, comments, currentUser: ''});

    } catch (err) {
        console.error("Error: ", err);
        return res.status(500).send("Internal Server Error");
    }
}

exports.postComment = (req, res) => {
    // post comment
}