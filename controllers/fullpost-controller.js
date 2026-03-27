const Post = require('../models/Post-model');
const Comment = require('../models/Comment-model');
const User = require('../models/User-model');

const { expandPosts, getPostById } = require('../services/postService')
const { expandComments, getAllCommentsByPostId } = require('../services/commentService')

exports.getFullPost = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    // get post data from db
    try {
        const postId = req.params.postId;

        if (!postId) {
            return res.status(400).send("Post ID missing.");
        }

        const [post, comments] = await Promise.all([
            getPostById(postId, sessionUser),
            getAllCommentsByPostId(postId, sessionUser)
        ]);

        // const posts = await expandPosts([rawPost]);
        // const comments = await expandComments(rawComments);

        res.render('fullpost', {post, comments, currentUser: '', sessionUser});

    } catch (err) {
        console.error("Error: ", err);
        return res.status(500).send("Internal Server Error");
    }
}

exports.postComment = async (req, res) => {
    // post comment
    const sessionUser = req.session.sessionUser || {};

    try {
        const postId = req.params.postId;
        const { text } = req.body;

        if (!sessionUser._id) {
            return res.status(401).send("You must be logged in to comment.");
        }

        if (!text || text.trim() === "") {
            return res.status(400).send("Comment text is required.");
        }

        const newComment = new Comment({
            postId: postId,
            userId: sessionUser._id,
            text: text,
        });

        await newComment.save();

        await Post.findByIdAndUpdate(postId, {
            $inc: { comment_count: 1 }
        });

        return res.redirect(`/fullpost/${postId}`); 

    } catch (err) {
        console.error("Error posting comment: ", err);
        return res.status(500).send("Internal Server Error");
    }
};