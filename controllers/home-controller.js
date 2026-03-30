const PostPreference = require("../models/Post-Preference-model");

const { getAllPostsSorted, getBookmarkedPosts } = require("../services/postService");
const { getPostSortType, createPostSortType, updatePostSortType, deletePostSortType } = require("../services/postPreferenceService");

exports.renderHome = async (req, res) => {
    const sessionUser = req.session.sessionUser || null;

    try {
        let sortType;

        if (sessionUser && sessionUser._id) {
            if (req.query.sort) {
                sortType = req.query.sort;

                // Check if there is already a sortPreference
                const existing = await PostPreference.findOne({ 
                    userId: sessionUser._id, 
                    page: 'home' 
                }).lean();

                if (existing) {
                    await updatePostSortType(sessionUser._id, 'home', sortType); // UPDATE the preference
                } else {
                    await createPostSortType(sessionUser._id, 'home', sortType); // CREATE a preference
                }
                return res.redirect('/home');
            } else {
                // READ the saved preference
                sortType = await getPostSortType(sessionUser._id, 'home');
            }
        } else {
            sortType = req.query.sort || 'highest-votes';
        }

        let posts = [];
        if (sortType === 'bookmarks' && sessionUser) {
            posts = await getBookmarkedPosts(sessionUser);
        } else if (sessionUser) {
            posts = await getAllPostsSorted(sortType, sessionUser);
        }

        res.render('home', { posts, currentSort: sortType, sessionUser });

    } catch (error) {
        console.error("Error rendering home:", error);
        res.status(500).render('error', { sessionUser, error: "Could not load posts" });
        sessionUser;
    }
};

// DELETE the sort preference
exports.resetSort = async (req, res) => {
    const sessionUser = req.session.sessionUser || null;
    try {
        if (sessionUser && sessionUser._id) {
            await deletePostSortType(sessionUser._id, 'home'); 
        }
        res.redirect('/home');
    } catch (error) {
        console.error("Error resetting sort:", error);
        res.status(500).render('error', { sessionUser, error: "Could not reset sort preference" });
        sessionUser;
    }
};