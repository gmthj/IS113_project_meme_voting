// Import user service
const User = require('./../services/userService')

// Import post service
const { getAllPostsSorted, getPostById, getPostsByUserId } = require('../services/postService')
const PostPreference = require("../models/Post-Preference-model");

const { getPostSortType, createPostSortType, updatePostSortType, deletePostSortType } = require("../services/postPreferenceService");

exports.renderUserProfile = async (req, res) => {

    const sessionUser = req.session.sessionUser || {};
    const userId = req.params.userId;

    try {
        let sortType;

        if (sessionUser && sessionUser._id) {

            if (req.query.sort) {
                sortType = req.query.sort;

                const existing = await PostPreference.findOne({
                    userId: sessionUser._id,
                    page: 'home'
                }).lean();

                if (existing) {
                    await updatePostSortType(sessionUser._id, 'home', sortType);
                } else {
                    await createPostSortType(sessionUser._id, 'home', sortType);
                }

                return res.redirect(`/user/${userId}`);
            } else {
                sortType = await getPostSortType(sessionUser._id, 'home');
            }

        } else {
            sortType = req.query.sort || 'highest-votes';
        }

        const userInfo = await User.getUserById(userId);

        // IMPORTANT: Pass sortType here
        const userPost = await getAllPostsSorted(sortType, sessionUser, { userId })

        res.render('user', {
            sessionUser,
            userInfo,
            userPost,
            currentSort: sortType
        });

    } catch (error) {
        console.log("Error renderUserProfile:", error);
        return res.render('error', { sessionUser, error });
    }
};