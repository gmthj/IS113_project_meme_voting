const express = require('express')
const router = express.Router()
const voteController = require('../controllers/vote-controller')

// =========================


// /vote
router.post('/', voteController.handleVote)





// =========================

module.exports = router