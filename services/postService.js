const Post = require("../models/Post-model");

const { getUserById } = require("../services/userService");
const { getVoteValue } = require("../services/voteService");
const { getBookmarkValue } = require("../services/bookmarkService");
const { timeAgo } = require("../utils/utils");
const { getAllBookmarksByUserId } = require("./bookmarkService");


// adds the post's author's User obj and other details to each Post obj
async function expandPosts(posts, sessionUser = {}) {
  try {
    await Promise.all(
      posts.map(async (post) => {
        const author = await getUserById(post.userId.toString());
        const voteValue = await getVoteValue(post._id, sessionUser._id);
        const bookmark = await getBookmarkValue(post._id, sessionUser._id)

        post.postAge = timeAgo(post.upload_datetime);
        post.author = author;
        post.voteValue = voteValue;
        post.bookmark = bookmark;
      }),
    );
    return posts;
  } catch {
    console.log("error: expandPosts - no posts received or no sessionUser");
    return [];
  }
}




async function getPostById(postId, sessionUser = {}) {
  try {
    const post = await Post.findOne({ _id: postId }).lean();

    const expandedPosts = await expandPosts([post], sessionUser);
    return expandedPosts[0];
  } catch {
    console.log("error: getPostById - no postId received or no sessionUser");
    return {};
  }
}

async function getAllPosts(sessionUser = {}) {
  try {
    const posts = await Post.find().lean();
    return await expandPosts(posts, sessionUser);
  } catch {
    console.log("error: getAllPosts - no posts received or no sessionUser");
    return [];
  }
}


async function getAllPostsSorted(sortType = 'highest-votes', sessionUser = {}) {
  try {
    let sortOption = {};
  
    if (sortType === 'highest-votes') sortOption = { vote_score: -1 };
    else if (sortType === 'lowest-votes') sortOption = { vote_score: 1 };
    else if (sortType === 'newest') sortOption = { upload_datetime: -1 };
    else if (sortType === 'oldest') sortOption = { upload_datetime: 1 };
    else if (sortType === 'most-comments') sortOption = { comment_count: -1 };
    else if (sortType === 'least-comments') sortOption = { comment_count: 1 };
    else sortOption = { vote_score: -1 }; // fallback default
  
    const posts = await Post.find().sort(sortOption).lean();
    return await expandPosts(posts, sessionUser);
  } catch {
    console.log("error: getAllPostsSorted - no posts received or no sessionUser");
    return [];
  }
}



async function deletePostById(postId) {
  try {
    await Post.findByIdAndDelete({ _id: postId });

    return true;
  } catch {
    console.log("error: deletePostById - failed to delete post");
    return false;
  }
}


// Get posts by userid
async function getPostsByUserId(userId, sessionUser) {
  try {
    let posts = await Post.find( {userId} ).lean()
    return await expandPosts(posts, sessionUser)
  } catch (error) {
    console.log("Error finding post by userId:", error)
  }
}

async function getBookmarkedPosts(sessionUser) {
    try {
        const bookmarks = await getAllBookmarksByUserId(sessionUser._id);
        const postIds = bookmarks.map(b => b.postId);
        const posts = await Post.find({ _id: { $in: postIds } }).lean();
        return await expandPosts(posts, sessionUser);
    } catch (err) {
        console.log("error: getBookmarkedPosts", err);
        return [];
    }
}

module.exports = {
  // expandPosts,
  getPostById,
  getAllPosts,
  getAllPostsSorted,
  deletePostById,
  getPostsByUserId,
  getBookmarkedPosts,  
};