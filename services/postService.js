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

async function expandPosts(posts) {
  await Promise.all(posts.map(async (post) => {
    const user = await getUserById(post.userId.toString());
    const voteValue = await getVoteValue(post._id, user._id); //this is just checking self vote only TODO: update to current user when login session done
    
    post.postAge = timeAgo(post.upload_datetime);
    post.author = user;
    post.voteValue = voteValue;
  }));
  return posts
}


async function getAllPosts() {
  const posts = await Post.find().lean();

  return  await expandPosts(posts);
}


async function getPostById(postId) {
  const post = await Post.findOne({_id: postId}).lean();


  const user = await getUserById(post.userId.toString());
  const voteValue = await getVoteValue(post._id, user._id); //this is just checking self vote only TODO: update to current user when login session done
  
  post.postAge = timeAgo(post.upload_datetime);
  post.author = user;
  post.voteValue = voteValue;


  return post;
}



module.exports = {
  getPostByTitle,
  getAllPosts,
  getPostById,
  expandPosts
};
