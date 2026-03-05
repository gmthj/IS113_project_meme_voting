const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    image: { type: String, required: true, trim: true }, // URL or file path

    vote_score: { type: Number, default: 0 },
    comment_count: { type: Number, default: 0 },

    upload_datetime: { type: Date, default: Date.now },
    edit_datetime: { type: Date, default: null },
  },
  { versionKey: false },
);

// For sorting by newest, and user profile posts
PostSchema.index({ upload_datetime: -1 });
PostSchema.index({ userId: 1, upload_datetime: -1 });

// Optional: for “top posts” sorting
PostSchema.index({ vote_score: -1, upload_datetime: -1 });

module.exports = mongoose.model("Post", PostSchema, "posts");
