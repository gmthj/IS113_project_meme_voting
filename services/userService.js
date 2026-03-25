const User = require("../models/User-model");

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  const user = await User.findOne({ email: email });

  if (!user) {
    // throw new Error(`User with email "${email}" not found`);
    return {}
  }

  return user;
}

async function getUserById(id) {
  const user = await User.findById(id);
  return user;
}

async function getSortPreference(userId) {
    const user = await User.findById(userId).lean();
    return user?.sortPreference || 'highest-votes';
}

async function saveSortPreference(userId, sortType) {
    await User.findByIdAndUpdate(userId, { sortPreference: sortType });
}

async function deleteSortPreference(userId) {
    await User.findByIdAndUpdate(userId, { $unset: { sortPreference: "" } });
}


module.exports = {
  getUserByEmail,
  getUserById,
  getSortPreference,
  saveSortPreference,
  deleteSortPreference
};
