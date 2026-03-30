const POST_SCHEMA = require("../models/Post-model");
const { getPostById } = require('../services/postService')

// Loading of the upload page
exports.renderUpload = (req, res) => {
  const sessionUser = req.session.sessionUser || {};
  console.log("Session User in renderUploadPage:", sessionUser);
  res.render("upload", { error: null, success: false, sessionUser });
};

// Handle Submission to Mongo DB
// POST upload
exports.handleUpload = async (req, res) => {
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



exports.renderEditPost = async (req, res) => {
  const sessionUser = req.session.sessionUser || {};
  const backURL = req.get('Referrer') || '/';
  console.log(backURL,"reder edit")
  const postId = req.body.postId;

  // Fetch post 

  const postData = await getPostById(postId, sessionUser)
  // console.log(postData)
  console.log("handleUploadEdit")


  // console.log(req.body)
  // console.log("Session User in renderUploadPage:", sessionUser);
  res.render("edit-post", { error: null, success: false, sessionUser, postData, backURL});
};


// This is a post request to handle update post data route
exports.handleEditPost = async (req, res) => {
  const sessionUser = req.session.sessionUser || {};
  const backURL = req.body.backURL;
  const postId = req.body.postId;

  // Fetch post 
  console.log("Update Post Data Called")
  const { meme_title, description, image_base64 } = req.body;
  const postData = await POST_SCHEMA.findById(postId)
    postData.title = meme_title;
    postData.description = description;
    postData.image = image_base64;
    postData.edit_datetime = new Date();

    await postData.save();


  // console.log(req.body)
  // console.log("Session User in renderUploadPage:", sessionUser);
  // res.render("edit-post", { error: null, success: false, sessionUser });
  res.redirect(`${backURL}#post-${postId}`)
};
