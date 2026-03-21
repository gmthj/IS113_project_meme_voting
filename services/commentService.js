const Comment = require("../models/Comment-model");


const { getUserById } = require("../services/userService");

const { timeAgo } = require("../utils/utils");



async function expandComments(comments) {
  await Promise.all(comments.map(async (comment) => {
    const author = await getUserById(comment.userId.toString());
    
    comment.commentAge = timeAgo(comment.upload_datetime);
    comment.author = author;
  }));

  return comments;
}

async function getAllCommentsByPostId(postId) {
  const comments = await Comment.find({postId: postId}).lean();

  return await expandComments(comments);
}

async function updateCommentById(commentId, updatedText) {
  try {
    await Comment.findByIdAndUpdate(commentId, { 
      text: updatedText,
      edit_datetime: Date.now()
    });

    return true;
  } catch (err) {
    console.log("error: updateCommentById - failed to update comment", err);
    return false;
  }
}

async function deleteCommentById(commentId) {
  try {
    await Comment.findByIdAndDelete({ _id: commentId });

    return true;
  } catch {
    console.log("error: deleteCommentById - failed to delete comment");
    return false;
  }
}


module.exports = {
  getAllCommentsByPostId,
  expandComments,
  updateCommentById,
  deleteCommentById
};
