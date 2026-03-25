const { getAllPostsSorted, getBookmarkedPosts } = require("../services/postService");
const { getSortPreference, saveSortPreference, deleteSortPreference} = require("../services/userService");

exports.renderHome = async (req, res) => {
    const sessionUser = req.session.sessionUser || null;

    try {
        let sortType;

        if (sessionUser && sessionUser._id) {
            if (req.query.sort) {
                // When user clicked a sort link, it will CREATE or UPDATE preference in DB
                sortType = req.query.sort;
                await saveSortPreference(sessionUser._id, sortType);
            } else {
                // No sort in URL then it READ their saved preference from DB
                sortType = await getSortPreference(sessionUser._id);
            }
        } else {
            // default
            sortType = req.query.sort || 'highest-votes';
        }

        let posts = [];
        if (sortType === 'bookmarks' && sessionUser) {
            posts = await getBookmarkedPosts(sessionUser);
        } else if (sessionUser) {
            posts = await getAllPostsSorted(sortType, sessionUser);
        }

        res.render('home', {
            posts,
            currentSort: sortType,
            sessionUser
        });
    } catch (error) {
        console.error("Error rendering home:", error);
        res.status(500).render('error', { error: "Could not load posts" });
    }
};

// DELETE sort preference
exports.resetSort = async (req, res) => {
    const sessionUser = req.session.sessionUser || null;
    try {
        if (sessionUser && sessionUser._id) {
            await deleteSortPreference(sessionUser._id); // DELETE from DB
        }
        res.redirect('/home');
    } catch (error) {
        console.error("Error resetting sort:", error);
        res.status(500).render('error', { error: "Could not reset sort preference" });
    }
};