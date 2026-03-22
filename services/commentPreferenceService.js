const CommentPreference = require("../models/Comment-Preference-model");




async function getCommentSortType(userId, postId) {
  const commentPreference = await CommentPreference.findOne({userId: userId, postId: postId}).lean();

  return commentPreference.sortType;
}

async function updateCommentSortType(userId, postId) {

}

async function deleteCommentSortType(userId, postId) {

}



module.exports = {
  getCommentSortType,
  updateCommentSortType,
  deleteCommentSortType,
};
