const express = require('express')
const router = express.Router()
const fullpostController = require('../controllers/fullpost-controller')
const authMiddleware = require('../middleware/auth-middleware')


// =========================

// /fullpost
router.get('/:postId', fullpostController.getFullPost)

// /fullpost/comment
router.post('/:postId/comment', authMiddleware.isLoggedIn, fullpostController.postComment)

// /fullpost/comment/:commentId/edit
// router.post('/:postId/comment', authMiddleware.isAuthor, fullpostController.postComment)

// =========================

module.exports = router