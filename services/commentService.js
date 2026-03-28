const Comment = require("../models/Comment-model");
const Post = require("../models/Post-model");

const { getUserById } = require("../services/userService");
const { timeAgo } = require("../utils/utils");


const { getCommentVoteValue } = require("../services/voteService"); 

async function expandComments(comments, sessionUser = {}) {
  await Promise.all(comments.map(async (comment) => {
    const author = await getUserById(comment.userId.toString());
    
    const voteValue = await getCommentVoteValue(comment._id, sessionUser._id);

    comment.commentAge = timeAgo(comment.upload_datetime);
    comment.author = author;
    
    comment.voteValue = voteValue; 
  }));

  return comments;
}

async function getAllCommentsByPostId(postId, sessionUser = {}) {
  const comments = await Comment.find({postId: postId}).lean();

  return await expandComments(comments, sessionUser);
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
    const deletedComment = await Comment.findByIdAndDelete({ _id: commentId });
    console.log(deletedComment.postId);

    if (deletedComment && deletedComment.postId) {
      const postId = deletedComment.postId.toString();
      await Post.findByIdAndUpdate(postId, {
        $inc: { comment_count: -1}
      });
    }

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