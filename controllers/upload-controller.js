const POST_SCHEMA = require("../models/Post-model");
const { getPostById } = require("../services/postService");

// Shared helper to validate base64 image
function validateBase64Image(image_base64) {
  if (!image_base64) {
    return "Image is required";
  }

  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp"
    // "image/svg+xml" // only add this if you really want SVG support
  ];

  const mimeMatch = image_base64.match(/^data:(.*?);base64,/);

  if (!mimeMatch) {
    return "Invalid image format";
  }

  const mimeType = mimeMatch[1];

  if (!allowedMimeTypes.includes(mimeType)) {
    return "Only JPG, PNG, GIF, and WEBP files are allowed";
  }

  try {
    const base64Data = image_base64.split(",")[1];
    const fileSizeInBytes = Buffer.from(base64Data, "base64").length;
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

    if (fileSizeInBytes > maxSizeInBytes) {
      return "Image must be smaller than 2MB";
    }
  } catch (err) {
    return "Invalid image data";
  }

  return null;
}

// Loading of the upload page
exports.renderUpload = (req, res) => {
  const sessionUser = req.session?.sessionUser || {};

  res.render("upload", {
    error: null,
    success: false,
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
        sessionUser
      });
    }

    const imageError = validateBase64Image(image_base64);
    if (imageError) {
      return res.render("upload", {
        error: imageError,
        success: false,
        sessionUser
      });
    }

    const newPost = new POST_SCHEMA({
      userId: sessionUser._id,
      title: meme_title.trim(),
      description: description.trim(),
      image: image_base64
    });

    await newPost.save();

    return res.render("upload", {
      error: null,
      success: true,
      sessionUser
    });
  } catch (err) {
    console.error("Upload error:", err);

    return res.render("upload", {
      error: "Failed to upload post",
      success: false,
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

    if (!meme_title || !description || !image_base64) {
      return res.render("edit-post", {
        error: "All fields are required",
        success: false,
        sessionUser,
        postData,
        backURL
      });
    }

    const imageError = validateBase64Image(image_base64);
    if (imageError) {
      return res.render("edit-post", {
        error: imageError,
        success: false,
        sessionUser,
        postData,
        backURL
      });
    }

    postData.title = meme_title.trim();
    postData.description = description.trim();
    postData.image = image_base64;
    postData.edit_datetime = new Date();

    await postData.save();

    return res.redirect(`${backURL}#post-${postId}`);
  } catch (err) {
    console.error("Edit post error:", err);

    let postData = null;
    try {
      postData = await POST_SCHEMA.findById(postId);
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