const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
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

    text: { type: String, required: true, trim: true },

    upload_datetime: { type: Date, default: Date.now },
    edit_datetime: { type: Date, default: null },
  },
  { versionKey: false },
);

// For viewing comments on a post (sorted)
CommentSchema.index({ postId: 1, upload_datetime: -1 });
CommentSchema.index({ userId: 1, upload_datetime: -1 });

module.exports = mongoose.model("Comment", CommentSchema);
