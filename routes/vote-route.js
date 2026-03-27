const express = require('express')
const router = express.Router()
const voteController = require('../controllers/vote-controller')
const authMiddleware = require('../middleware/auth-middleware')

// =========================


// /vote
router.post('/', authMiddleware.isLoggedIn, voteController.handlePostVote);
// router.post('/', voteController.handlePostVote)

router.post('/comment', authMiddleware.isLoggedIn, voteController.handleCommentVote);




// =========================

module.exports = router