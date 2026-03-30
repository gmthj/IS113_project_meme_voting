const express = require('express')
const router = express.Router()
const fullpostController = require('../controllers/fullpost-controller')
const authMiddleware = require('../middleware/auth-middleware')


// =========================

// /fullpost
router.get('/:postId', fullpostController.renderFullPost)

// /fullpost/comment
router.post('/:postId/comment', authMiddleware.isLoggedIn, fullpostController.handlePostComment)

// /fullpost/comment/:commentId/edit
// router.post('/:postId/comment', authMiddleware.isAuthor, fullpostController.handlePostComment)

// =========================

module.exports = router