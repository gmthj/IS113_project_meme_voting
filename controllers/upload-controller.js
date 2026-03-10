const POST_SCHEMA = require("../models/Post-model")

// Loading of the upload page
exports.renderUploadPage = (req, res) => {
    res.render('upload', {error:null,success:false})
}


// Handle Submission to Mongo DB 
// POST upload
exports.renderUploadPage_Mongo = async (req, res) => {
  try {
    const { meme_title, description, image_base64 } = req.body;

    // console.log("Data received:", req.body);

    if (!meme_title || !description || !image_base64) {
      return res.render("upload", {
        error: "All fields are required",
        success: false,
      });
    }

    // Replace this with actual logged-in user id
    const dummyUserId = "69a879e26f21b8fb7da30941";

    const newPost = new POST_SCHEMA({
      userId: dummyUserId,
      title: meme_title,
      description: description,
      image: image_base64,
    });

    await newPost.save();

    
    return res.render("upload", {
      error: null,
      success: true,
    });
  } catch (err) {
    console.error("Upload error:", err);

    return res.render("upload", {
      error: "Failed to upload post",
      success: false,
    });
  }
};