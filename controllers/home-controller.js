// // exports.renderHome = (req, res) => {
// //     res.render('home', {})
// // }


// const { getAllPosts } = require("../services/postService");


// exports.renderHome = async (req, res) => {
//     // sort/filter posts
//     const posts = await getAllPosts();
//     // console.log(posts)
//     res.render('home', {posts})

// }

const { getAllPosts } = require("../services/postService");

exports.renderHome = async (req, res) => {
<<<<<<< HEAD
    try {
        // Get the sort type from the URL (e.g., /home?sort=newest)
        const sortType = req.query.sort || 'highest'; 
        
        // Fetch posts (you might need to update getAllPosts to accept sortType)
        const posts = await getAllPosts(sortType);
        
        // Get user from session (Zhiyu should be setting this during login)
        const user = req.session.user || null;
=======
    const sessionUser = req.session.sessionUser || {};
    // sort/filter posts
    // req.session.visit_count = req.session.visit_count + 1 || 1;
    // console.log("vivist", req.session.visit_count)
    const posts = await getAllPosts(sessionUser);
    // console.log(posts)
    res.render('home', {posts, sessionUser})
>>>>>>> 112a76e8974af3150b5001d8f1f701e962e1a5a8

        res.render('home', { 
            posts: posts, 
            user: user,
            currentSort: sortType 
        });
    } catch (error) {
        console.error("Error rendering home:", error);
        res.status(500).render('error', { error: "Could not load posts" });
    }
};