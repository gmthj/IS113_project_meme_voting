const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    data: {
      type: Buffer,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    sizeBytes: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Image", ImageSchema);

