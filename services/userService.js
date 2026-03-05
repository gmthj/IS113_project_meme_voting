const User = require("../models/User-model");

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  const user = await User.findOne({ email: email });

  if (!user) {
    throw new Error(`User with email "${email}" not found`);
  }

  return user;
}

module.exports = {
  getUserByEmail,
};
