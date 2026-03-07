const Post = require('../models/Post-model');
const Comment = require('../models/Comment-model');

exports.getFullPost = (req, res) => {
    // get post data from db
    res.render('fullpost', {})
}

exports.postComment = (req, res) => {
    // post comment
}