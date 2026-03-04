const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    value: { type: Boolean, required: true }, // true=upvote, false=downvote
  },
  { versionKey: false },
);

// IMPORTANT: one vote per user per post
VoteSchema.index({ postId: 1, userId: 1 }, { unique: true });

// Useful for analytics / recounting
VoteSchema.index({ postId: 1 });

module.exports = mongoose.model("Vote", VoteSchema);
