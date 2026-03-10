// exports.renderHome = (req, res) => {
//     res.render('home', {})
// }


const { getAllPosts } = require("../services/postService");


exports.renderHome = async (req, res) => {
    // sort/filter posts
    const posts = await getAllPosts();
    // console.log(posts)
    res.render('home', {posts})

}