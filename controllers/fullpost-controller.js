const Comment = require("../models/Comment-model");

const { getPostById } = require("../services/postService");
const { getAllCommentsByPostId } = require("../services/commentService");
const { getCommentSortType, updateCommentSortType } = require("../services/commentPreferenceService");

exports.renderFullPost = async (req, res) => {
  const sessionUser = req.session.sessionUser || {};

  try {
    const postId = req.params.postId;
    if (!postId)
      return res
        .status(400)
        .render("error", { sessionUser, error: "Post ID missing." });

    let sortType;

    if (sessionUser && sessionUser._id) {
      if (req.query.sort) {
        sortType = req.query.sort;
        await updateCommentSortType(sessionUser._id, postId, sortType);
        return res.redirect(`/fullpost/${postId}`);
      } else {
        sortType = await getCommentSortType(sessionUser._id, postId);
      }
    } else {
      sortType = req.query.sort || "newest";
    }

    let errorMessage = null;
    if (req.query.error === 'empty_comment') {
      errorMessage = "Comment cannot be empty.";
    }

    const [post, comments] = await Promise.all([
      getPostById(postId, sessionUser),
      getAllCommentsByPostId(postId, sessionUser, sortType)
    ]);

    res.render("fullpost", {
      post,
      comments,
      sessionUser,
      isFullPost: true,
      onlyBookmarks: false,
      currentSort: sortType,
      errorMessage
    });
  } catch (err) {
    console.error("Error: ", err);
    return res
      .status(500)
      .render("error", { sessionUser, error: "Could not render post" });
  }
};

exports.handlePostComment = async (req, res) => {
  // post comment
  const sessionUser = req.session.sessionUser || {};

  try {
    const postId = req.params.postId;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      if (sessionUser && sessionUser._id) {
        return res.redirect(`/fullpost/${postId}?error=empty_comment#comment-section`);
      }

      // TODO: show error in fullpost page (can be trigger by commenting "    " spaces)
      // return res.status(400).render('error', { sessionUser, error: "Comment text is required." });

      // return res.status(400).send("Comment text is required.");
    }

    const newComment = new Comment({
      postId: postId,
      userId: sessionUser._id,
      text: text.trim(),
    });

    await newComment.save();

    await Post.findByIdAndUpdate(postId, {
      $inc: { comment_count: 1 },
    });

    return res.redirect(`/fullpost/${postId}#comment-section`);
  } catch (err) {
    console.error("Error posting comment: ", err);
    return res
      .status(500)
      .render("error", { sessionUser, error: "Could not upload comment" });
  }
};

