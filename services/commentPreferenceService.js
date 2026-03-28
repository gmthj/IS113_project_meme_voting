const CommentPreference = require("../models/Comment-Preference-model");




async function getCommentSortType(userId, postId) {
  const commentPreference = await CommentPreference.findOne({userId: userId, postId: postId}).lean();
  return commentPreference?.sortType || 'newest';
}

async function updateCommentSortType(userId, postId, sortType) {
  await CommentPreference.findOneAndUpdate(
    { userId, postId },
    { sortType },
    { upsert: true, returnDocument: 'after' } 
  );
}

// async function deleteCommentSortType(userId, postId) {
//   await CommentPreference.deleteOne({ userId, postId });
// }



module.exports = {
  getCommentSortType,
  updateCommentSortType,
  // deleteCommentSortType,
};
