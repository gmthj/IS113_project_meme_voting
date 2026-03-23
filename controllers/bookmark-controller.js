const { getBookmarkValue, addBookmark, removeBookmark } = require('../services/bookmarkService')

// maybe ill call it handleBookmark
exports.hellokinyu = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    const postId = req.body.postId
    const userId = sessionUser._id

    // console.log("userId:", userId)

    try {
        let isBookmarkAdded = await getBookmarkValue(postId, userId)
        console.log("Is bookmark added?", isBookmarkAdded)

        // If bookmark does not exist
        if (!isBookmarkAdded) {
            // create bookmark
            let result = await addBookmark(postId, userId)
            console.log("Creation Result:", result)

        } else {
            // delete bookmark
            let result = await removeBookmark(postId, userId)
            console.log("Deletion Result:", result)
        }

    } catch (error) {
        console.log("Error creating/removing bookmark", error)
    }

    const backURL = req.get('Referrer') || '/';
    res.redirect(`${backURL}#post-${postId}`)
}
