const POST_SCHEMA = require("../models/Post-model");
const IMAGE_SCHEMA = require("../models/Image-model");
const { getPostById } = require("../services/postService");

// Shared helper to validate and parse base64 image
function parseBase64Image(image_base64) {
  if (!image_base64) {
    return { error: "Image is required" };
  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml"
  ];

  const mimeMatch = image_base64.match(/^data:(.*?);base64,/);

  if (!mimeMatch) {
    return { error: "Invalid image format" };
  }

  const mimeType = mimeMatch[1];

  if (!allowedMimeTypes.includes(mimeType)) {
    return { error: "Only JPG, PNG, GIF, and WEBP files are allowed" };
  }

  try {
    const base64Data = image_base64.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    const fileSizeInBytes = buffer.length;
    const maxSizeInBytes = 8 * 1024 * 1024; // 8MB

    if (fileSizeInBytes > maxSizeInBytes) {
      return { error: "Image must be smaller than 8MB" };
    }

    return { mimeType, buffer, fileSizeInBytes };
  } catch (err) {
    return { error: "Invalid image data" };
  }
}

// Loading of the upload page
exports.renderUpload = (req, res) => {
  const sessionUser = req.session?.sessionUser || {};

  res.render("upload", {
    error: null,
    success: false,
    postId: null,
    sessionUser
  });
};

// Handle submission to MongoDB
exports.handleUpload = async (req, res) => {
  const sessionUser = req.session?.sessionUser || {};

  try {
    const { meme_title, description, image_base64 } = req.body;

    if (!meme_title || !description || !image_base64) {
      return res.render("upload", {
        error: "All fields are required",
        success: false,
        postId: null,
        sessionUser
      });
    }

    const parsedImage = parseBase64Image(image_base64);
    if (parsedImage.error) {
      return res.render("upload", {
        error: parsedImage.error,
        success: false,
        postId: null,
        sessionUser
      });
    }

    const savedImage = await IMAGE_SCHEMA.create({
      data: parsedImage.buffer,
      mimeType: parsedImage.mimeType,
      sizeBytes: parsedImage.fileSizeInBytes
    });

    const newPost = new POST_SCHEMA({
      userId: sessionUser._id,
      title: meme_title.trim(),
      description: description.trim(),
      imageId: savedImage._id
    });

    await newPost.save();

    return res.render("upload", {
      error: null,
      success: true,
      postId: newPost._id.toString(),
      sessionUser
    });
  } catch (err) {
    console.error("Upload error:", err);

    return res.render("upload", {
      error: "Failed to upload post",
      success: false,
      postId: null,
      sessionUser
    });
  }
};

// Render edit post page
exports.renderEditPost = async (req, res) => {
  const sessionUser = req.session?.sessionUser || {};
  const backURL = req.get("Referrer") || "/";
  const postId = req.body.postId;

  try {
    const postData = await getPostById(postId, sessionUser);

    if (!postData) {
      return res.redirect("/");
    }

    res.render("edit-post", {
      error: null,
      success: false,
      sessionUser,
      postData,
      backURL
    });
  } catch (err) {
    console.error("Render edit post error:", err);
    return res.redirect("/");
  }
};

// Handle update post data
exports.handleEditPost = async (req, res) => {
  const sessionUser = req.session?.sessionUser || {};
  const backURL = req.body.backURL || "/";
  const postId = req.body.postId;
  const { meme_title, description, image_base64 } = req.body;

  try {
    const postData = await POST_SCHEMA.findById(postId);

    if (!postData) {
      return res.redirect("/");
    }
    postData.image = postData.imageId ? `/media/images/${postData.imageId}` : postData.image;

    if (!meme_title || !description) {
      return res.render("edit-post", {
        error: "All fields are required",
        success: false,
        sessionUser,
        postData,
        backURL
      });
    }

    postData.title = meme_title.trim();
    postData.description = description.trim();

    // Replace image only when a new file is provided.
    if (image_base64) {
      const parsedImage = parseBase64Image(image_base64);
      if (parsedImage.error) {
        return res.render("edit-post", {
          error: parsedImage.error,
          success: false,
          sessionUser,
          postData,
          backURL
        });
      }

      const savedImage = await IMAGE_SCHEMA.create({
        data: parsedImage.buffer,
        mimeType: parsedImage.mimeType,
        sizeBytes: parsedImage.fileSizeInBytes
      });

      if (postData.imageId) {
        await IMAGE_SCHEMA.findByIdAndDelete(postData.imageId);
      }

      postData.imageId = savedImage._id;
      postData.image = null;
    }

    postData.edit_datetime = new Date();

    await postData.save();

    return res.redirect(`${backURL}#post-${postId}`);
  } catch (err) {
    console.error("Edit post error:", err);

    let postData = null;
    try {
      postData = await POST_SCHEMA.findById(postId);
      if (postData) {
        postData.image = postData.imageId ? `/media/images/${postData.imageId}` : postData.image;
      }
    } catch (innerErr) {
      console.error("Failed to reload post data:", innerErr);
    }

    return res.render("edit-post", {
      error: "Failed to update post",
      success: false,
      sessionUser,
      postData,
      backURL
    });
  }
};
