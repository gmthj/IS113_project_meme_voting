const { getUserById } = require('./../services/userService')
const { getPosts } = require('../services/postService')
const { getPostSortType, createPostSortType, updatePostSortType, deletePostSortType } = require("../services/postPreferenceService");

exports.renderUserProfile = async (req, res) => {

    const sessionUser = req.session.sessionUser || {};
    const userId = req.params.userId;

    try {
        // access bookmark query
        const onlyBookmarks = req.query.bookmark === 'true'

        // determine sorting type
        let sortType;

        if (sessionUser && sessionUser._id) {
            if (req.query.sort) {
                sortType = req.query.sort;

                // save the preference
                const existing = await getPostSortType(sessionUser._id, 'user');

                if (existing) {
                    await updatePostSortType(sessionUser._id, 'user', sortType);
                } else {
                    await createPostSortType(sessionUser._id, 'user', sortType);
                }
            } else {
                sortType = await getPostSortType(sessionUser._id, 'user');
            }

        } else {
            sortType = req.query.sort || 'highest-votes';
        }

        // get user info
        const userInfo = await getUserById(userId);

        // get posts using getPosts
        const userPosts = await getPosts({
            sessionUser,
            userId,
            onlyBookmarks,
            sortType
        });

        // set bookmarkerror
        let bookmarkError = null;
        if (onlyBookmarks) {
            // Case 1: Not logged in
            if (!sessionUser || !sessionUser._id) {
                bookmarkError = "You must be logged in to view bookmarked posts.";
            }

            // Case 2: Logged in but no bookmarks
            else if (userPosts.length === 0) {
                bookmarkError = `You have no bookmarked posts for ${userInfo.name}.`;
            }
        }

        // this is essential for loading bookmark posts for anom
        if (onlyBookmarks && (!sessionUser || !sessionUser._id)) {
            return res.render('user', {
                sessionUser,
                userInfo,
                userPosts: [],
                currentSort: sortType,
                isFullPost: false,
                onlyBookmarks,
                bookmarkError
            });
        }

        res.render('user', {
            sessionUser,
            userInfo,
            userPosts,
            currentSort: sortType,
            isFullPost: false,
            onlyBookmarks,
            bookmarkError
        });

    } catch (error) {
        console.log("Error renderUserProfile:", error);
        return res.render('error', { sessionUser, error });
    }
};

// same as in home-controller
exports.resetSort = async (req, res) => {
    const sessionUser = req.session.sessionUser || null;
    const redirectUrl = req.query.redirect || '/home'

    try {
        if (sessionUser && sessionUser._id) {
            await deletePostSortType(sessionUser._id, 'user');
        }
        res.redirect(redirectUrl);
    } catch (error) {
        console.error("Error resetting sort:", error);
        res.status(500).render('error', { sessionUser, error: "Could not reset sort preference" });
        sessionUser;
    }
};