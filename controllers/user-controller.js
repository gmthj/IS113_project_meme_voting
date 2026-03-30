// Import user service
const User = require('./../services/userService')

// Import post service
const { getAllPostsSorted, getPostById, getPostsByUserId, getPosts } = require('../services/postService')
const PostPreference = require("../models/Post-Preference-model");

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
                const existing = await PostPreference.findOne({
                    userId: sessionUser._id,
                    page: 'home'
                }).lean();

                if (existing) {
                    await updatePostSortType(sessionUser._id, 'home', sortType);
                } else {
                    await createPostSortType(sessionUser._id, 'home', sortType);
                }
            } else {
                sortType = await getPostSortType(sessionUser._id, 'home');
            }

        } else {
            sortType = req.query.sort || 'highest-votes';
        }

        // get user info
        const userInfo = await User.getUserById(userId);

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
                bookmarkError = "You have no bookmarked posts.";
            }
        }

        // this is essential for loading bookmark posts for anom
        if (onlyBookmarks && (!sessionUser || !sessionUser._id)) {
            return res.render('user', {
                sessionUser,
                userInfo,
                userPosts: [],
                currentSort: sortType,
                onlyBookmarks,
                bookmarkError
            });
        }

        res.render('user', {
            sessionUser,
            userInfo,
            userPosts,
            currentSort: sortType,
            onlyBookmarks,
            bookmarkError
        });

    } catch (error) {
        console.log("Error renderUserProfile:", error);
        return res.render('error', { sessionUser, error });
    }
};