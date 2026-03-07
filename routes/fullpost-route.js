const express = require('express')
const router = express.Router()
const fullpostController = require('../controllers/fullpost-controller')

// =========================

// /fullpost
router.get('/', fullpostController.getFullPost)

// /fullpost/comment
router.post('/comment', fullpostController.postComment)

// =========================

module.exports = router