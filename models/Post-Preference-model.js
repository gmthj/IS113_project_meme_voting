const mongoose = require('mongoose');

const postPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    page: {
      type: String,
      enum: ['home', 'user-posts', 'user-bookmarks'],
      required: true
    },
    sortType: {
      type: String,
      enum: ['newest', 'oldest', 'highest-votes', 'lowest-votes', 'most-comments', 'least-comments', 'bookmarks'],
      default: 'highest-votes'
    }
  }
);

postPreferenceSchema.index({ userId: 1, page: 1 }, { unique: true });

module.exports = mongoose.model('PostPreference', postPreferenceSchema);

