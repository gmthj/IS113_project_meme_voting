// exports.renderHome = (req, res) => {
//     res.render('home', {})
// }


const { getAllPosts } = require("../services/postService");


exports.renderHome = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    // sort/filter posts
    // req.session.visit_count = req.session.visit_count + 1 || 1;
    // console.log("vivist", req.session.visit_count)
    const posts = await getAllPosts();
    // console.log(posts)
    res.render('home', {posts, sessionUser})

}