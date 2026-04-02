const mongoose = require("mongoose");
const Image = require("../models/Image-model");

exports.getImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).send("Invalid image id");
    }

    const imageDoc = await Image.findById(imageId).select("data mimeType");
    if (!imageDoc) {
      return res.status(404).send("Image not found");
    }

    let imageBuffer = imageDoc.data;
    // defensive conversion in case data is returned as a plain object shape.
    if (
      !Buffer.isBuffer(imageBuffer) &&
      imageBuffer?.type === "Buffer" &&
      Array.isArray(imageBuffer.data)
    ) {
      imageBuffer = Buffer.from(imageBuffer.data);
    }

    if (!Buffer.isBuffer(imageBuffer)) {
      return res.status(500).send("Invalid image data");
    }

    res.set("Content-Type", imageDoc.mimeType || "application/octet-stream");
    res.set("Cache-Control", "public, max-age=86400");
    return res.send(imageBuffer);
  } catch (error) {
    console.error("Image fetch error:", error);
    return res.status(500).send("Image fetch failed");
  }
}
