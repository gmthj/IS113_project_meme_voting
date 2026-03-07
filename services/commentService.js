const Comment = require("../models/Comment-model");


const { getUserById } = require("../services/userService");

const { timeAgo } = require("../utils/utils");



async function expandComments(comments) {
  await Promise.all(comments.map(async (comment) => {
    const user = await getUserById(comment.userId.toString());
    
    comment.commentAge = timeAgo(comment.upload_datetime);
    comment.author = user;
  }));

  return comments;
}



async function getAllCommentsByPostId(postId) {
  const comments = await Comment.find({postId: postId}).lean();

  return await expandComments(comments);
}







module.exports = {
  getAllCommentsByPostId,
  expandComments
};
