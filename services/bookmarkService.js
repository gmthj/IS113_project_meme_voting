const Bookmark = require("../models/Bookmark-model");



async function getAllBookmarksByUserId(userId) {
  const bookmarks = await Bookmark.find({userId: userId}).lean();

  return bookmarks;
}

// update bookmark
// delete bookmark


module.exports = {
  getAllBookmarksByUserId,
};
