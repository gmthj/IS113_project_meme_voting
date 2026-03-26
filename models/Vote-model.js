const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null
  },
  value: { type: Boolean, required: true },
});


VoteSchema.pre("validate", function () {
  const hasPost = this.postId != null;
  const hasComment = this.commentId != null;
  if (hasPost === hasComment) {
    throw new Error("Vote must have: userId AND (postId OR commentId)");
  }
});


VoteSchema.index({ postId: 1, userId: 1 }, { unique: true, sparse: true });
VoteSchema.index({ commentId: 1, userId: 1 }, { unique: true, sparse: true });


module.exports = mongoose.model("Vote", VoteSchema);
