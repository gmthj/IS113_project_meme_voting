module.exports = {
  // server
  PORT: 8000,
  HOSTNAME: "localhost",

  // account
  MIN_AGE: 18,

  // password requirements
  PW_MIN_LENGTH: 8,
  PW_REQUIRE_UPPER: true,
  PW_REQUIRE_LOWER: true,
  PW_REQUIRE_NUMBER: true,
  PW_REQUIRE_SPECIAL: true,

  // karma tiers
  KARMA_TIER_0: -5, // Troller
  KARMA_TIER_1: 10, // Lurker
  KARMA_TIER_2: 50, // Apprentice
  KARMA_TIER_3: 100, // Master
  // KARMA_TIER_4: > 100, // Legend
  KARMA_NEW: 30, //(days) Newcomer

  // voting weight
  POST_WEIGHT: 2,
  COMMENT_WEIGHT: 1,

  VOTE_WEIGHTS: {
    Troller: 0,
    Unknown: 1,
    Newcomer: 1,
    Lurker: 1,
    Apprentice: 2,
    Master: 3,
    Legend: 5,
  },

  // Post Per Page
  POSTS_PER_PAGE: 10,
};
