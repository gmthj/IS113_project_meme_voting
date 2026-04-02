const { getBookmarkValue, addBookmark, removeBookmark } = require('../services/bookmarkService')

exports.handleBookmark = async (req, res) => {
    const sessionUser = req.session.sessionUser || {};
    const postId = req.body.postId
    const userId = sessionUser._id

    // console.log("userId:", userId)

    try {
        let isBookmarkAdded = await getBookmarkValue(postId, userId)
        // console.log("Does bookmark exist?", isBookmarkAdded)

        // If bookmark does not exist
        if (!isBookmarkAdded) {
            // create bookmark
            let result = await addBookmark(postId, userId)
            
            // if (result && result._id) {
            //     console.log("Bookmark creation success!")
            // } else {
            //     console.log("Bookmark craetion failed!")
            // }

        } else {
            // delete bookmark
            let result = await removeBookmark(postId, userId)

            // if (result.deletedCount === 1) {
            //     console.log("Bookmark deletion success!")
            // } else {
            //     console.log("Bookmark deletion failed!")
            // }
        }
    } catch (error) {
        console.log("Error creating/removing bookmark", error)
    }

    const backURL = req.get('Referrer') || '/';
    res.redirect(`${backURL}#post-${postId}`)
}
