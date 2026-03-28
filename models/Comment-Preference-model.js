const mongoose = require('mongoose');

const commentPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    sortType: {
      type: String,
      enum: ['newest', 'oldest', 'highest-votes', 'lowest-votes'],
      default: 'newest'
    }
  }
);

commentPreferenceSchema.index({ userId: 1, postId: 1 }, { unique: true });

module.exports = mongoose.model('CommentPreference', commentPreferenceSchema);