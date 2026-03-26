const PostPreference = require("../models/Post-Preference-model");

// get saved sort preference
async function getPostSortType(userId, page) {
    const postPreference = await PostPreference.findOne({ userId, page }).lean();
    return postPreference?.sortType || 'highest-votes';
}

// only if preference doesn't exist yet then create
async function createPostSortType(userId, page, sortType) {
    const newPreference = await PostPreference.create({ userId, page, sortType });
    return newPreference;
}

// only if preference already exists then update if needed
async function updatePostSortType(userId, page, sortType) {
    await PostPreference.findOneAndUpdate(
        { userId, page },
        { sortType }
    );
}

// remove sortPreference entirely
async function deletePostSortType(userId, page) {
    await PostPreference.deleteOne({ userId, page });
}

module.exports = {
    getPostSortType,
    createPostSortType,
    updatePostSortType,
    deletePostSortType
};


