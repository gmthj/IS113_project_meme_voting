const Post = require("../models/Post-model");



const { getUserById } = require("./userService");
const { getVoteValue } = require("../services/voteService");



function timeAgo(datetime) {
    const seconds = Math.floor((new Date() - datetime) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + "y ago"

    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + "m ago"

    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + "d ago"

    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + "h ago"

    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + "m ago"

    return Math.floor(seconds) + "s ago"
}


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

async function getAllPosts() {
  const posts = await Post.find().lean();

  const postsExtended = await Promise.all(
    posts.map(async (post) => {
      const user = await getUserById(post.userId.toString());
      const voteValue = await getVoteValue(post._id, user._id) //this is just checking self vote only TODO: update to current user when login session done
      
      return {
        ...post,
        postAge: timeAgo(post.upload_datetime),
        user,
        voteValue
      }
    })
  );

  return postsExtended
}


module.exports = {
  getPostByTitle,
  getAllPosts
};
