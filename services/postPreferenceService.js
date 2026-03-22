const PostPreference = require("../models/Post-Preference-model");



async function getPostSortType(userId, page) {
  const postPreference = await PostPreference.findOne({userId: userId, page: page}).lean();

  return postPreference.sortType;
}

async function updatePostSortType(userId, page) {

}

async function deletePostSortType(userId, page) {

}




module.exports = {
  getPostSortType,
  updatePostSortType,
  deletePostSortType,
};


