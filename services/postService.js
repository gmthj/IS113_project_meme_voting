const Post = require("../models/Post-model");

const { getUserById } = require("../services/userService");
const { getVoteValue } = require("../services/voteService");
const { timeAgo } = require("../utils/utils");

/**
 * Get post by title
 */
async function getPostByTitle(title) {
  const post = await Post.findOne({ title: title });

  if (!post) {
    throw new Error(`Post with title "${title}" not found`);
  }

  return post;
}

async function expandPosts(posts, sessionUser = {}) {
  try {
    await Promise.all(
      posts.map(async (post) => {
        const author = await getUserById(post.userId.toString());
        const voteValue = await getVoteValue(post._id, sessionUser._id);

        post.postAge = timeAgo(post.upload_datetime);
        post.author = author;
        post.voteValue = voteValue;
      }),
    );
    return posts;
  } catch {
    console.log("error: expandPosts - no posts received or no sessionUser");
    return [];
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

async function getPostById(postId, sessionUser = {}) {
  try {
    const post = await Post.findOne({ _id: postId }).lean();

    const author = await getUserById(post.userId.toString());
    const voteValue = await getVoteValue(post._id, sessionUser._id);

    post.postAge = timeAgo(post.upload_datetime);
    post.author = author;
    post.voteValue = voteValue;

    return post;
  } catch {
    console.log("error: getPostById - no postId received or no sessionUser");
    return {};
  }
}



async function getAllPostsSorted(sortType = 'highest', sessionUser = {}) {
  try {
    let sortOption = {};
  
    if (sortType === 'highest') sortOption = { vote_score: -1 };
    else if (sortType === 'lowest') sortOption = { vote_score: 1 };
    else if (sortType === 'newest') sortOption = { upload_datetime: -1 };
    else if (sortType === 'oldest') sortOption = { upload_datetime: 1 };
    else if (sortType === 'comments') sortOption = { comment_count: -1 };
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


module.exports = {
  getPostByTitle,
  getAllPosts,
  getAllPostsSorted,
  getPostById,
  expandPosts,
  deletePostById,
};
