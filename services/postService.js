const Post = require("../models/Post");

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

module.exports = {
  getPostByTitle,
};
