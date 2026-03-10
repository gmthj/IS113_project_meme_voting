// Loading of the upload page
exports.renderUploadPage = (req, res) => {
    res.render('upload', {error:null,success:false})
}


// Handle Submission to Mongo DB 
exports.renderUploadPage_Mongo = (req, res) => {

    const { meme_title, description, image_base64 } = req.body;

    // console.log("title:", meme_title);
    // console.log("description:", description);
    // console.log("image exists:", !!image_base64);

    if (!meme_title || !description || !image_base64) {
        return res.render("upload", {
            error: "All fields are required",success:false
        });
    }

    res.render('upload', {error:null,success:true})
};