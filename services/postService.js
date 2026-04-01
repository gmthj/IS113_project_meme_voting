const Post = require("../models/Post-model");

const { getUserById } = require("../services/userService");
const { getPostVoteValue } = require("../services/voteService");
const { getBookmarkValue } = require("../services/bookmarkService");
const { timeAgo } = require("../utils/utils");
const { getAllBookmarksByUserId } = require("./bookmarkService");


// adds the post's author's User obj and other details to each Post obj
async function expandPosts(posts, sessionUser = {}) {
  try {
    await Promise.all(
      posts.map(async (post) => {
        const author = await getUserById(post.userId.toString());
        const voteValue = await getPostVoteValue(post._id, sessionUser._id);
        const bookmark = await getBookmarkValue(post._id, sessionUser._id)

        post.postAge = timeAgo(post.upload_datetime);
        post.author = author;
        post.voteValue = voteValue;
        post.bookmark = bookmark;
      }),
    );
    return posts;
  } catch {
    console.log("expandPosts - no posts received or no sessionUser");
    return [];
  }
}

async function getPostById(postId, sessionUser = {}) {
  try {
    const post = await Post.findOne({ _id: postId }).lean();

    const expandedPosts = await expandPosts([post], sessionUser);
    return expandedPosts[0];
  } catch {
    console.log("getPostById - no postId received or no sessionUser");
    return {};
  }
}

async function getAllPosts(sessionUser = {}) {
  try {
    const posts = await Post.find().lean();
    return await expandPosts(posts, sessionUser);
  } catch {
    console.log("getAllPosts - no posts received or no sessionUser");
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

async function getPosts({ sessionUser = {}, userId = null, onlyBookmarks = false, sortType = 'highest-votes' }) {
  try {
    let filter = {};

    // Filter by user
    if (userId) {
      filter.userId = userId
    }

    // Filter by bookmarks
    if (onlyBookmarks && sessionUser._id) {
      const bookmarks = await getAllBookmarksByUserId(sessionUser._id);
      const bookmarkedPostIds = bookmarks.map(b => b.postId);

      // If there are no bookmarks, return empty array early
      if (bookmarkedPostIds.length === 0) return [];
      filter._id = { $in: bookmarkedPostIds };
    }

    // Sorting
    let sortOption = {};
    switch (sortType) {
      case 'highest-votes':
        sortOption = { vote_score: -1 };
        break;
      case 'lowest-votes':
        sortOption = { vote_score: 1 };
        break;
      case 'newest':
        sortOption = { upload_datetime: -1 };
        break;
      case 'oldest':
        sortOption = { upload_datetime: 1 };
        break;
      case 'most-comments':
        sortOption = { comment_count: -1 };
        break;
      case 'least-comments':
        sortOption = { comment_count: 1 };
        break;
      default:
        sortOption = { vote_score: -1 };
    }

    // Fetch posts from DB
    const posts = await Post.find(filter).sort(sortOption).lean();

    // Expand posts (add vote info, user interactions, etc.)
    return await expandPosts(posts, sessionUser);

  } catch (err) {
    console.log("Error in getPosts:", err);
    return [];
  }
}

module.exports = {
  // expandPosts,
  getPostById,
  getAllPosts,
  deletePostById,
  getPosts,
};