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
  }
);

VoteSchema.index({ postId: 1, userId: 1 }, { unique: true });


module.exports = mongoose.model("Vote", VoteSchema);
