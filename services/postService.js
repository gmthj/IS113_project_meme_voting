// const { ca } = require("zod/locales");
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
        const user = await getUserById(post.userId.toString());
        const voteValue = await getVoteValue(post._id, sessionUser._id); //this is just checking self vote only TODO: update to current user when login session done

        post.postAge = timeAgo(post.upload_datetime);
        post.author = user;
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

    const user = await getUserById(post.userId.toString());
    const voteValue = await getVoteValue(post._id, sessionUser._id); //this is just checking self vote only TODO: update to current user when login session done
    // const voteValue = await getVoteValue(post._id, user._id); //this is just checking self vote only TODO: update to current user when login session done

    post.postAge = timeAgo(post.upload_datetime);
    post.author = user;
    post.voteValue = voteValue;

    return post;
  } catch {
    console.log("error: getPostById - no postId received or no sessionUser");
    return {};
  }
}

module.exports = {
  getPostByTitle,
  getAllPosts,
  getPostById,
  expandPosts,
};
