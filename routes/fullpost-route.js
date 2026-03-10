const express = require('express')
const router = express.Router()
const fullpostController = require('../controllers/fullpost-controller')
const authMiddleware = require('../middleware/auth-middleware')


// =========================

// /fullpost
router.get('/:postId', fullpostController.getFullPost)
// router.get('/:postId', authMiddleware.isLoggedIn, fullpostController.getFullPost)

// /fullpost/comment
router.post('/comment', authMiddleware.isLoggedIn, fullpostController.postComment)

// =========================

module.exports = router