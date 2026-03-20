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

const { getAllPostsSorted } = require("../services/postService");

exports.renderHome = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    try {
        // Get the sort type from the URL (e.g., /home?sort=newest)
        const sortType = req.query.sort || 'highest'; 
        
        // Fetch posts (you might need to update getAllPostsSorted to accept sortType)
        const posts = await getAllPostsSorted(sortType, sessionUser);
        
        res.render('home', { 
            posts: posts, 
            currentSort: sortType,
            sessionUser
        });
    } catch (error) {
        console.error("Error rendering home:", error);
        res.status(500).render('error', { error: "Could not load posts" });
    }
};