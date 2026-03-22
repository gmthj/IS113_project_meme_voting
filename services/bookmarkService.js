const Bookmark = require("../models/Bookmark-model");



async function getBookmarkValue(postId, userId) {
  const bookmark = await Bookmark.findOne({userId: userId, postId: postId}).lean();
  // console.log(bookmark)

  return bookmark != null;
}

async function getAllBookmarksByUserId(userId) {
  // hello kinyu
  const bookmarks = await Bookmark.find({userId: userId}).lean();

  return bookmarks;
}

// create bookmark
async function addBookmark(postId, userId) {
  const newBookmark = await Bookmark.create( { userId, postId } )

  return newBookmark
}


// update bookmark


// delete bookmark


module.exports = {
  getBookmarkValue,
  getAllBookmarksByUserId,
};
