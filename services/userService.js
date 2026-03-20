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


module.exports = {
  getUserByEmail,
  getUserById
};
