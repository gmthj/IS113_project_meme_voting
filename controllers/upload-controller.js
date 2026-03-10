const POST_SCHEMA = require("../models/Post-model");

// Loading of the upload page
exports.renderUploadPage = (req, res) => {
  const sessionUser = req.session.sessionUser || {};
  console.log("Session User in renderUploadPage:", sessionUser);
  res.render("upload", { error: null, success: false, sessionUser });
};

// Handle Submission to Mongo DB
// POST upload
exports.renderUploadPage_Mongo = async (req, res) => {
  const sessionUser = req.session.sessionUser || {};
  try {
    const { meme_title, description, image_base64 } = req.body;

    // console.log("Data received:", req.body);

    if (!meme_title || !description || !image_base64) {
      return res.render("upload", {
        error: "All fields are required",
        success: false,
        sessionUser,
      });
    }
    console.log(
      "Received data - Title:",
      meme_title,
      "Description:",
      description,
      "user:",
      sessionUser,
    );

    const newPost = new POST_SCHEMA({
      userId: sessionUser._id,
      title: meme_title,
      description: description,
      image: image_base64,
    });

    await newPost.save();

    return res.render("upload", {
      error: null,
      success: true,
      sessionUser,
    });
  } catch (err) {
    console.error("Upload error:", err);

    return res.render("upload", {
      error: "Failed to upload post",
      success: false,
      sessionUser,
    });
  }
};
