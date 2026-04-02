const { getPosts } = require("../services/postService");
const {
  getPostSortType,
  createPostSortType,
  updatePostSortType,
  deletePostSortType,
} = require("../services/postPreferenceService");

const { POSTS_PER_PAGE } = require("../config");

exports.renderHome = async (req, res) => {
  // console.log(req.session)
  const sessionUser = req.session.sessionUser || {};
  // console.log(sessionUser)

  try {
    // Handle annon
    let isAnnon =
      req.query.annon == "true" || (sessionUser && sessionUser.annon);
    if (req.query.annon == "true") req.session.sessionUser = { annon: true };

    // access bookmark query
    const onlyBookmarks = req.query.bookmark === "true";
    const page = parseInt(req.query.page, 10) || 1;

    // Determine sorting type
    let sortType;
    if (sessionUser && sessionUser._id) {
      if (req.query.sort) {
        sortType = req.query.sort;

        // Check if there is already a sortPreference
        const existing = await getPostSortType(sessionUser._id, "home");
        // console.log("existing", existing)

        if (existing) {
          await updatePostSortType(sessionUser._id, "home", sortType); // UPDATE the preference
        } else {
          await createPostSortType(sessionUser._id, "home", sortType); // CREATE a preference
        }
        // const bookmarkQuery = onlyBookmarks ? '?bookmark=true' : '';
        // return res.redirect(`/home${bookmarkQuery}`);
      } else {
        // READ the saved preference
        sortType = await getPostSortType(sessionUser._id, "home");
      }
    } else {
      sortType = req.query.sort || "highest-votes";
    }

    // get posts using getPosts, change limit to set the number of posts per page
    const { posts, currentPage, totalPages } = await getPosts({
      sessionUser,
      onlyBookmarks,
      sortType,
      limit: POSTS_PER_PAGE,
      page,
      returnMeta: true,
    });

    // bookmark error validation
    let bookmarkError = null;
    if (onlyBookmarks) {
      // case 1: user not logged in
      if (!sessionUser || !sessionUser._id) {
        bookmarkError = "You must be logged in to view bookmarked posts.";
      }

      // case 2: user logged in but no bookmarks
      else if (posts.length === 0) {
        bookmarkError = "You have no bookmarked posts.";
      }
    }

    // this is essential for loading bookmark posts for anom
    if (onlyBookmarks && (!sessionUser || !sessionUser._id)) {
      return res.render("home", {
        posts: [],
        currentSort: sortType,
        currentPage: 1,
        totalPages: 1,
        sessionUser,
        isAnnon,
        isFullPost: false,
        onlyBookmarks,
        bookmarkError,
      });
    }

    res.render("home", {
      posts,
      currentSort: sortType,
      currentPage,
      totalPages,
      sessionUser,
      isAnnon,
      isFullPost: false,
      onlyBookmarks,
      bookmarkError,
    });
  } catch (error) {
    console.error("Error rendering home:", error);
    res
      .status(500)
      .render("error", { sessionUser, error: "Could not load posts" });
    sessionUser;
  }
};

// DELETE the sort preference
exports.resetSort = async (req, res) => {
  const sessionUser = req.session.sessionUser || null;
  const redirectUrl = req.query.redirect || "/home";

  try {
    if (sessionUser && sessionUser._id) {
      await deletePostSortType(sessionUser._id, "home");
    }
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error resetting sort:", error);
    res.status(500).render("error", {
      sessionUser,
      error: "Could not reset sort preference",
    });
    sessionUser;
  }
};
