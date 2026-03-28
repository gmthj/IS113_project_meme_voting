const Post = require('../models/Post-model');
const Comment = require('../models/Comment-model');
const User = require('../models/User-model');

const CommentPreference = require("../models/Comment-Preference-model");

const { expandPosts, getPostById } = require('../services/postService');
const { expandComments, getAllCommentsByPostId } = require('../services/commentService');
const { getCommentSortType, updateCommentSortType } = require('../services/commentPreferenceService');

exports.getFullPost = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    try {
        const postId = req.params.postId;
        if (!postId) return res.status(400).send("Post ID missing.");

        let sortType;

        if (sessionUser && sessionUser._id) {
            if (req.query.sort) {
                sortType = req.query.sort;
                await updateCommentSortType(sessionUser._id, postId, sortType);
                return res.redirect(`/fullpost/${postId}`)
            } else {
                sortType = await getCommentSortType(sessionUser._id, postId);
            }

        } else {
            sortType = req.query.sort || 'newest';
        }

        const [post, comments] = await Promise.all([
            getPostById(postId, sessionUser),
            getAllCommentsByPostId(postId, sessionUser, sortType)
        ]);

        res.render('fullpost', { post, comments, sessionUser, currentSort: sortType });
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