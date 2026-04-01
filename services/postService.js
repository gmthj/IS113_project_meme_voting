const Post = require("../models/Post-model");
const Image = require("../models/Image-model");

const { getUserById } = require("../services/userService");
const { getPostVoteValue } = require("../services/voteService");
const { getBookmarkValue } = require("../services/bookmarkService");
const { timeAgo } = require("../utils/utils");
const { getAllBookmarksByUserId } = require("./bookmarkService");
const { deleteCommentsByPostId } = require("../services/commentService");

// adds the post's author's User obj and other details to each Post obj
async function expandPosts(posts, sessionUser = {}) {
  try {
    await Promise.all(
      posts.map(async (post) => {
        const author = await getUserById(post.userId.toString());
        const voteValue = await getPostVoteValue(post._id, sessionUser._id);
        const bookmarkValue = await getBookmarkValue(post._id, sessionUser._id);

        post.postAge = `${timeAgo(post.upload_datetime)} ago`;
        post.author = author;
        post.voteValue = voteValue;
        post.bookmark = bookmarkValue;
        post.image = post.imageId
          ? `/media/images/${post.imageId}`
          : post.image;
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
    const deletedPost = await Post.findByIdAndDelete({ _id: postId });

    if (deletedPost?.imageId) {
      await Image.findByIdAndDelete(deletedPost.imageId);
    }

    await deleteCommentsByPostId(postId);

    return true;
  } catch {
    console.log("error: deletePostById - failed to delete post");
    return false;
  }
}

async function getPosts({
  sessionUser = {},
  userId = null,
  onlyBookmarks = false,
  sortType = "highest-votes",
  limit = null,
  page = 1,
  returnMeta = false,
}) {
  try {
    let filter = {};

    // Filter by user
    if (userId) {
      filter.userId = userId;
    }

    // Filter by bookmarks
    if (onlyBookmarks && sessionUser._id) {
      const bookmarks = await getAllBookmarksByUserId(sessionUser._id);
      const bookmarkedPostIds = bookmarks.map((b) => b.postId);

      // If there are no bookmarks, return empty array early
      if (bookmarkedPostIds.length === 0) {
        if (returnMeta) {
          return {
            posts: [],
            totalPosts: 0,
            totalPages: 1,
            currentPage: 1,
          };
        }
        return [];
      }
      filter._id = { $in: bookmarkedPostIds };
    }

    // Sorting
    let sortOption = {};
    switch (sortType) {
      case "highest-votes":
        sortOption = { vote_score: -1 };
        break;
      case "lowest-votes":
        sortOption = { vote_score: 1 };
        break;
      case "newest":
        sortOption = { upload_datetime: -1 };
        break;
      case "oldest":
        sortOption = { upload_datetime: 1 };
        break;
      case "most-comments":
        sortOption = { comment_count: -1 };
        break;
      case "least-comments":
        sortOption = { comment_count: 1 };
        break;
      default:
        sortOption = { vote_score: -1 };
    }

    const isPaged = Number.isInteger(limit) && limit > 0;
    const parsedPage = parseInt(page, 10);
    let currentPage =
      Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    let totalPosts = 0;
    let totalPages = 1;

    let query = Post.find(filter).sort(sortOption);

    if (isPaged) {
      totalPosts = await Post.countDocuments(filter);
      totalPages = Math.max(1, Math.ceil(totalPosts / limit));
      currentPage = Math.min(currentPage, totalPages);
      const skip = (currentPage - 1) * limit;
      query = query.skip(skip);
      query = query.limit(limit);
    }

    const posts = await query.lean();

    // Expand posts (add vote info, user interactions, etc.)
    const expandedPosts = await expandPosts(posts, sessionUser);

    if (returnMeta) {
      return {
        posts: expandedPosts,
        totalPosts,
        totalPages,
        currentPage,
      };
    }

    return expandedPosts;
  } catch (err) {
    console.log("Error in getPosts:", err);
    if (returnMeta) {
      return {
        posts: [],
        totalPosts: 0,
        totalPages: 1,
        currentPage: 1,
      };
    }
    return [];
  }
}

async function createPost({ userId, title, description, parsedImage }) {
  try {
    let savedImage = null;
    if (parsedImage && !parsedImage.error) {
      savedImage = await Image.create({
        data: parsedImage.buffer,
        mimeType: parsedImage.mimeType,
        sizeBytes: parsedImage.fileSizeInBytes
      });
    }

    const newPost = new Post({
      userId,
      title: title.trim(),
      description: description.trim(),
      imageId: savedImage ? savedImage._id : null
    });

    await newPost.save();
    return newPost;
  } catch (err) {
    console.error("error: createPost - failed to create post", err);
    throw err;
  }
}

async function updatePost({ postId, title, description, parsedImage }) {
  try {
    const postData = await Post.findById(postId);
    if (!postData) {
      throw new Error("Post not found");
    }

    postData.title = title.trim();
    postData.description = description.trim();

    if (parsedImage && !parsedImage.error) {
      const savedImage = await Image.create({
        data: parsedImage.buffer,
        mimeType: parsedImage.mimeType,
        sizeBytes: parsedImage.fileSizeInBytes
      });

      if (postData.imageId) {
        await Image.findByIdAndDelete(postData.imageId);
      }

      postData.imageId = savedImage._id;
      postData.image = null;
    }

    postData.edit_datetime = new Date();
    await postData.save();

    return postData;
  } catch (err) {
    console.error("error: updatePost - failed to update post", err);
    throw err;
  }
}

module.exports = {
  // expandPosts,
  getPostById,
  getAllPosts,
  deletePostById,
  getPosts,
  createPost,
  updatePost,
};
